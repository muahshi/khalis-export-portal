# ADR 0004: Atomic RFQ Writes via Postgres RPC; Optional Product Line Items

## Status
Accepted

## Context
Phase 1 hardening audit found two related issues in the RFQ path:

1. `app/api/rfq/route.ts` performed five sequential inserts (company → contact →
   rfq → rfq_items → lead_scores). A failure partway through (e.g. an invalid
   `product_id`) left orphaned company/contact/rfq rows with no cleanup.
2. `features/rfq/schema.ts` required at least one product line item
   (`products.min(1)`), but the shipped `/rfq` page is a general contact form
   with no product picker yet — it always submits `products: []`. Every
   submission through the built form would fail validation.

## Decision
1. Added `create_rfq_submission(...)` (`supabase/migrations/0002_rfq_atomicity.sql`),
   a single `plpgsql` function performing all five writes. A Postgres function
   body is one implicit transaction, so any exception rolls back every insert
   in that call — no orphaned rows possible. `EXECUTE` is granted to
   `service_role` only.
2. `rfqSubmissionSchema.products` is now optional (`.default([])`) rather than
   required. Product-specific "Add to RFQ" (Phase 2) can still attach line
   items when that flow exists; the general contact form works today.
3. `app/api/rfq/route.ts` no longer returns raw Postgres error text to the
   client — errors are logged server-side and the client gets a generic
   message (brief §14, "must not display raw database errors to public users").

## Consequences
- One additional migration file; the original `0001_init.sql` is untouched.
- The RFQ API surface is now a single RPC call instead of five sequential
  table writes — simpler to reason about and consistent with "don't
  over-engineer" (brief §6).
- Real rate limiting / abuse protection for the public RFQ endpoint is still
  not implemented (would need persistent state — e.g. Vercel KV/Upstash) and
  remains a documented Phase 2 item.
