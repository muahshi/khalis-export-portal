import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden border-b border-charcoal-700 px-6 py-16 text-left md:py-28 md:text-center">
      {/* Background photography — visual atmosphere only; all copy/CTAs below are real HTML */}
      <Image
        src="/images/hero-mobile.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top md:hidden"
      />
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />

      {/* Legibility scrims over the photo — decorative, not content */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal-900/90 via-charcoal-900/55 to-transparent md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-charcoal-900/40 md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-t from-charcoal-900 via-charcoal-900/70 to-charcoal-900/30 md:block"
      />

      <div className="relative z-10 mx-auto w-full max-w-[19rem] sm:max-w-sm md:max-w-3xl">
        <p className="text-xs uppercase tracking-widest2 text-gold">
          Direct from UAE Manufacturer
        </p>
        <h1 className="mt-6 font-display text-3xl leading-tight sm:text-4xl md:mx-auto md:text-6xl">
          Luxury Fragrance Manufacturing &amp; Global B2B Export
        </h1>
        <p className="mt-6 text-sm text-stone-200 md:mx-auto md:max-w-xl md:text-base">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10 md:flex-wrap md:justify-center md:gap-4">
          <Link
            href={siteConfig.cta.primary.href}
            className="border border-gold px-6 py-3 text-center text-sm uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-charcoal-900"
          >
            {siteConfig.cta.primary.label}
          </Link>
          <Link
            href={siteConfig.cta.secondary.href}
            className="border border-stone-200/60 px-6 py-3 text-center text-sm uppercase tracking-wide text-stone-200 transition-colors hover:border-stone-50 hover:bg-stone-50/10"
          >
            {siteConfig.cta.secondary.label}
          </Link>
        </div>

        {/* Compact trust strip — mobile only. Desktop keeps this in TrustSection further down. */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-stone-200/15 pt-6 md:hidden">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gold">Manufacturer</p>
            <p className="mt-1 text-[11px] leading-snug text-stone-300">
              In-house production in {siteConfig.factory.location}.
            </p>
          </div>
          <div className="border-l border-stone-200/15 pl-3">
            <p className="text-[10px] uppercase tracking-wide text-gold">Export-ready</p>
            <p className="mt-1 text-[11px] leading-snug text-stone-300">
              Carton, pallet, and container-scale B2B orders.
            </p>
          </div>
          <div className="border-l border-stone-200/15 pl-3">
            <p className="text-[10px] uppercase tracking-wide text-gold">Partnership</p>
            <p className="mt-1 text-[11px] leading-snug text-stone-300">
              Private label programs on request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
