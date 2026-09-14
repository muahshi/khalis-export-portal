import Image from "next/image";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

const FLOW = ["Factory", "Carton", "Pallet", "Container", "International Destination"];

export function LogisticsCapabilitySection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src={images.logistics.port}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/55 to-charcoal-900/10" />
      <Reveal className="relative z-10 mx-auto max-w-4xl">
        <h2 className="section-heading font-display uppercase tracking-wide">Logistics Capability</h2>
        <p className="mt-4 text-base text-stone-200">
          Carton, pallet, and container (20FT/40FT) order support. Per-product carton
          configuration, weights, and container capacity are confirmed during quotation —
          see <a href="/logistics" className="text-gold">Logistics</a>.
        </p>
        <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3 text-xs uppercase tracking-wide text-stone-300">
          {FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="border border-stone-200/25 bg-charcoal-900/50 px-3 py-1.5 backdrop-blur-sm">{step}</span>
              {i < FLOW.length - 1 && <span aria-hidden="true" className="text-gold">→</span>}
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
