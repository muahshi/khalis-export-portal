import { NextResponse } from "next/server";

/**
 * WhatsApp Business Cloud API webhook — verification handshake only in Phase 1.
 * Incoming-message handling/routing is Phase 2 (services/whatsapp).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST() {
  // Phase 2: parse incoming message payloads and route via services/whatsapp
  return NextResponse.json({ received: true }, { status: 200 });
}
