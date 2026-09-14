import Image from "next/image";

export function LogisticsCapabilitySection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src="/images/logistics.webp"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-charcoal-900/80" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Logistics Capability</h2>
        <p className="mt-4 text-stone-200">
          Carton, pallet, and container (20FT/40FT) order support. Per-product carton
          configuration, weights, and container capacity are confirmed during quotation —
          see <a href="/logistics" className="text-gold">Logistics</a>.
        </p>
      </div>
    </section>
  );
}
