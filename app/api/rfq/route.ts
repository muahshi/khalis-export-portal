import { NextResponse } from "next/server";
import { rfqSubmissionSchema } from "@/features/rfq/schema";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getWhatsAppService } from "@/services/whatsapp/WhatsAppService";

/**
 * RFQ intake. Uses the service-role client (bypasses RLS by design — this is the
 * one sanctioned write path into rfqs/rfq_items, per docs/security.md). The
 * anon/client-side Supabase client never has insert access to these tables.
 */
export async function POST(request: Request) {
  const json = await request.json();
  const parsed = rfqSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = getSupabaseServiceClient();

  // 1. Upsert company + contact
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name: input.company_name, country: input.country, business_type: input.business_type })
    .select()
    .single();
  if (companyError) return NextResponse.json({ error: companyError.message }, { status: 500 });

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      company_id: company.id,
      full_name: input.full_name,
      email: input.email,
      whatsapp: input.whatsapp ?? null,
    })
    .select()
    .single();
  if (contactError) return NextResponse.json({ error: contactError.message }, { status: 500 });

  // 2. Create the RFQ
  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .insert({
      contact_id: contact.id,
      company_id: company.id,
      target_market: input.target_market ?? null,
      container_interest: input.container_interest ?? null,
      private_label_requirement: input.private_label_requirement ?? null,
      packaging_requirement: input.packaging_requirement ?? null,
      shipping_preference: input.shipping_preference ?? null,
      message: input.message ?? null,
    })
    .select()
    .single();
  if (rfqError) return NextResponse.json({ error: rfqError.message }, { status: 500 });

  // 3. RFQ line items
  if (input.products.length > 0) {
    const { error: itemsError } = await supabase.from("rfq_items").insert(
      input.products.map((p) => ({
        rfq_id: rfq.id,
        product_id: p.product_id,
        estimated_quantity: p.estimated_quantity ?? null,
        estimated_cartons: p.estimated_cartons ?? null,
      }))
    );
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 4. Default lead score — real scoring logic is Phase 2 (services/ai)
  await supabase.from("lead_scores").insert({ rfq_id: rfq.id, score: 0, priority: "LOW" });

  // 5. Acknowledgement (no-op stub in Phase 1)
  if (input.whatsapp) {
    await getWhatsAppService().sendRfqAcknowledgement({
      rfqId: rfq.id,
      contactWhatsApp: input.whatsapp,
      contactName: input.full_name,
    });
  }

  return NextResponse.json({ rfqId: rfq.id }, { status: 201 });
}
