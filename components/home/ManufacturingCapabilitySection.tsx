import Image from "next/image";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

const CAPABILITIES = [
  "Filling",
  "Crimping",
  "Labelling",
  "Cellophane",
  "Packaging",
  "Quality control",
  "R&D",
  "Warehouse",
  "Batch coding",
  "Dispatch",
  "Export preparation",
];

// Single minimal process-step glyph reused across the grid — deliberately generic
// rather than inventing a distinct icon (and an unverified description) per step.
function StepIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-gold">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Lists process capability categories only — no throughput or capacity claims. */
export function ManufacturingCapabilitySection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src={images.manufacturing.productionLine}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/65 to-charcoal-900/20" />
      <Reveal className="relative z-10 mx-auto max-w-5xl">
        <h2 className="section-heading font-display uppercase tracking-wide">From Concept to Creation</h2>
        <p className="mt-4 max-w-2xl text-base text-stone-300">Manufacturing Capability</p>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <li
              key={c}
              className="flex items-center gap-2 border border-stone-200/20 bg-charcoal-900/50 px-4 py-3 text-sm text-stone-200 backdrop-blur-sm"
            >
              <StepIcon />
              {c}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
