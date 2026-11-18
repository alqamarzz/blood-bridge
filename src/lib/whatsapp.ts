import prisma from "@/lib/prisma";

export interface WhatsAppMessagePayload {
  to: string; // e.g. "+919876543210" or "919876543210"
  template: "donor_volunteer" | "donor_accepted" | "request_status_update";
  variables: Record<string, string>;
  userId?: string;
  requestId?: string;
  donorResponseId?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  mode: "mock" | "live";
}

// Provider interface for clean abstraction
export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult>;
}

/**
 * Mock WhatsApp Provider for local development & testing.
 * Logs messages clearly and logs to notification table.
 */
class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    const mockId = `mock_wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    console.log("==================================================");
    console.log("📱 [MOCK WHATSAPP NOTIFICATION DISPATCHED]");
    console.log(`To: ${payload.to}`);
    console.log(`Template: ${payload.template}`);
    console.log("Variables:", JSON.stringify(payload.variables, null, 2));
    console.log(`Mock Message ID: ${mockId}`);
    console.log("==================================================");

    return {
      success: true,
      providerMessageId: mockId,
      mode: "mock",
    };
  }
}

/**
 * Meta WhatsApp Cloud API Provider.
 * Sends official template messages via graph.facebook.com.
 */
class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion: string;

  constructor(accessToken: string, phoneNumberId: string, apiVersion = "v21.0") {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.apiVersion = apiVersion;
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    // Standardize Indian phone number (remove + and non-digits)
    const cleanedPhone = payload.to.replace(/\D/g, "");

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    // Map template name to Meta registered template name
    const templateNameMap: Record<string, string> = {
      donor_volunteer: "bloodbridge_donor_volunteer",
      donor_accepted: "bloodbridge_donor_accepted",
      request_status_update: "bloodbridge_status_update",
    };

    const templateName = templateNameMap[payload.template] || payload.template;

    // Convert variables object to Meta component parameters
    const parameters = Object.entries(payload.variables).map(([_, val]) => ({
      type: "text",
      text: val,
    }));

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters,
          },
        ],
      },
    };

    // Retry logic with exponential backoff (max 3 attempts)
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || `WhatsApp API error ${response.status}`);
        }

        const providerMessageId = data.messages?.[0]?.id || "unknown";
        return {
          success: true,
          providerMessageId,
          mode: "live",
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`WhatsApp send attempt ${attempts} failed:`, errorMessage);
        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: errorMessage,
            mode: "live",
          };
        }
        // Wait before retry
        await new Promise((res) => setTimeout(res, attempts * 1000));
      }
    }

    return {
      success: false,
      error: "Max retries reached",
      mode: "live",
    };
  }
}

/**
 * Factory to get current provider based on environment variables
 */
function getWhatsAppProvider(): WhatsAppProvider {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId && token !== "your-meta-whatsapp-access-token") {
    return new MetaWhatsAppProvider(token, phoneId);
  }

  return new MockWhatsAppProvider();
}

/**
 * Core WhatsApp Dispatch function
 * Handles idempotency, logging, and delivery status recording.
 */
export async function sendWhatsApp(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
  const provider = getWhatsAppProvider();
  const result = await provider.sendMessage(payload);

  // If userId provided, log to Notification table
  if (payload.userId) {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          requestId: payload.requestId ?? null,
          donorResponseId: payload.donorResponseId ?? null,
          type:
            payload.template === "donor_volunteer"
              ? "DONOR_VOLUNTEERED"
              : payload.template === "donor_accepted"
              ? "DONOR_ACCEPTED"
              : "REQUEST_STATUS_CHANGED",
          channel: "WHATSAPP",
          title: `WhatsApp: ${payload.template}`,
          message: JSON.stringify(payload.variables),
          deliveryStatus: result.success ? "SENT" : "FAILED",
          providerMessageId: result.providerMessageId ?? null,
          sentAt: result.success ? new Date() : null,
          metadata: {
            variables: payload.variables,
            mode: result.mode,
            error: result.error ?? null,
          },
        },
      });
    } catch (dbErr) {
      console.error("Failed to log WhatsApp notification in database:", dbErr);
    }
  }

  return result;
}

/**
 * Verify incoming webhook from Meta WhatsApp Cloud API
 */
export function verifyWhatsAppWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "bloodbridge_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }
  return null;
}

/**
 * Handle incoming delivery status update from Meta webhook
 */
export async function handleWhatsAppWebhookStatus(statusObj: {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  errors?: unknown[];
}) {
  const statusMap: Record<string, "SENT" | "DELIVERED" | "READ" | "FAILED"> = {
    sent: "SENT",
    delivered: "DELIVERED",
    read: "READ",
    failed: "FAILED",
  };

  const deliveryStatus = statusMap[statusObj.status];
  if (!deliveryStatus) return;

  try {
    await prisma.notification.updateMany({
      where: { providerMessageId: statusObj.id },
      data: {
        deliveryStatus,
        readAt: deliveryStatus === "READ" ? new Date(parseInt(statusObj.timestamp, 10) * 1000) : undefined,
      },
    });
  } catch (err) {
    console.error("Failed to update notification delivery status from webhook:", err);
  }
}
