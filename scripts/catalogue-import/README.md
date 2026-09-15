# Catalogue Import

Repeatable, two-step pipeline from the official Khalis Export Catalogue PDF to
Supabase. See `docs/adr/0005-catalogue-data-model.md` for the data-model
rationale.

```
official catalogue PDF
        │  parse-catalogue.py (pdfplumber)
        ▼
catalogue-seed.json   (structured, reviewable — commit this)
        │  seed.ts (Supabase service-role client, idempotent upsert)
        ▼
Supabase (products, collections, carton_specs, catalogue_unit_prices)
```

## Step 1 — parse the PDF

```bash
pip install pdfplumber --break-system-packages
python3 scripts/catalogue-import/parse-catalogue.py \
  path/to/khalis-export-catalogue.pdf \
  scripts/catalogue-import/catalogue-seed.json
```

Prints a summary to stderr: rows parsed, products found, any rows skipped for
a missing/invalid barcode, and any duplicate barcodes (only the first
occurrence of a duplicate is kept — the rest are listed so a human can
resolve the real catalogue-side duplication rather than the script guessing).

`catalogue-seed.json` is plain, readable JSON — diff it before importing when
Khalis sends a revised catalogue.

## Step 2 — import into Supabase

```bash
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
npx tsx scripts/catalogue-import/seed.ts
```

Upserts, keyed on stable natural keys (`collections.slug`, `products.barcode`)
— safe to re-run. Re-importing an updated catalogue updates existing rows;
it never duplicates them.

## What this does NOT populate

- `packaging_specs` / `logistics_specs` (MOQ, container capacity,
  private-label availability) — not present in the catalogue PDF at all.
- Product photography — every product is seeded with `image_status =
  'PENDING'`; the UI shows a safe placeholder, never a broken or mismatched
  image. Wiring real photos is a Phase 4 item.
- `certifications` — none are in the catalogue source.

## Confidential data

`catalogue_unit_prices` (USD/AED) IS imported — it's real catalogue data, not
invented — but into a table with no anon RLS policy at all. It is never
queried by any public page or the RFQ flow. Only `MANAGER`/`ADMIN` staff can
read it (see `supabase/migrations/0003_catalogue_phase3.sql`).
