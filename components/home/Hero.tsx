import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="border-b border-charcoal-700 px-6 py-28 text-center">
      <p className="text-xs uppercase tracking-widest2 text-gold">
        Direct from UAE Manufacturer
      </p>
      <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
        Luxury Fragrance Manufacturing &amp; Global B2B Export
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-stone-400">{siteConfig.description}</p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          href={siteConfig.cta.primary.href}
          className="border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
        >
          {siteConfig.cta.primary.label}
        </Link>
        <Link
          href={siteConfig.cta.secondary.href}
          className="border border-charcoal-700 px-6 py-3 text-sm uppercase tracking-wide text-stone-200 hover:border-stone-200"
        >
          {siteConfig.cta.secondary.label}
        </Link>
      </div>
    </section>
  );
}
