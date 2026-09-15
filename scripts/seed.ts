/**
 * Catalogue import — Phase 3 (docs/adr/0005-catalogue-data-model.md).
 *
 * Reads catalogue-seed.json (produced by parse-catalogue.py from the official
 * Khalis Export Catalogue PDF) and upserts it into Supabase via the
 * service-role client. Idempotent — safe to re-run; every upsert is keyed on
 * a stable natural key (collection slug, product barcode) so re-running
 * after a catalogue revision updates existing rows instead of duplicating
 * them.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/catalogue-import/seed.ts
 *
 * Does NOT touch packaging_specs / logistics_specs (MOQ, container capacity,
 * private-label availability) — the catalogue PDF does not provide those
 * fields, so they are intentionally left PENDING_VERIFICATION rather than
 * guessed at (brief "never invent" rule).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedCollection {
  name: string;
  slug: string;
}

interface SeedProduct {
  barcode: string;
  name: string;
  slug: string;
  inspiration: string | null;
  top_notes: string | null;
  middle_notes: string | null;
  base_notes: string | null;
  pack_size: number | null;
  pack_unit: "ML" | "GRAM";
  units_per_carton: number | null;
  carton_cbm: number | null;
  carton_gross_weight_kg: number | null;
  price_usd: number | null;
  price_aed: number | null;
  collection_slug: string;
  collection_name: string;
  source_page: number;
}

interface SeedFile {
  collections: SeedCollection[];
  products: SeedProduct[];
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to run the catalogue import.");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const seedPath = join(__dirname, "catalogue-seed.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf-8")) as SeedFile;

  console.log(`Importing ${seed.collections.length} collections and ${seed.products.length} products…`);

  // 1. Collections (upsert on slug — stable natural key)
  const { data: collectionRows, error: collectionsError } = await supabase
    .from("collections")
    .upsert(
      seed.collections.map((c) => ({
        name: c.name,
        slug: c.slug,
        source: "official_export_catalogue_pdf",
      })),
      { onConflict: "slug" }
    )
    .select("id, slug");
  if (collectionsError) throw new Error(`collections upsert failed: ${collectionsError.message}`);

  const collectionIdBySlug = new Map((collectionRows ?? []).map((c) => [c.slug, c.id as string]));

  // 2. Products (upsert on barcode — the catalogue's own stable key)
  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .upsert(
      seed.products.map((p) => ({
        barcode: p.barcode,
        slug: p.slug,
        name: p.name,
        inspiration: p.inspiration,
        top_notes: p.top_notes,
        middle_notes: p.middle_notes,
        base_notes: p.base_notes,
        pack_size: p.pack_size,
        pack_unit: p.pack_unit,
        volume_ml: p.pack_unit === "ML" ? p.pack_size : null, // backward-compat with existing volume_ml column
        image_status: "PENDING", // never invent product photos — see ADR 0005 §6
        catalogue_status: "VERIFIED_FROM_CATALOGUE",
        status: "PUBLISHED",
      })),
      { onConflict: "barcode" }
    )
    .select("id, barcode");
  if (productsError) throw new Error(`products upsert failed: ${productsError.message}`);

  const productIdByBarcode = new Map((productRows ?? []).map((p) => [p.barcode as string, p.id as string]));

  // 3. collections_products links
  const links = seed.products
    .map((p) => {
      const productId = productIdByBarcode.get(p.barcode);
      const collectionId = collectionIdBySlug.get(p.collection_slug);
      if (!productId || !collectionId) return null;
      return { product_id: productId, collection_id: collectionId };
    })
    .filter((x): x is { product_id: string; collection_id: string } => x !== null);

  const { error: linksError } = await supabase
    .from("collections_products")
    .upsert(links, { onConflict: "collection_id,product_id" });
  if (linksError) throw new Error(`collections_products upsert failed: ${linksError.message}`);

  // 4. carton_specs (units_per_carton / carton_cbm / carton_gross_weight_kg — PUBLIC/Buyer-tier logistics)
  const cartonRows = seed.products
    .map((p) => {
      const productId = productIdByBarcode.get(p.barcode);
      if (!productId) return null;
      return {
        product_id: productId,
        units_per_carton: p.units_per_carton,
        carton_cbm: p.carton_cbm,
        carton_gross_weight_kg: p.carton_gross_weight_kg,
        verification_status: "VERIFIED_FROM_CATALOGUE" as const,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const { error: cartonError } = await supabase
    .from("carton_specs")
    .upsert(cartonRows, { onConflict: "product_id" });
  if (cartonError) throw new Error(`carton_specs upsert failed: ${cartonError.message}`);

  // 5. catalogue_unit_prices — CONFIDENTIAL tier, never surfaced publicly (docs/adr/0005)
  const priceRows = seed.products
    .map((p) => {
      const productId = productIdByBarcode.get(p.barcode);
      if (!productId) return null;
      return {
        product_id: productId,
        price_usd: p.price_usd,
        price_aed: p.price_aed,
        source_page: p.source_page,
        verification_status: "VERIFIED_FROM_CATALOGUE" as const,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const { error: priceError } = await supabase
    .from("catalogue_unit_prices")
    .upsert(priceRows, { onConflict: "product_id" });
  if (priceError) throw new Error(`catalogue_unit_prices upsert failed: ${priceError.message}`);

  console.log("Catalogue import complete.");
  console.log(`  collections: ${collectionRows?.length ?? 0}`);
  console.log(`  products:    ${productRows?.length ?? 0}`);
  console.log(`  carton_specs: ${cartonRows.length}`);
  console.log(`  catalogue_unit_prices: ${priceRows.length} (confidential — staff-only)`);
}

main().catch((err) => {
  console.error("[catalogue-import] failed:", err);
  process.exit(1);
});
