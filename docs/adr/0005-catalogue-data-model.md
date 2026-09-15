# ADR 0005: Catalogue-Derived Data Model & Confidential Unit Pricing

## Status
Accepted

## Context
Phase 3 provides two new sources of truth: the full repository (Phase 1/2 code)
and the official Khalis Export Catalogue PDF (87 pages, 18 catalogue sections,
514 product rows). The PDF's own column headers vary slightly by section but
resolve into two consistent shapes:

1. Fragrance-profile items: SR NO, BARCODE, PRODUCT IMAGE, PRODUCT NAME,
   INSPIRATION, NOTES (TOP/MIDDLE/BASE), ML or GRAMS, PCS/CTN, CBM, WEIGHT/CTN,
   UNIT PRICE (USD, AED).
2. Mass items with no fragrance profile (Perfume Splash, Air Freshener, Room
   Spray): the same shape minus INSPIRATION/NOTES.

Two rows had a missing/invalid barcode and two barcodes were duplicated
across sections; those rows were excluded from import rather than guessed
at (brief "do not invent" rule) — see the Phase 3 completion report for the
excluded rows.

The catalogue also lists a **UNIT PRICE (USD/AED)** column for every product.
Per `docs/business-rules.md`, unit/wholesale pricing is CONFIDENTIAL-tier
data — the same tier as FOB price — not PUBLIC or even BUYER/RFQ-tier. It is
real, catalogue-sourced data (not invented), so it is imported and preserved,
but into a table with no anon policy at all, never into `public_products` or
any client-facing query.

## Decision
1. Extend `products` additively with catalogue-derived descriptive fields:
   `barcode`, `inspiration`, `top_notes`, `middle_notes`, `base_notes`,
   `pack_size`, `pack_unit` (`ML` | `GRAM`), `image_status`
   (`PENDING` | `AVAILABLE`), `catalogue_status` (verification_status).
   These are PUBLIC-tier (matches existing `fragrance_notes` treatment) and
   are added to the `public_products` view.
2. Add a new `verification_status` enum value, `VERIFIED_FROM_CATALOGUE`,
   distinct from a manually staff-reconfirmed `VERIFIED` row — it means "taken
   directly from the official catalogue PDF, not yet independently
   reconfirmed by Khalis staff." `lib/verification.ts` treats it as a
   displayable (non-fallback) status alongside `VERIFIED`.
3. Map catalogue logistics columns onto the **existing** `carton_specs`
   columns rather than adding new ones: PCS/CTN → `units_per_carton`, CBM →
   `carton_cbm`, WEIGHT/CTN → `carton_gross_weight_kg` (the PDF does not
   distinguish gross/net, so `carton_net_weight_kg` stays null — a real gap,
   not a guess). `packaging_specs`/`logistics_specs` (MOQ, container
   capacity, private-label availability) are **not** populated — the
   catalogue does not provide these fields, and brief §2 forbids inventing
   them; they remain `PENDING_VERIFICATION` and render "Available on
   request."
4. Add `catalogue_unit_prices` (product_id, price_usd, price_aed,
   source_page, verification_status) with RLS enabled and **no anon select
   policy** — only `MANAGER`/`ADMIN` staff can read it, matching the existing
   "manager admin read all users" policy pattern. This preserves the real
   pricing data from the source document without ever exposing it publicly.
5. Catalogue sections become `collections` rows (`source =
   'official_export_catalogue_pdf'`), replacing the *anticipated* retail
   taxonomy `docs/data-model.md` had sketched before real catalogue data
   existed — the real section names (e.g. "LUXURY COLLECTIONS", "ARABIC
   ORIENTAL COLLECTIONS") are the authoritative taxonomy now that the source
   document is available.
6. Product images: the PDF embeds a product photo next to each row, but
   reliably attributing 500+ embedded raster images back to the correct
   product row is not something this import does automatically (brief §12
   forbids inventing/mismatching images). Every imported product is seeded
   with `image_status = 'PENDING'`; the UI renders a safe placeholder, never
   a broken image or a stock substitute. Wiring real photos is a Phase 4 item
   once Khalis provides a named image set or the manual mapping is done.
7. Import is a repeatable script (`scripts/catalogue-import/`), not hardcoded
   component data: `catalogue-seed.json` (parsed from the PDF) →
   `seed.ts` (idempotent upsert via the service-role client, keyed on
   `barcode`) → Supabase. Re-running it is safe.

## Public vs Buyer/RFQ tier for carton specs
`docs/business-rules.md` (Phase 1) classified carton configuration as
Buyer/RFQ-tier — reasonable when it anticipated staff-negotiated, per-deal
packaging. Phase 3 supplies a different kind of carton data: pieces/carton,
CBM, and carton weight are printed on every page of a catalogue PDF that
brief §14 requires making publicly downloadable. Gating those same numbers
behind an RLS policy while the PDF containing them sits in `/public` has no
security value and just breaks the product page brief §8 asks for. `docs/
business-rules.md` and `docs/security.md` are updated accordingly: carton
specs are PUBLIC-tier **only when `verification_status =
'VERIFIED_FROM_CATALOGUE'`** — a future staff-entered negotiated
`carton_specs` row (any other status) stays fully gated, no anon policy,
exactly as before. `packaging_specs`/`logistics_specs` (MOQ, container
capacity, private-label) are untouched — the catalogue doesn't provide them,
so no catalogue-sourced rows exist there to reclassify.

## Consequences
- Product pages will show real fragrance/logistics data for all 512 imported
  products, but MOQ, container capacity, private-label availability, and all
  images remain "Available on request" / pending — accurately reflecting
  what the catalogue does and doesn't provide, not a display bug.
- Confidential pricing exists in the database (useful for staff/RFQ context
  in a later phase) without violating the public/confidential boundary.
- A future Phase 4 could add: MOQ/logistics captured separately from Khalis
  (not in this PDF), real product photography, and a UI surface for staff to
  read `catalogue_unit_prices` (none exists yet — brief §21 excludes admin
  panel from this phase).
