// No unverified claims here — see docs/business-rules.md "never invent" list.
export const siteConfig = {
  name: "Khalis Global Export Portal",
  company: "Khalis Perfumes",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
