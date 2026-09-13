import Link from "next/link";
import type { Collection } from "@/types/domain";

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Collections</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="border border-charcoal-700 p-6 transition-colors hover:border-gold"
            >
              <p className="font-display text-lg">{c.name}</p>
              {c.description && <p className="mt-2 text-sm text-stone-400">{c.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
