import Image from "next/image";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Manufacturing credibility. Deliberately no unverified numeric claims
 * ("150+ distributors", "50,000 bottles/day") — see docs/business-rules.md.
 */
export function TrustSection() {
  return (
    <section className="relative isolate hidden overflow-hidden border-b border-charcoal-700 px-6 py-20 md:block">
      <Image
        src={images.trust.accent}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-right"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/75 to-charcoal-900/35" />
      <Reveal className="relative z-10 mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
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
          <p className="text-xs uppercase tracking-wide text-gold">Private Label</p>
          <p className="mt-2 text-stone-200">
            Private-label and brand-partner programs available on request.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gold">Documentation</p>
          <p className="mt-2 text-stone-200">
            Export paperwork prepared per shipment — see{" "}
            <a href="/compliance" className="text-gold">Compliance</a>.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
