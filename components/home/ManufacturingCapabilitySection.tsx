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
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Manufacturing Capability</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <li key={c} className="border border-charcoal-700 px-4 py-3 text-sm text-stone-200">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
