import type { Market } from "@/types/domain";

/**
 * Renders only markets marked `is_active_export_market` in the DB — never a
 * hardcoded country list. Empty state is intentional until markets are confirmed.
 */
export function GlobalMarketsSection({ markets }: { markets: Market[] }) {
  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Global Export Markets</h2>
        {markets.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-3">
            {markets.map((m) => (
              <li key={m.id} className="border border-charcoal-700 px-4 py-2 text-sm text-stone-200">
                {m.country_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-stone-400">Active export markets — pending verification.</p>
        )}
      </div>
    </section>
  );
}
