# ADR 0002: Application-Driven Automation (No n8n)

## Status
Accepted

## Context
RFQ acknowledgement, sales notification, and future AI/WhatsApp routing could be built as
workflow-automation graphs (e.g., n8n) or as application code inside Next.js.

## Decision
Phase 1 keeps all automation inside the Next.js application via `services/whatsapp` and
`services/ai` abstractions. n8n (or any external automation tool) is explicitly excluded for
now.

## Consequences
- One fewer deployable/credentialed system to secure in Phase 1.
- Business logic (what counts as a qualified lead, what triggers a WhatsApp notification)
  lives in reviewable, type-checked TypeScript rather than an external visual workflow.
- If automation needs outgrow the application (e.g., complex multi-step drip sequences),
  this decision should be revisited with a new ADR rather than silently reintroducing n8n.
