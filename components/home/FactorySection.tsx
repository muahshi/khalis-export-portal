import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

export function FactorySection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-24">
      <Image
        src={images.factory.exterior}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/75 to-charcoal-900/50"
      />
      <Reveal className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="section-heading font-display uppercase tracking-wide">Our Factory</h2>
        <p className="mt-4 text-base text-stone-200">
          Manufacturing operations based in {siteConfig.factory.location}.
        </p>
        <Link href="/factory" className="mt-6 inline-block text-sm uppercase tracking-wide text-gold">
          Explore the factory →
        </Link>
      </Reveal>
    </section>
  );
}
