import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { PublicProduct } from "@/types/domain";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse Khalis Perfumes' export-ready fragrance catalogue for B2B buyers.",
};

// See app/page.tsx for rationale.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const supabase = getSupabaseAnonServerClient();
  const q = searchParams.q?.trim();

  let query = supabase.from("public_products").select("*").order("name");
  if (q) {
    // Search by product name or catalogue barcode — brief §10 (category/size/name/barcode).
    query = query.or(`name.ilike.%${q}%,barcode.ilike.%${q}%`);
  }
  const { data: products } = await query;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Products</h1>
      <p className="mt-3 max-w-2xl text-sm text-stone-400">
        {(products ?? []).length} export-ready products from the official Khalis catalogue.
      </p>

      <form className="mt-8 flex gap-3" action="/products" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by product name or barcode"
          className="w-full max-w-sm border border-charcoal-700 bg-charcoal-900 px-4 py-3 text-sm text-stone-50"
        />
        <button
          type="submit"
          className="border border-gold px-6 py-3 text-xs uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
        >
          Search
        </button>
      </form>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {((products as PublicProduct[]) ?? []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {(products ?? []).length === 0 && (
        <p className="mt-10 text-sm text-stone-400">No products match “{q}”. Try a different search.</p>
      )}
    </div>
  );
}
