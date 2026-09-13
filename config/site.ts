// No unverified claims here — see docs/business-rules.md "never invent" list.
export const siteConfig = {
  name: "Khalis Global Export Portal",
  company: "Khalis Perfumes",
  // Falls back to the real production URL, not localhost — if
  // NEXT_PUBLIC_SITE_URL is ever missing on Vercel, canonical/OpenGraph tags
  // must not silently point at localhost (brief §11). Local dev sets this
  // explicitly via .env.local (see .env.example) and is unaffected.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://export.khalisperfumes.com",
  publicSite: "https://khalisperfumes.com",
  description:
    "Direct-from-UAE manufacturer. Luxury fragrance manufacturing and global B2B export for distributors, wholesalers, importers, retailers, and private-label buyers.",
  factory: {
    location: "Umm Al Quwain (UAQ), United Arab Emirates",
  },
  cta: {
    primary: { label: "Request an RFQ", href: "/rfq" },
    secondary: { label: "Download Export Catalog", href: "/export-catalog.pdf" },
    whatsapp: { label: "WhatsApp Export Team" }, // wired to services/whatsapp in Phase 2
  },
} as const;
