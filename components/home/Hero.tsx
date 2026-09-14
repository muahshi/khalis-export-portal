import Link from "next/link";
import { siteConfig } from "@/config/site";

// Trust-strip icons: small inline SVGs (no icon library dependency) matching
// the site's gold/line-art visual language.
function IconManufacturer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M3 21V10l6-4v4l6-4v15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21h18" strokeLinecap="round" />
    </svg>
  );
}
function IconExport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="7" width="18" height="12" rx="1" />
      <path d="M3 11h18M8 7V5h8v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPartnership() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.5 20c0-3 2.5-5.5 5.5-5.5S13.5 17 13.5 20M14 20c0-2.2 1.7-4 4-4s4 1.8 4 4" strokeLinecap="round" />
    </svg>
  );
}

const TRUST_ITEMS = [
  {
    icon: IconManufacturer,
    label: "Manufacturer",
    copy: `In-house production in ${siteConfig.factory.location}.`,
  },
  {
    icon: IconExport,
    label: "Export-ready",
    copy: "Carton, pallet, and container-scale B2B orders.",
  },
  {
    icon: IconPartnership,
    label: "Partnership",
    copy: "Private label programs on request.",
  },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden border-b border-charcoal-700 px-6 py-16 text-left md:py-28 md:text-center">
      {/* Background photography — plain CSS background-image (not next/image) so the
          hero renders reliably regardless of the image-optimizer pipeline. Visual
          atmosphere only; all copy/CTAs below are real HTML. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-top md:hidden"
        style={{ backgroundImage: "url(/images/hero-mobile.webp)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: "url(/images/hero-bg.webp)" }}
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
        <h1 className="mt-6 font-display text-4xl leading-[1.1] sm:text-5xl md:mx-auto md:text-6xl">
          Luxury Fragrance Manufacturing &amp;{" "}
          <span className="text-gold">Global B2B Export</span>
        </h1>
        <p className="mt-6 text-sm text-stone-200 md:mx-auto md:max-w-xl md:text-base">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10 md:flex-wrap md:justify-center md:gap-4">
          <Link
            href={siteConfig.cta.primary.href}
            className="border border-gold bg-gold px-7 py-3.5 text-center text-sm font-medium uppercase tracking-wide text-charcoal-900 transition-colors hover:bg-gold-light"
          >
            {siteConfig.cta.primary.label}
          </Link>
          <Link
            href={siteConfig.cta.secondary.href}
            className="border border-stone-200/60 px-7 py-3.5 text-center text-sm uppercase tracking-wide text-stone-200 transition-colors hover:border-stone-50 hover:bg-stone-50/10"
          >
            {siteConfig.cta.secondary.label}
          </Link>
        </div>

        {/* Compact trust strip — mobile only. Desktop keeps this in TrustSection further down. */}
        <div className="mt-9 grid grid-cols-3 gap-3 border-t border-stone-200/15 pt-6 md:hidden">
          {TRUST_ITEMS.map(({ icon: Icon, label, copy }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 text-gold">
                <Icon />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-gold">{label}</p>
              <p className="mt-1 text-[11px] leading-snug text-stone-300">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
