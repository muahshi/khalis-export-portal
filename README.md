# Khalis Global Export Portal

B2B manufacturing and global export platform for **Khalis Perfumes**, serving international
distributors, wholesalers, importers, retailers, and private-label buyers. This is not a
retail storefront — the primary funnel drives qualified RFQs and WhatsApp sales conversations,
not checkout.

- Public site: https://khalisperfumes.com
- Export portal: https://export.khalisperfumes.com (this project)
- Factory: Umm Al Quwain (UAQ), United Arab Emirates

## Status

**Phase 1 — Foundation, Architecture & Design System.** No commercial, logistics, or
certification data has been invented. Every unverified field is modeled as nullable with a
`PENDING_VERIFICATION` status. See `docs/business-rules.md`.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Backend | Next.js Server Actions / Route Handlers |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |
| AI | Groq API (abstraction only — see `services/ai`) |
| Messaging | WhatsApp Business Cloud API (abstraction only — see `services/whatsapp`) |

n8n is intentionally excluded — automation stays application-driven for now.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # fill in real values, never commit .env.local
npx supabase link --project-ref <your-project-ref>
npx supabase db push         # applies supabase/migrations
npm run dev
```

## Documentation

- `docs/architecture.md` — system architecture, module boundaries, data flow
- `docs/business-rules.md` — RFQ funnel, data classification, "never invent" rules
- `docs/data-model.md` — entity relationships and schema rationale
- `docs/security.md` — RLS strategy, roles, secret handling
- `docs/adr/` — architecture decision records

## What is deliberately not built yet

Checkout/cart, autonomous AI sales, live WhatsApp send/receive, the logistics calculator,
and the admin panel are stubbed as interfaces only. See `docs/architecture.md` §"Phase 2".
