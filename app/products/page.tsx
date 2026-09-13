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

export default async function ProductsPage() {
  const supabase = getSupabaseAnonServerClient();
  const { data: products } = await supabase.from("public_products").select("*");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Products</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {((products as PublicProduct[]) ?? []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
