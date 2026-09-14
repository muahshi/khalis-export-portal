import Image from "next/image";
import { ProductCard } from "@/components/product/ProductCard";
import type { PublicProduct } from "@/types/domain";

export function FeaturedProductsSection({ products }: { products: PublicProduct[] }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src="/images/featured-products.webp"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-charcoal-900/88" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Featured Export Products</h2>
        {products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">Featured products — coming soon.</p>
        )}
      </div>
    </section>
  );
}
