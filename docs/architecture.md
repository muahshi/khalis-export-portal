# Architecture Overview

## Principle

Server-first, secure-by-default, type-safe, modular, SEO-friendly, mobile-first. No
confidential commercial data ever reaches the public browser bundle or an anonymous API
response.

## Funnel this architecture serves

```
Visitor → Explore Products → Evaluate Manufacturing Capability → Check Packaging/Logistics
 → Request RFQ → Submit Company + Quantity → Lead Stored → Lead Qualified
 → WhatsApp / Sales Team → Quotation → Negotiation → Order
```

Every module below exists to move a visitor through that funnel, not to run a checkout.

## Module boundaries

```
app/            Route segments only (App Router). Thin — composes components + calls services.
components/     Presentational + light-interactive UI, grouped by domain (layout, home, product, rfq, ui).
features/       Domain feature logic that isn't a route (rfq form state, logistics helpers, ai/whatsapp UI glue).
lib/supabase/   Supabase client factories (browser + server), typed against types/domain.ts.
services/       Server-only abstractions with no business-logic leakage into components:
                  services/ai        — Groq abstraction (lead classification, translation, summarization)
                  services/whatsapp  — WhatsAppService (acknowledgement, routing, notifications)
                  services/logistics — carton/CBM/container domain model (calculator is Phase 2)
types/          Shared TypeScript domain types, generated/aligned with the Supabase schema.
config/         Site metadata, navigation tree, design tokens references — no secrets.
hooks/          Client-side React hooks.
supabase/       SQL migrations, RLS policies.
docs/adr/       One record per non-trivial architectural decision.
```

## Data flow: public product page

1. `app/products/[slug]/page.tsx` (Server Component) calls a server-only Supabase query
   scoped to the `public` role.
2. Query selects only columns classified as **PUBLIC DATA** (see `business-rules.md`).
3. Commercial/logistics fields render `"Available on request"` when `logistics_status` or
   `commercial_status` is `PENDING_VERIFICATION` — never a fabricated number.
4. "Request Quotation" / "Add to RFQ" CTAs hand off to `features/rfq`.

## Data flow: RFQ submission

1. Client RFQ form (`features/rfq`) posts to `app/api/rfq/route.ts` (Route Handler).
2. Route Handler validates input, writes to `rfqs` / `rfq_items` via the Supabase **service
   role** (server-only), computes an initial `lead_scores` entry.
3. `services/whatsapp` sends an acknowledgement and notifies the sales team (interface only
   in Phase 1 — no live send).
4. `services/ai` may summarize/classify the RFQ for sales (interface only in Phase 1).

## Why Server Actions / Route Handlers over a separate backend

Keeps the service-role Supabase key server-side only, avoids a second deployable, and keeps
RLS as the single source of truth for authorization — no duplicated auth logic in a separate
API service.

## Phase 2 (not started)

- Logistics calculator (total CBM/weight/20FT/40FT from verified carton data)
- Live WhatsApp send/receive + conversation routing
- AI-assisted lead summarization wired to real Groq calls
- Admin panel (SALES/MANAGER/ADMIN roles) beyond the RLS/role foundation
- CSV/JSON product import tooling
