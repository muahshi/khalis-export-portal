import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { verifiedOrFallback } from "@/lib/verification";
import type { PublicProduct } from "@/types/domain";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return { title: product.name, description: product.description ?? undefined };
}

/**
 * Product detail skeleton. Logistics/commercial fields intentionally query the
 * *server-only* service client separately from this public-tier fetch, and only
 * render through verifiedOrFallback — never a raw possibly-null number.
 */
export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square bg-charcoal-800" aria-hidden />

        <div>
          <p className="text-xs uppercase tracking-wide text-stone-400">
            {product.brand_name ?? "Khalis Perfumes"}
          </p>
          <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
          {product.volume_ml && <p className="mt-2 text-stone-400">{product.volume_ml}ml</p>}
          {product.description && <p className="mt-6 text-stone-200">{product.description}</p>}
          {product.fragrance_notes && (
            <p className="mt-4 text-sm text-stone-400">Notes: {product.fragrance_notes}</p>
          )}

          <dl className="mt-8 space-y-2 border-t border-charcoal-700 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-400">MOQ</dt>
              <dd>{verifiedOrFallback("PENDING_VERIFICATION", null)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Packaging</dt>
              <dd>{verifiedOrFallback("PENDING_VERIFICATION", null)}</dd>
            </div>
          </dl>

          <div className="mt-8 flex gap-4">
            <a
              href="/rfq"
              className="border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
            >
              Request Quotation
            </a>
            <a
              href="/rfq"
              className="border border-charcoal-700 px-6 py-3 text-sm uppercase tracking-wide text-stone-200"
            >
              Add to RFQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
