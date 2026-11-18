import { sendWhatsApp, WhatsAppMessagePayload, WhatsAppSendResult } from "@/lib/whatsapp";

/**
 * Service wrapper for WhatsApp notifications
 */
export async function sendWhatsAppNotification(
  payload: WhatsAppMessagePayload
): Promise<WhatsAppSendResult> {
  return sendWhatsApp(payload);
}
