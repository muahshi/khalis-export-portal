import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Factory",
  description: "Khalis Perfumes manufacturing facility in Umm Al Quwain, UAE.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Factory</h1>
      <p className="mt-6 text-stone-400">
        Facility, production line, and quality-control detail for our Umm Al Quwain manufacturing site — content pending verified data from Khalis. See docs/business-rules.md for what may be published here.
      </p>
    </div>
  );
}
