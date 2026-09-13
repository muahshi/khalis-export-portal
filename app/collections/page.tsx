import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Khalis Perfumes collections for B2B export.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Collections</h1>
      <p className="mt-6 text-stone-400">
        Collection listing — see individual collection pages for products.
      </p>
    </div>
  );
}
