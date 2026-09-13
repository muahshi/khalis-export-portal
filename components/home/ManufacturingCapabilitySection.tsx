import Image from "next/image";

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

/** Lists process capability categories only — no throughput or capacity claims. */
export function ManufacturingCapabilitySection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src="/images/production-line.webp"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-charcoal-900/85"
      />
      <div className="relative z-10 mx-auto max-w-5xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">
          From Concept to Creation
        </h2>
        <p className="mt-4 max-w-2xl text-stone-300">Manufacturing Capability</p>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <li
              key={c}
              className="border border-stone-200/20 bg-charcoal-900/40 px-4 py-3 text-sm text-stone-200 backdrop-blur-sm"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
