import Link from "next/link";
import type { PublicProduct } from "@/types/domain";

function formatPackSize(product: PublicProduct): string | null {
  if (product.pack_size != null && product.pack_unit) {
    return `${product.pack_size}${product.pack_unit === "ML" ? "ml" : "g"}`;
  }
  if (product.volume_ml) return `${product.volume_ml}ml`;
  return null;
}

export function ProductCard({ product }: { product: PublicProduct }) {
  const packSize = formatPackSize(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border border-charcoal-700 p-5 transition-colors hover:border-gold"
    >
      <div
        className="flex aspect-square items-center justify-center bg-charcoal-800 text-center text-[10px] uppercase tracking-wide text-stone-500"
        aria-hidden
      >
        {product.image_status === "PENDING" ? "Image available on request" : ""}
      </div>
      <p className="mt-4 text-xs uppercase tracking-wide text-stone-400">
        {product.brand_name ?? "Khalis Perfumes"}
      </p>
      <p className="mt-1 font-display text-lg">{product.name}</p>
      <p className="mt-1 text-sm text-stone-400">
        {[packSize, product.barcode].filter(Boolean).join(" · ")}
      </p>
      <span className="mt-4 inline-block text-xs uppercase tracking-wide text-gold group-hover:underline">
        View Specifications →
      </span>
    </Link>
  );
}
