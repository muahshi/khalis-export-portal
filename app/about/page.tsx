import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Khalis Perfumes and the export division.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">About</h1>
      <p className="mt-6 text-stone-400">
        Company background and export division information — pending confirmed company copy from Khalis.
      </p>
    </div>
  );
}
