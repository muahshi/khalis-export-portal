-- Corrective migration — Phase 1 hardening. Does not modify 0001_init.sql.
-- Adds an atomic RFQ-creation path so a failure partway through company/contact/
-- rfq/rfq_items/lead_scores writes cannot leave orphaned rows (brief §6).

create or replace function create_rfq_submission(
  p_full_name text,
  p_company_name text,
  p_country text,
  p_business_type business_type,
  p_email text,
  p_whatsapp text,
  p_target_market text,
  p_container_interest container_type,
  p_private_label_requirement boolean,
  p_packaging_requirement text,
  p_shipping_preference text,
  p_message text,
  p_items jsonb -- array of {product_id, estimated_quantity, estimated_cartons}
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_contact_id uuid;
  v_rfq_id uuid;
begin
  insert into companies (name, country, business_type)
  values (p_company_name, p_country, p_business_type)
  returning id into v_company_id;

  insert into contacts (company_id, full_name, email, whatsapp)
  values (v_company_id, p_full_name, p_email, p_whatsapp)
  returning id into v_contact_id;

  insert into rfqs (
    contact_id, company_id, target_market, container_interest,
    private_label_requirement, packaging_requirement, shipping_preference, message
  )
  values (
    v_contact_id, v_company_id, p_target_market, p_container_interest,
    p_private_label_requirement, p_packaging_requirement, p_shipping_preference, p_message
  )
  returning id into v_rfq_id;

  if p_items is not null and jsonb_array_length(p_items) > 0 then
    insert into rfq_items (rfq_id, product_id, estimated_quantity, estimated_cartons)
    select
      v_rfq_id,
      (item->>'product_id')::uuid,
      nullif(item->>'estimated_quantity', '')::integer,
      nullif(item->>'estimated_cartons', '')::integer
    from jsonb_array_elements(p_items) as item;
  end if;

  insert into lead_scores (rfq_id, score, priority)
  values (v_rfq_id, 0, 'LOW');

  return v_rfq_id;
  -- A single function invocation is one implicit transaction: any exception
  -- above (invalid product_id FK, bad enum value, etc.) rolls back every
  -- insert in this call, so no orphaned company/contact/rfq rows can persist.
end;
$$;

-- Only the server-side service role may call this — never anon/authenticated,
-- even though RLS is bypassed inside (security definer). Defense in depth on
-- top of "the client never holds the service-role key" (docs/security.md).
revoke all on function create_rfq_submission(
  text, text, text, business_type, text, text, text, container_type,
  boolean, text, text, text, jsonb
) from public;

grant execute on function create_rfq_submission(
  text, text, text, business_type, text, text, text, container_type,
  boolean, text, text, text, jsonb
) to service_role;
