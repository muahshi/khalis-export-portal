import Link from "next/link";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-charcoal-700 bg-charcoal-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-lg uppercase tracking-widest2">Khalis Export</p>
            <p className="mt-3 max-w-xs text-sm text-stone-400">{siteConfig.description}</p>
          </div>

          <nav aria-label="Footer">
            <p className="text-xs uppercase tracking-wide text-stone-400">Navigate</p>
            <ul className="mt-3 space-y-2">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-stone-200 hover:text-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs uppercase tracking-wide text-stone-400">Factory</p>
            <p className="mt-3 text-sm text-stone-200">{siteConfig.factory.location}</p>
          </div>
        </div>

        <p className="mt-16 text-xs text-stone-400">
          © {new Date().getFullYear()} {siteConfig.company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
