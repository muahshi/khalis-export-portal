-- Phase 3 — Real Catalogue Integration + B2B Product Data Foundation
-- Additive only. Does not modify 0001_init.sql or 0002_rfq_atomicity.sql.
--
-- Adds the minimum fields needed to represent the official Khalis export
-- catalogue PDF (docs/adr/0005-catalogue-data-model.md has the rationale).
-- Confidential unit pricing from the catalogue gets its own table with no
-- anon policy at all — it is commercial data per docs/business-rules.md and
-- must never reach a public response.

-- New verification state: distinct from a manually re-verified 'VERIFIED'
-- row, this means "taken directly from the official catalogue PDF, not yet
-- independently re-confirmed by Khalis staff."
alter type verification_status add value if not exists 'VERIFIED_FROM_CATALOGUE';

-- Catalogue-derived descriptive fields on products ---------------------------
alter table products
  add column if not exists barcode text,
  add column if not exists inspiration text,
  add column if not exists top_notes text,
  add column if not exists middle_notes text,
  add column if not exists base_notes text,
  add column if not exists pack_size numeric,
  add column if not exists pack_unit text,
  add column if not exists image_status text not null default 'PENDING',
  add column if not exists catalogue_status verification_status not null default 'PENDING_VERIFICATION';

alter table products
  add constraint products_pack_unit_check check (pack_unit is null or pack_unit in ('ML', 'GRAM')),
  add constraint products_image_status_check check (image_status in ('PENDING', 'AVAILABLE'));

-- Barcode is catalogue-supplied (EAN/UPC), distinct from the internal `sku`
-- (still unpopulated — no internal SKU scheme exists yet). Partial unique
-- index so multiple NULLs are allowed for products without a barcode.
create unique index if not exists products_barcode_uidx on products(barcode) where barcode is not null;

-- One carton_specs row per product for catalogue-imported data (the import
-- script upserts on product_id). Safe to add now — no carton_specs rows
-- exist yet (Phase 1 shipped the table empty).
alter table carton_specs add constraint carton_specs_product_id_key unique (product_id);

-- Reclassification: carton-level logistics figures (pieces/carton, CBM,
-- carton weight) that come directly from the published, publicly-downloadable
-- catalogue PDF are PUBLIC-tier now that real catalogue data exists — see
-- docs/adr/0005 §"Public vs Buyer/RFQ tier for carton specs" and the updated
-- docs/business-rules.md classification table. Gating a number in the API
-- that's printed on every page of a PDF anyone can download (brief §14) has
-- no security value. Scoped narrowly to catalogue-sourced rows only — a
-- future staff-entered custom/negotiated carton_specs row (any other
-- verification_status) stays fully gated with no anon access, same as today.
create policy "public read catalogue-verified carton specs" on carton_specs
  for select using (verification_status = 'VERIFIED_FROM_CATALOGUE');

-- packaging_specs and logistics_specs (MOQ, container capacity, private-label
-- availability) are NOT reclassified — they remain fully gated with no anon
-- policy. The catalogue PDF does not provide these fields at all, so no
-- catalogue-sourced rows exist for them; any future row is staff-entered,
-- negotiated data and stays Buyer/RFQ-tier.

-- Public-safe view: extend with the new PUBLIC-tier descriptive columns only.
-- Still excludes barcode-adjacent pricing entirely — see catalogue_unit_prices below.
create or replace view public_products as
select
  p.id, p.sku, p.slug, p.name, p.description, p.fragrance_notes,
  p.volume_ml, p.status, b.name as brand_name,
  p.barcode, p.inspiration, p.top_notes, p.middle_notes, p.base_notes,
  p.pack_size, p.pack_unit, p.image_status
from products p
left join brands b on b.id = p.brand_id
where p.status = 'PUBLISHED';

-- Confidential: catalogue unit pricing (USD/AED) --------------------------
-- This is the price list from the official catalogue PDF. Per
-- docs/business-rules.md "Data classification", unit/wholesale pricing is
-- CONFIDENTIAL tier — same as FOB price — and must never be exposed to an
-- anonymous client, the public product page, or the RFQ flow. No anon
-- select policy is created for this table at all (default-deny, same
-- pattern as packaging_specs/carton_specs/logistics_specs).
create table catalogue_unit_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price_usd numeric,
  price_aed numeric,
  source_page integer,
  verification_status verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index catalogue_unit_prices_product_uidx on catalogue_unit_prices(product_id);

create trigger set_updated_at before update on catalogue_unit_prices
  for each row execute function set_updated_at();

alter table catalogue_unit_prices enable row level security;

-- Only MANAGER/ADMIN staff (per docs/security.md role table) may read
-- confidential pricing; matches the existing "manager admin read all users"
-- policy pattern in 0001_init.sql. No insert/update policy is created here —
-- writes happen only via the service-role import script (scripts/catalogue-import).
create policy "manager admin read catalogue prices" on catalogue_unit_prices
  for select using (
    exists (select 1 from users u where u.id = auth.uid() and u.role in ('MANAGER', 'ADMIN'))
  );
