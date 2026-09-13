# Business Rules

## Company facts (authoritative)

- Company: Khalis Perfumes
- Factory: **Umm Al Quwain (UAQ), United Arab Emirates** — the existing public site may still
  reference Ajman; that is treated as stale. UAQ is authoritative for this portal.
- Any other company fact not confirmed by Khalis data is marked `PENDING_VERIFICATION` and
  must not be presented as fact.

## Data classification

| Tier | Examples | Exposure |
|---|---|---|
| **Public** | name, SKU, brand, category, images, description, fragrance notes, size, general manufacturing capability, public certifications, public factory info, public contact info | Public website, anonymous Supabase role |
| **Buyer/RFQ** | MOQ, carton configuration, packaging spec, estimated loading info, export documentation availability, commercial quote info when intentionally exposed | Shown during/after RFQ flow, not in anonymous product API |
| **Confidential** | FOB price, factory cost, gross margin, minimum internal selling price, current inventory, customer-specific pricing, internal discounts, supplier costs, internal production status, sales notes, negotiation history | Server-side only, protected by RLS + role checks, never in a public response |

## "Never invent" rule

The following must never be fabricated in UI, copy, seed data, or AI output:

- Carton quantity, carton dimensions, CBM, gross/net weight
- MOQ, 20FT/40FT capacity
- FOB/CIF price, lead time
- Certifications (ISO, Halal, etc.) — only publish once verified
- Distributor counts, production volume claims ("150+ distributors", "50,000 bottles/day")

Unverified fields use `logistics_status` / `commercial_status` = `PENDING_VERIFICATION` and
render as **"Available on request"** or **"Pending verification"** depending on context —
never a placeholder number.

## RFQ

Fields: full name, company name, country, business type, email, WhatsApp, products,
estimated quantity, estimated cartons, container interest, target market, private-label
requirement, packaging requirement, shipping preference, message.

Business types: Distributor, Wholesaler, Retailer, Importer, Private Label, Fragrance Brand,
Other.

Lead priority: LOW, MEDIUM, HIGH, ENTERPRISE — set by `lead_scores`, never by the visitor.

## Product actions

B2B, not retail. Primary actions are **View Specifications**, **Request Quotation**, **Add to
RFQ**, **Contact Export Team** — never Add to Cart / Buy Now / Checkout.

## AI (Groq) constraints

AI may only read verified database/company data. It must never invent prices, MOQ,
certificates, production capacity, lead times, or shipping commitments — the same "never
invent" list applies to AI output as to static copy.
