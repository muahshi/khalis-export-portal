import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function RfqCTASection() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-24 text-center">
      <Image
        src="/images/cta-bg.webp"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-charcoal-900/70"
      />
      <div className="relative z-10">
        <h2 className="font-display text-3xl uppercase tracking-wide">Ready to import from Khalis?</h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-200">
          Tell us your target market, quantity, and packaging requirements — our export team
          will follow up with a tailored quotation.
        </p>
        <Link
          href={siteConfig.cta.primary.href}
          className="mt-8 inline-block border border-gold px-8 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
        >
          {siteConfig.cta.primary.label}
        </Link>
      </div>
    </section>
  );
}
