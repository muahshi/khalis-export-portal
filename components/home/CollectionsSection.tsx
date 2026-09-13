import Link from "next/link";
import type { Collection } from "@/types/domain";

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="border-b border-charcoal-700 bg-charcoal-900 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-widest2 text-gold">Our Collections</p>
        <h2 className="mt-3 font-display text-3xl uppercase tracking-wide md:text-4xl">
          Signature Fragrance Collections
        </h2>
        <p className="mt-3 max-w-xl text-sm text-stone-400">
          Explore our diverse range of fragrances crafted for global markets.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group border border-charcoal-700 bg-charcoal-800/40 p-6 transition-colors hover:border-gold"
            >
              <p className="font-display text-lg uppercase tracking-wide">{c.name}</p>
              {c.description && <p className="mt-2 text-sm text-stone-400">{c.description}</p>}
              <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold">
                Explore
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
