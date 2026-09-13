import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/domain";

// Maps a DB collection to one of the photographed collection images by slug/name.
// Collections without a match simply render without a photo — nothing is hardcoded.
const COLLECTION_IMAGES: Record<string, string> = {
  niche: "/images/collections/niche.webp",
  luxury: "/images/collections/luxury.webp",
  "arabic-oud": "/images/collections/arabic-oud.webp",
  "arabic-and-oud": "/images/collections/arabic-oud.webp",
  oud: "/images/collections/arabic-oud.webp",
  french: "/images/collections/french.webp",
  "french-inspired": "/images/collections/french.webp",
  "attars-oils": "/images/collections/attars-oils.webp",
  "attars-and-oils": "/images/collections/attars-oils.webp",
  attar: "/images/collections/attars-oils.webp",
  deodorants: "/images/collections/deodorants.webp",
  deodorant: "/images/collections/deodorants.webp",
};

function imageForCollection(c: Collection): string | undefined {
  const key = (c.slug ?? c.name ?? "").toLowerCase().trim();
  return COLLECTION_IMAGES[key];
}

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
          {collections.map((c) => {
            const image = imageForCollection(c);
            return (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="group relative isolate flex min-h-[19rem] flex-col justify-end overflow-hidden border border-charcoal-700 bg-charcoal-800/40 p-6 transition-colors hover:border-gold"
              >
                {image && (
                  <>
                    <Image
                      src={image}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/70 to-charcoal-900/10"
                    />
                  </>
                )}
                <div className="relative z-10">
                  <p className="font-display text-lg uppercase tracking-wide">{c.name}</p>
                  {c.description && <p className="mt-2 text-sm text-stone-300">{c.description}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold">
                    Explore
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
