# ADR 0003: Three-Tier Data Classification & Explicit Verification Status

## Status
Accepted

## Context
The brief provides product names/descriptions/images but no verified logistics or commercial
data (MOQ, carton specs, CBM, pricing, certifications). A B2B buyer expects to see this data
on the product page, creating pressure to fill it with placeholder or estimated values.

## Decision
1. Data is classified Public / Buyer-RFQ / Confidential (`business-rules.md`), enforced by
   RLS and by which client (anon vs. service role) can query which table/view.
2. Every commercial or logistics field is nullable and paired with a `verification_status`
   (`PENDING_VERIFICATION` | `VERIFIED`). No field is ever defaulted to a plausible-looking
   number. UI renders `"Available on request"` / `"Pending verification"` instead.
3. This status is checked in one place (`lib/verification.ts`) and reused by both server
   rendering and the future AI service, so "don't invent data" is enforced by a shared
   function rather than repeated per-component judgment calls.

## Consequences
- Some product pages will look sparse until Khalis provides verified data — acceptable
  trade-off versus displaying fabricated MOQs/prices to real buyers.
- Any future import script must set `verification_status` explicitly; it cannot be omitted
  (`not null default 'PENDING_VERIFICATION'` at the DB level).
