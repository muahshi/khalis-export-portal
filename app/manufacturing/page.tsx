import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manufacturing",
  description: "Manufacturing capability overview.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Manufacturing</h1>
      <p className="mt-6 text-stone-400">
        Detailed manufacturing process documentation — filling, crimping, labelling, packaging, quality control, R&D, warehouse, batch coding, dispatch, and export preparation — pending verified process detail.
      </p>
    </div>
  );
}
