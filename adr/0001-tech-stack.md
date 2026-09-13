# ADR 0001: Core Technology Stack

## Status
Accepted

## Context
The export portal needs a server-first, SEO-heavy, mobile-first B2B site with a growing
catalogue, an RFQ funnel, and future AI/WhatsApp integrations, built by a small team on a
tight operational budget.

## Decision
Next.js (App Router) + React + TypeScript (strict) on Vercel; Supabase for Postgres, Auth,
and Storage; Tailwind CSS for styling; Framer Motion for the limited motion the design
direction calls for; Groq for AI; WhatsApp Business Cloud API for messaging.

## Consequences
- Single deployable (Next.js) simplifies operations versus a separate API service.
- Supabase RLS becomes the primary authorization boundary — schema and policy work in
  `supabase/migrations` carries real security weight and must be reviewed as carefully as
  application code.
- Vercel + Next.js gives SSR/ISR for SEO without a bespoke rendering layer.
