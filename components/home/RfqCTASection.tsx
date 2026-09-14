import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

export function RfqCTASection() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-24 text-center">
      <Image
        src={images.cta.backdrop}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/65 to-charcoal-900/30" />
      <Reveal className="relative z-10">
        <h2 className="section-heading font-display uppercase tracking-wide">Ready to source from Khalis?</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-stone-200">
          Tell us your market, required products and expected volume — our export team
          will follow up with a tailored quotation.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={siteConfig.cta.primary.href}
            className="border border-gold bg-gold px-8 py-3 text-sm font-medium uppercase tracking-wide text-charcoal-900 hover:bg-gold-light"
          >
            {siteConfig.cta.primary.label}
          </Link>
          {/* Not yet a live deep link — services/whatsapp lands in Phase 2. Rendered as an
              honestly-inert secondary action (no handler) rather than a fake wa.me link.
              This section is a Server Component, so it deliberately has no onClick. */}
          <span
            aria-disabled="true"
            className="cursor-not-allowed border border-stone-200/30 px-8 py-3 text-sm uppercase tracking-wide text-stone-400"
            title="Coming soon"
          >
            {siteConfig.cta.whatsapp.label}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
