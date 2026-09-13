"use client";
import { siteConfig } from "@/config/site";

/**
 * Persistent mobile CTA (brief §10). Not wired to a live WhatsApp deep link yet —
 * placeholder click handler until services/whatsapp is live in Phase 2.
 */
export function WhatsAppMobileCTA() {
  return (
    <button
      type="button"
      className="fixed inset-x-4 bottom-4 z-50 rounded-none bg-gold px-5 py-3 text-center text-sm uppercase tracking-wide text-charcoal-900 shadow-lg lg:hidden"
      onClick={() => {
        // Phase 2: deep link to wa.me/<verified export team number> via services/whatsapp
      }}
    >
      {siteConfig.cta.whatsapp.label}
    </button>
  );
}
