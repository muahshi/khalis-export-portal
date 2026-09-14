import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/domain";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

function imageForCollection(c: Collection): string | undefined {
  const key = (c.slug ?? c.name ?? "").toLowerCase().trim();
  return (images.collections as Record<string, string>)[key];
}

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="border-b border-charcoal-700 bg-charcoal-900 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-widest2 text-gold">Our Collections</p>
        <h2 className="section-heading mt-3 font-display uppercase tracking-wide">
          Signature Fragrance Collections
        </h2>
        <p className="mt-3 max-w-xl text-sm text-stone-400">
          Explore our diverse range of fragrances crafted for global markets.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const image = imageForCollection(c);
            return (
              <Reveal key={c.id} delay={i * 0.05} className={i === 0 ? "lg:col-span-2" : undefined}>
                <Link
                  href={`/collections/${c.slug}`}
                  className={`group relative isolate flex min-h-[19rem] flex-col justify-end overflow-hidden border border-charcoal-700 bg-charcoal-800/40 p-6 transition-colors hover:border-gold ${
                    i === 0 ? "lg:min-h-[24rem]" : ""
                  }`}
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
                      Explore Collection
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
