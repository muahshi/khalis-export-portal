import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden border-b border-charcoal-700 px-6 py-28 text-center">
      {/* Background photography — visual atmosphere only; all copy/CTAs below are real HTML */}
      <Image
        src="/images/hero-mobile.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:hidden"
      />
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />

      {/* Legibility scrim over the photo — decorative, not content */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/70 to-charcoal-900/30"
      />

      <div className="relative z-10 mx-auto">
        <p className="text-xs uppercase tracking-widest2 text-gold">
          Direct from UAE Manufacturer
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          Luxury Fragrance Manufacturing &amp; Global B2B Export
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-stone-200">{siteConfig.description}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={siteConfig.cta.primary.href}
            className="border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-charcoal-900"
          >
            {siteConfig.cta.primary.label}
          </Link>
          <Link
            href={siteConfig.cta.secondary.href}
            className="border border-stone-200/60 px-6 py-3 text-sm uppercase tracking-wide text-stone-200 transition-colors hover:border-stone-50 hover:bg-stone-50/10"
          >
            {siteConfig.cta.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
