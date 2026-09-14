import Image from "next/image";
import type { Market } from "@/types/domain";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Renders only markets marked `is_active_export_market` in the DB — never a
 * hardcoded country list. Empty state is intentional until markets are confirmed.
 */
export function GlobalMarketsSection({ markets }: { markets: Market[] }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src={images.globalMarkets.skyline}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Directional gradient (left-heavy, matching the left-aligned copy) rather
          than a uniform overlay, so the skyline photo stays recognizable. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/60 to-charcoal-900/10" />
      <Reveal className="relative z-10 mx-auto max-w-5xl">
        <h2 className="section-heading font-display uppercase tracking-wide">Global Export Markets</h2>
        {markets.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-3">
            {markets.map((m) => (
              <li key={m.id} className="border border-stone-200/20 bg-charcoal-900/40 px-4 py-2 text-sm text-stone-200 backdrop-blur-sm">
                {m.country_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-base text-stone-300">
            Serving international B2B buyers from the UAE. Active export markets — pending verification.
          </p>
        )}
      </Reveal>
    </section>
  );
}
