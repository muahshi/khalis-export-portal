import Link from "next/link";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-700 bg-charcoal-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-widest2 uppercase">
          Khalis <span className="text-gold">Export</span>
        </Link>

        <nav className="hidden gap-8 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm uppercase tracking-wide text-stone-200 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={siteConfig.cta.primary.href}
          className="hidden rounded-none border border-gold px-5 py-2 text-sm uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-charcoal-900 lg:inline-block"
        >
          {siteConfig.cta.primary.label}
        </Link>

        {/* Mobile nav trigger — Phase 2: wire to a drawer component */}
        <button className="lg:hidden" aria-label="Open menu">
          <span className="block h-px w-6 bg-stone-50" />
          <span className="mt-1.5 block h-px w-6 bg-stone-50" />
          <span className="mt-1.5 block h-px w-6 bg-stone-50" />
        </button>
      </div>
    </header>
  );
}
