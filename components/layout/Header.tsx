"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Body scroll lock + ESC-to-close while the mobile drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-700 bg-charcoal-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-widest2 uppercase" onClick={() => setIsOpen(false)}>
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

        <button
          type="button"
          className="relative z-50 lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span
            className={`block h-px w-6 bg-stone-50 transition-transform ${
              isOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span className={`mt-1.5 block h-px w-6 bg-stone-50 transition-opacity ${isOpen ? "opacity-0" : ""}`} />
          <span
            className={`mt-1.5 block h-px w-6 bg-stone-50 transition-transform ${
              isOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Backdrop — click to close, sits below the drawer/header but above page content */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 top-[73px] z-30 bg-charcoal-900/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`relative z-40 overflow-hidden border-t border-charcoal-700 bg-charcoal-900 transition-[max-height] duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4" aria-label="Mobile">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="border-b border-charcoal-700 py-3 text-sm uppercase tracking-wide text-stone-200 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={siteConfig.cta.primary.href}
            onClick={() => setIsOpen(false)}
            className="mt-5 mb-2 border border-gold px-5 py-3 text-center text-sm uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-charcoal-900"
          >
            {siteConfig.cta.primary.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
