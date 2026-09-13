import "server-only";

/**
 * Abstraction over the WhatsApp Business Cloud API. Phase 1: interface + stub
 * implementation only — no live send/receive yet (see docs/architecture.md).
 * Credentials come from env, never hardcoded (brief §19).
 */
export interface WhatsAppMessage {
  to: string; // E.164 phone number
  body: string;
}

export interface RfqAcknowledgement {
  rfqId: string;
  contactWhatsApp: string;
  contactName: string;
}

export interface WhatsAppService {
  sendRfqAcknowledgement(ack: RfqAcknowledgement): Promise<void>;
  notifySalesTeam(message: WhatsAppMessage): Promise<void>;
  // Phase 2: receiveIncoming(), routeConversation(), sendQuotationNotification()
}

class StubWhatsAppService implements WhatsAppService {
  async sendRfqAcknowledgement(ack: RfqAcknowledgement): Promise<void> {
    // Phase 1: no-op. Phase 2 will call the Cloud API using
    // WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN from env.
    console.info("[WhatsAppService] would acknowledge RFQ", ack.rfqId, "to", ack.contactName);
  }

  async notifySalesTeam(message: WhatsAppMessage): Promise<void> {
    console.info("[WhatsAppService] would notify sales team:", message.body);
  }
}

export function getWhatsAppService(): WhatsAppService {
  return new StubWhatsAppService();
}
