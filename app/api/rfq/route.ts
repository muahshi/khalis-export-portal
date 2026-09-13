import { NextResponse } from "next/server";
import { rfqSubmissionSchema } from "@/features/rfq/schema";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getWhatsAppService } from "@/services/whatsapp/WhatsAppService";

/**
 * RFQ intake. Uses the service-role client (bypasses RLS by design — this is the
 * one sanctioned write path into rfqs/rfq_items, per docs/security.md). The
 * anon/client-side Supabase client never has insert access to these tables.
 *
 * All writes happen inside create_rfq_submission (supabase/migrations/0002_rfq_atomicity.sql),
 * a single Postgres function call, so a mid-flow failure cannot leave orphaned
 * company/contact/rfq rows (brief §6). Database and unexpected errors are logged
 * server-side only — the client never receives raw DB error text (brief §14).
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = rfqSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = getSupabaseServiceClient();

  const { data: rfqId, error } = await supabase.rpc("create_rfq_submission", {
    p_full_name: input.full_name,
    p_company_name: input.company_name,
    p_country: input.country,
    p_business_type: input.business_type,
    p_email: input.email,
    p_whatsapp: input.whatsapp ?? null,
    p_target_market: input.target_market ?? null,
    p_container_interest: input.container_interest ?? null,
    p_private_label_requirement: input.private_label_requirement ?? null,
    p_packaging_requirement: input.packaging_requirement ?? null,
    p_shipping_preference: input.shipping_preference ?? null,
    p_message: input.message ?? null,
    p_items: input.products,
  });

  if (error) {
    // Invalid product_id (FK violation), bad enum value, etc. land here.
    // Logged for the sales/ops team; the public response stays generic.
    console.error("[api/rfq] create_rfq_submission failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't submit your RFQ. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }

  // Acknowledgement is best-effort and non-critical — a failure here must not
  // fail an already-successful RFQ submission.
  if (input.whatsapp) {
    try {
      await getWhatsAppService().sendRfqAcknowledgement({
        rfqId: rfqId as string,
        contactWhatsApp: input.whatsapp,
        contactName: input.full_name,
      });
    } catch (ackError) {
      console.error("[api/rfq] WhatsApp acknowledgement failed:", ackError);
    }
  }

  return NextResponse.json({ rfqId }, { status: 201 });
}
