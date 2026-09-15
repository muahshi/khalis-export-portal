# Data Model

Full DDL lives in `supabase/migrations/0001_init.sql`. This is the entity map and rationale.

## Entity groups

**Catalogue** — `brands`, `categories`, `collections`, `products`, `product_images`,
`product_variants`. `collections` are seeded from the official export catalogue PDF's own 18
section headings (e.g. "LUXURY COLLECTIONS", "ARABIC ORIENTAL COLLECTIONS" — `source =
'official_export_catalogue_pdf'`, via `scripts/catalogue-import/`), superseding the
anticipated retail taxonomy Phase 1 had sketched before real catalogue data existed (docs/
adr/0005). The B2B taxonomy (`categories`) remains a separate, independently-evolving table
linked via `product_categories` — not populated in Phase 3.

**Commercial / logistics (mostly nullable, verification-gated)** — `packaging_specs`,
`carton_specs`, `logistics_specs`. Every numeric field is nullable; each spec row carries a
`verification_status` (`PENDING_VERIFICATION` / `VERIFIED` / `VERIFIED_FROM_CATALOGUE` —
added Phase 3, docs/adr/0005). No default or computed fallback value is ever substituted for
a null. `carton_specs` rows with `VERIFIED_FROM_CATALOGUE` are public-readable (the same
figures are printed in the publicly-downloadable catalogue PDF); `packaging_specs` and
`logistics_specs` stay fully gated — the catalogue doesn't provide MOQ/container/private-label
data, so nothing there is reclassified.

**Catalogue pricing (Phase 3, confidential)** — `catalogue_unit_prices`: the official
catalogue's USD/AED unit price per product, one row per product, no `anon` access at all —
MANAGER/ADMIN-readable only. See `docs/adr/0005-catalogue-data-model.md`.

**Trust** — `documents`, `certifications`, `markets`. Certifications have their own
`verification_status` so an unverified certificate can exist in the DB (e.g., "in progress")
without ever rendering publicly.

**CRM / funnel** — `companies`, `contacts`, `rfqs`, `rfq_items`, `lead_scores`, `quotes`.
`rfqs` is the funnel's single source of truth; `lead_scores` is written server-side only
(never client-writable) so priority can't be self-assigned by a visitor.

**Conversations / AI** — `whatsapp_conversations`, `ai_messages`. Structured to hold a
conversation transcript keyed to a `contact`/`rfq`, ready for Phase 2 wiring without a schema
change.

**Platform** — `users` (internal Supabase-auth-backed staff), `audit_logs` (every mutation to
confidential or commercial fields is logged with actor + before/after).

## Keys, indexes, conventions

- UUID primary keys (`gen_random_uuid()`) throughout.
- `created_at` / `updated_at` (`timestamptz`, default `now()`) on every table; `updated_at`
  maintained by a shared trigger.
- Foreign keys use `on delete restrict` for catalogue references and `on delete cascade` for
  child rows that have no independent meaning (`rfq_items`, `product_images`).
- Indexes: `products.sku`, `products.slug`, `products.status`, `product_categories.category_id`,
  `collections_products.collection_id`, `markets.country_code`, `rfqs.status`,
  `rfqs.lead_priority`.

## Why nullable-and-status instead of defaults

A default of `0` for `moq` or `carton_qty` is indistinguishable from a verified zero in most
UI code paths and is the exact failure mode §7 of the brief forbids ("never invent... display
fake values"). Nullable + explicit status makes "we don't know yet" a distinct, checkable
state instead of a magic number.
