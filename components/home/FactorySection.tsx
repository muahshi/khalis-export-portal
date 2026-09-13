import Link from "next/link";
import { siteConfig } from "@/config/site";

export function FactorySection() {
  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-2xl uppercase tracking-wide">Our Factory</h2>
        <p className="mt-4 text-stone-400">
          Manufacturing operations based in {siteConfig.factory.location}.
        </p>
        <Link href="/factory" className="mt-6 inline-block text-sm uppercase tracking-wide text-gold">
          Explore the factory →
        </Link>
      </div>
    </section>
  );
}
