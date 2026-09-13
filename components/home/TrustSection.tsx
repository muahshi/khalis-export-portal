import { siteConfig } from "@/config/site";

/**
 * Manufacturing credibility. Deliberately no unverified numeric claims
 * ("150+ distributors", "50,000 bottles/day") — see docs/business-rules.md.
 */
export function TrustSection() {
  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gold">Manufacturer</p>
          <p className="mt-2 text-stone-200">
            In-house production at our {siteConfig.factory.location} facility.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gold">Export-ready</p>
          <p className="mt-2 text-stone-200">
            Built for carton, pallet, and container-scale B2B orders.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gold">Partnership</p>
          <p className="mt-2 text-stone-200">
            Private-label and brand-partner programs available on request.
          </p>
        </div>
      </div>
    </section>
  );
}
