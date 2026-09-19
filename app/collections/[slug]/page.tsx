import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { Collection, PublicProduct } from "@/types/domain";

// See app/page.tsx for rationale.
export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseAnonServerClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!collection) notFound();

  const { data: links } = await supabase
    .from("collections_products")
    .select("product_id")
    .eq("collection_id", (collection as Collection).id);

  const productIds = (links ?? []).map((l: { product_id: string }) => l.product_id);
  const { data: products } = productIds.length
    ? await supabase.from("public_products").select("*").in("id", productIds)
    : { data: [] as PublicProduct[] };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">{(collection as Collection).name}</h1>
      {(collection as Collection).description && (
        <p className="mt-4 text-stone-400">{(collection as Collection).description}</p>
      )}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {((products as PublicProduct[]) ?? []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
