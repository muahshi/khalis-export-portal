import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { verifiedOrFallback } from "@/lib/verification";
import type { CartonSpec, PublicProduct } from "@/types/domain";

// See app/page.tsx for rationale.
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<PublicProduct | null> {
  const supabase = getSupabaseAnonServerClient();
  const { data } = await supabase.from("public_products").select("*").eq("slug", slug).maybeSingle();
  return (data as PublicProduct) ?? null;
}

async function getCartonSpec(productId: string): Promise<CartonSpec | null> {
  // Public-readable only for catalogue-sourced rows (docs/adr/0005) — RLS
  // enforces this via the anon client, no service role needed here.
  const supabase = getSupabaseAnonServerClient();
  const { data } = await supabase
    .from("carton_specs")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();
  return (data as CartonSpec) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  const sizeLabel =
    product.pack_size != null && product.pack_unit
      ? `${product.pack_size}${product.pack_unit === "ML" ? "ml" : "g"}`
      : undefined;
  const description = [product.name, sizeLabel, "— Khalis Perfumes B2B export catalogue"]
    .filter(Boolean)
    .join(" ");
  return { title: product.name, description };
}

function NotesBlock({ label, notes }: { label: string; notes: string | null }) {
  if (!notes) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-300">{notes}</dd>
    </div>
  );
}

/**
 * B2B product specification page (brief §8). PUBLIC-tier fields only —
 * catalogue unit pricing (catalogue_unit_prices) is CONFIDENTIAL and is
 * never queried or rendered here.
 */
export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const cartonSpec = await getCartonSpec(product.id);
  const packSize =
    product.pack_size != null && product.pack_unit
      ? `${product.pack_size}${product.pack_unit === "ML" ? "ml" : "g"}`
      : product.volume_ml
        ? `${product.volume_ml}ml`
        : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        <div
          className="flex aspect-square items-center justify-center bg-charcoal-800 text-sm uppercase tracking-wide text-stone-500"
          aria-hidden
        >
          {product.image_status === "PENDING" ? "Product image available on request" : ""}
        </div>

        <div>
          {/* PRODUCT IDENTITY */}
          <p className="text-xs uppercase tracking-wide text-stone-400">
            {product.brand_name ?? "Khalis Perfumes"}
          </p>
          <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-400">
            {product.barcode && (
              <div>
                <dt className="inline text-stone-500">Barcode: </dt>
                <dd className="inline">{product.barcode}</dd>
              </div>
            )}
            {packSize && (
              <div>
                <dt className="inline text-stone-500">Size: </dt>
                <dd className="inline">{packSize}</dd>
              </div>
            )}
          </dl>
          {product.description && <p className="mt-6 text-stone-200">{product.description}</p>}

          {/* FRAGRANCE PROFILE */}
          {(product.inspiration || product.top_notes || product.middle_notes || product.base_notes) && (
            <div className="mt-8 border-t border-charcoal-700 pt-6">
              <h2 className="text-xs uppercase tracking-wide text-gold">Fragrance Profile</h2>
              {product.inspiration && (
                <p className="mt-3 text-sm text-stone-400">Inspiration: {product.inspiration}</p>
              )}
              <dl className="mt-4 space-y-3">
                <NotesBlock label="Top Notes" notes={product.top_notes} />
                <NotesBlock label="Middle Notes" notes={product.middle_notes} />
                <NotesBlock label="Base Notes" notes={product.base_notes} />
              </dl>
            </div>
          )}

          {/* PACKAGING / LOGISTICS — public only for catalogue-verified rows (docs/adr/0005) */}
          <dl className="mt-8 space-y-2 border-t border-charcoal-700 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-400">Pack Size</dt>
              <dd>{packSize ?? "Available on request"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Pieces / Carton</dt>
              <dd>
                {cartonSpec
                  ? verifiedOrFallback(cartonSpec.verification_status, cartonSpec.units_per_carton)
                  : "Available on request"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Carton CBM</dt>
              <dd>
                {cartonSpec
                  ? verifiedOrFallback(cartonSpec.verification_status, cartonSpec.carton_cbm)
                  : "Available on request"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Carton Weight (kg)</dt>
              <dd>
                {cartonSpec
                  ? verifiedOrFallback(cartonSpec.verification_status, cartonSpec.carton_gross_weight_kg)
                  : "Available on request"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">MOQ</dt>
              <dd>{verifiedOrFallback("PENDING_VERIFICATION", null)}</dd>
            </div>
          </dl>

          {/* DOCUMENTATION */}
          <p className="mt-6 text-xs uppercase tracking-wide text-stone-500">
            Export documentation: confirmed during quotation
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href={`/rfq?product=${product.slug}`}
              className="border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
            >
              Request a Quote
            </a>
            <a
              href="/contact"
              className="border border-charcoal-700 px-6 py-3 text-sm uppercase tracking-wide text-stone-200"
            >
              Contact Export Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
