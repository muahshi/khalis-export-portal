import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logistics",
  description: "Carton, pallet, and container export logistics.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Logistics</h1>
      <p className="mt-6 text-stone-400">
        Container (20FT/40FT), carton, and pallet logistics detail per product — surfaced during the RFQ/quotation flow once packaging and carton data is verified for a given SKU.
      </p>
    </div>
  );
}
