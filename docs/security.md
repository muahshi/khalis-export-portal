# Security & RLS Strategy

## Roles (conceptual — full admin panel is Phase 2)

| Role | Can read | Can write |
|---|---|---|
| `PUBLIC` (anon) | Public-tier columns of catalogue tables only | Nothing directly (RFQ submission goes through a Route Handler using the service role, not the anon key) |
| `SALES` | Public + Buyer/RFQ tier, assigned RFQs/contacts | RFQ status updates, quote drafts, WhatsApp replies |
| `MANAGER` | All of SALES + confidential commercial data for their scope | Pricing, discounts, lead re-prioritization |
| `ADMIN` | Everything | Schema-adjacent config: users, certifications publish state, markets |

## RLS rules (enforced in `supabase/migrations/0001_init.sql`)

- Catalogue tables (`products`, `collections`, `categories`, `product_images`) expose a
  `select` policy to `anon`/`authenticated` restricted to public-tier columns via a view
  (`public_products`) rather than the raw table, so confidential columns are never in the
  anon-reachable shape even if a policy is misconfigured later.
- `packaging_specs`, `logistics_specs`: no `anon` select policy at all. Buyer-tier fields
  are surfaced to the client only through a server-side query using the service role inside
  an RFQ/quotation context, never a direct client query.
- `carton_specs`: no `anon` select policy for staff-entered/negotiated rows — same as
  `packaging_specs`/`logistics_specs`. As of Phase 3 (docs/adr/0005), rows with
  `verification_status = 'VERIFIED_FROM_CATALOGUE'` — i.e. pieces/carton, CBM, and carton
  weight taken directly from the published catalogue PDF — DO have a public `select` policy,
  since that exact data is already in the publicly-downloadable catalogue (brief §14).
- `catalogue_unit_prices` (Phase 3): no `anon` select policy at all. Readable only by
  `MANAGER`/`ADMIN` staff — same pattern as the `users` table's manager/admin policy. This is
  the catalogue's USD/AED unit price column; it is CONFIDENTIAL tier, not Buyer/RFQ tier.
- `rfqs`, `rfq_items`, `lead_scores`, `quotes`, `companies`, `contacts`,
  `whatsapp_conversations`, `ai_messages`, `audit_logs`: no `anon` access at all. Insert on
  `rfqs`/`rfq_items` happens only through the Route Handler using the service role, after
  server-side validation — never a direct client insert with the anon key.
- `users`: readable only by the authenticated user's own row plus `MANAGER`/`ADMIN`.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`
  are server-only environment variables — never referenced in a Client Component, never
  prefixed `NEXT_PUBLIC_`.
- Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` are
  public by design (anon key is meaningless without RLS, which is mandatory here).
- `lib/supabase/server.ts` is the only place the service-role client is instantiated; it is
  never imported from a file under `components/` or any `"use client"` module.

## Audit

Any write to a confidential-tier column (pricing, cost, inventory, discounts) is recorded in
`audit_logs` with actor id, table, row id, and a before/after diff — enforced via a Postgres
trigger, not application code, so it can't be bypassed by a new code path.
