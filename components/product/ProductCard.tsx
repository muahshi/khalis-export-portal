import Link from "next/link";
import type { PublicProduct } from "@/types/domain";

export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border border-charcoal-700 p-5 transition-colors hover:border-gold"
    >
      <div className="aspect-square bg-charcoal-800" aria-hidden />
      <p className="mt-4 text-xs uppercase tracking-wide text-stone-400">
        {product.brand_name ?? "Khalis Perfumes"}
      </p>
      <p className="mt-1 font-display text-lg">{product.name}</p>
      {product.volume_ml && <p className="mt-1 text-sm text-stone-400">{product.volume_ml}ml</p>}
      <span className="mt-4 inline-block text-xs uppercase tracking-wide text-gold group-hover:underline">
        View Specifications →
      </span>
    </Link>
  );
}
