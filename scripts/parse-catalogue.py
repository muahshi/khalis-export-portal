"""
Catalogue import step 1 — parse the official Khalis Export Catalogue PDF into
structured JSON (docs/adr/0005-catalogue-data-model.md).

Usage:
    pip install pdfplumber
    python3 scripts/catalogue-import/parse-catalogue.py path/to/catalogue.pdf \
        scripts/catalogue-import/catalogue-seed.json

Repeatable and safe to re-run whenever Khalis supplies a revised catalogue —
this script never hardcodes product data; it only reads whatever PDF path you
give it. Step 2 (scripts/catalogue-import/seed.ts) upserts the resulting JSON
into Supabase, keyed on barcode/slug, so re-importing an updated catalogue
updates existing rows instead of duplicating them.

Known limitations (do not silently "fix" — see docs/adr/0005 §"Consequences"):
  - Rows with a missing/unreadable barcode are skipped, not guessed at.
  - Duplicate barcodes across sections: only the first occurrence is kept;
    the rest are reported as skipped so a human can resolve the real
    catalogue-side duplication.
  - MOQ, container capacity, and private-label availability are not in this
    PDF at all and are never populated from it.
  - Product photography is not extracted/matched — every imported product is
    seeded with image_status = 'PENDING' (see ADR 0005 §6).
"""
import json
import re
import sys

try:
    import pdfplumber
except ImportError:
    print("pdfplumber is required: pip install pdfplumber --break-system-packages", file=sys.stderr)
    raise

GRAM_SECTIONS = {"BUKHOOR 80 GRAMS", "MA'AL ATTAR 50 GRAMS"}


def clean(s):
    if s is None:
        return None
    s = s.replace("\n", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s if s else None


def parse_notes(notes_raw):
    """Split a NOTES cell like 'TOP: A, B MIDDLE: C BASE: D' into top/middle/base."""
    if not notes_raw:
        return None, None, None
    text = re.sub(r"\s+", " ", notes_raw.replace("\n", " ")).strip()
    labels = ["TOP", "MIDDLE", "BASE"]
    positions = []
    for lbl in labels:
        m = re.search(rf"\b{lbl}\s*:", text, re.IGNORECASE)
        if m:
            positions.append((m.start(), lbl))
    positions.sort()
    parts = {"TOP": None, "MIDDLE": None, "BASE": None}
    for i, (start, lbl) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        chunk = re.sub(rf"^{lbl}\s*:\s*", "", text[start:end], flags=re.IGNORECASE).strip().rstrip(",")
        parts[lbl] = chunk or None
    return parts["TOP"], parts["MIDDLE"], parts["BASE"]


def to_num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().strip()).strip("-")


def smart_title(name):
    """Title-case a name but leave tokens with digits or slashes as-is
    (e.g. '6ML', 'A/F') instead of mangling them."""
    out = []
    for w in name.split(" "):
        out.append(w if (any(ch.isdigit() for ch in w) or "/" in w) else w.capitalize())
    return " ".join(out)


def extract_rows(pdf_path):
    """Step A: pull every product row out of the PDF's tables, tracking the
    current section from section-title rows (a row with only one populated
    cell and no leading integer)."""
    pdf = pdfplumber.open(pdf_path)
    current_section = None
    rows_out = []
    warnings = []

    for pageno, page in enumerate(pdf.pages, start=1):
        for table in page.extract_tables():
            for row in table:
                if row is None:
                    continue
                first = clean(row[0]) if len(row) > 0 else None
                rest_empty = all((c is None or clean(c) is None) for c in row[1:])
                if rest_empty and first and not re.match(r"^\d+$", first):
                    current_section = first
                    continue
                if not first or not re.match(r"^\d+$", first):
                    continue  # header row or noise

                sr_no = int(first)
                barcode = clean(row[1]) if len(row) > 1 else None
                if not barcode or not re.match(r"^\d{6,}$", barcode):
                    warnings.append(f"page {pageno} sr {sr_no}: missing/invalid barcode -> skipped")
                    continue

                tail = [clean(c) for c in row[3:]]  # row[2] is the (unextracted) image cell
                while tail and tail[-1] is None:
                    tail.pop()
                n = len(tail)

                rec = {
                    "section": current_section, "page": pageno, "sr_no": sr_no, "barcode": barcode,
                    "name": None, "inspiration": None, "notes_raw": None,
                    "size_value": None, "pcs_per_ctn": None, "carton_cbm": None,
                    "carton_weight_kg": None, "unit_price_usd": None, "unit_price_aed": None,
                }
                if n == 9:  # NAME, INSPIRATION, NOTES, SIZE, PCS, CBM, WEIGHT, USD, AED
                    (rec["name"], rec["inspiration"], rec["notes_raw"], rec["size_value"],
                     rec["pcs_per_ctn"], rec["carton_cbm"], rec["carton_weight_kg"],
                     rec["unit_price_usd"], rec["unit_price_aed"]) = tail
                elif n == 8:  # inspiration blank/merged away
                    (rec["name"], rec["notes_raw"], rec["size_value"], rec["pcs_per_ctn"],
                     rec["carton_cbm"], rec["carton_weight_kg"], rec["unit_price_usd"],
                     rec["unit_price_aed"]) = tail
                elif n == 7:  # mass items — no fragrance profile
                    (rec["name"], rec["size_value"], rec["pcs_per_ctn"], rec["carton_cbm"],
                     rec["carton_weight_kg"], rec["unit_price_usd"], rec["unit_price_aed"]) = tail
                else:
                    warnings.append(f"page {pageno} sr {sr_no} barcode {barcode}: unexpected column count n={n}: {tail}")
                    continue

                rows_out.append(rec)

    return rows_out, warnings


def build_seed(rows):
    """Step B: normalize types, assign slugs, dedupe barcodes, group into
    collections keyed on the catalogue's own section names."""
    seen_barcodes, skipped_dupes, products, collections = {}, [], [], {}

    for r in rows:
        section = r["section"]
        collections.setdefault(section, {"name": section, "slug": slugify(section)})

        barcode = r["barcode"]
        if barcode in seen_barcodes:
            skipped_dupes.append({"barcode": barcode, "sr_no": r["sr_no"], "page": r["page"], "name": r["name"]})
            continue
        seen_barcodes[barcode] = True

        top, middle, base = parse_notes(r["notes_raw"])
        name = r["name"] or f"PRODUCT {barcode}"
        products.append({
            "barcode": barcode,
            "slug_base": slugify(name),
            "name": smart_title(name),
            "inspiration": r["inspiration"],
            "top_notes": top, "middle_notes": middle, "base_notes": base,
            "pack_size": to_num(r["size_value"]),
            "pack_unit": "GRAM" if section in GRAM_SECTIONS else "ML",
            "units_per_carton": int(to_num(r["pcs_per_ctn"])) if to_num(r["pcs_per_ctn"]) is not None else None,
            "carton_cbm": to_num(r["carton_cbm"]),
            "carton_gross_weight_kg": to_num(r["carton_weight_kg"]),
            "price_usd": to_num(r["unit_price_usd"]),
            "price_aed": to_num(r["unit_price_aed"]),
            "collection_slug": slugify(section),
            "collection_name": section,
            "source_page": r["page"],
        })

    slug_counts = {}
    for p in products:
        slug_counts[p["slug_base"]] = slug_counts.get(p["slug_base"], 0) + 1
    seen_final = {}
    for p in products:
        base = p["slug_base"]
        slug = f"{base}-{p['barcode'][-5:]}" if slug_counts[base] > 1 else base
        n = 1
        while slug in seen_final:
            n += 1
            slug = f"{base}-{n}"
        seen_final[slug] = True
        p["slug"] = slug
        del p["slug_base"]

    return {"collections": list(collections.values()), "products": products}, skipped_dupes


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    pdf_path, out_path = sys.argv[1], sys.argv[2]

    rows, warnings = extract_rows(pdf_path)
    seed, skipped_dupes = build_seed(rows)

    with open(out_path, "w") as f:
        json.dump(seed, f, indent=2)

    print(f"Parsed {len(rows)} rows -> {len(seed['products'])} unique products across {len(seed['collections'])} collections", file=sys.stderr)
    if warnings:
        print(f"{len(warnings)} rows skipped (missing/invalid barcode or unexpected layout):", file=sys.stderr)
        for w in warnings:
            print(f"  {w}", file=sys.stderr)
    if skipped_dupes:
        print(f"{len(skipped_dupes)} duplicate-barcode rows skipped (kept first occurrence):", file=sys.stderr)
        for d in skipped_dupes:
            print(f"  {d}", file=sys.stderr)


if __name__ == "__main__":
    main()
