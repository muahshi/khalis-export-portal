import { ProductCard } from "@/components/product/ProductCard";
import type { PublicProduct } from "@/types/domain";

export function FeaturedProductsSection({ products }: { products: PublicProduct[] }) {
  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Featured Export Products</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
