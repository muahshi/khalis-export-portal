import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Khalis Perfumes export team.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Contact</h1>
      <p className="mt-6 text-stone-400">
        Reach the export team via the RFQ form or WhatsApp. Direct contact details pending confirmation.
      </p>
    </div>
  );
}
