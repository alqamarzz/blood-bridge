import { NextRequest, NextResponse } from "next/server";
import {
  verifyWhatsAppWebhook,
  handleWhatsAppWebhookStatus,
} from "@/lib/whatsapp";

/**
 * Meta WhatsApp Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifiedChallenge = verifyWhatsAppWebhook(mode, token, challenge);

  if (verifiedChallenge) {
    return new Response(verifiedChallenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta WhatsApp Inbound Events & Status Notifications (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check entry structure for WhatsApp message status updates
    const entries = body.entry;
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        const changes = entry.changes;
        if (Array.isArray(changes)) {
          for (const change of changes) {
            const value = change.value;
            if (value?.statuses && Array.isArray(value.statuses)) {
              for (const statusObj of value.statuses) {
                await handleWhatsAppWebhookStatus(statusObj);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("WhatsApp webhook processing error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
