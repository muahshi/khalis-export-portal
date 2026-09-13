import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Certifications and export compliance information.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Compliance</h1>
      <p className="mt-6 text-stone-400">
        Certifications and compliance documentation are published here only once verified. See the Compliance section on the homepage for currently verified, publicly listed certifications.
      </p>
    </div>
  );
}
