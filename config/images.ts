// Centralized image manifest — semantic name -> actual asset path.
// Components should import from here instead of hardcoding "/images/..." paths,
// so a future physical folder restructure (public/images/hero/, /factory/, etc.)
// only requires editing this file.
//
// NOTE: assets currently live flat under /public/images (not yet split into
// hero/, factory/, collections/ subfolders as the target structure describes,
// except /collections which already exists). Physically moving files was left
// for a follow-up pass — it's zero-risk to do at any time now that every
// reference below runs through this manifest instead of being scattered
// across components.

export const images = {
  hero: {
    desktop: "/images/hero-bg.webp",
    mobile: "/images/hero-mobile.webp",
  },
  factory: {
    exterior: "/images/factory-uaq.webp",
  },
  manufacturing: {
    productionLine: "/images/production-line.webp",
  },
  logistics: {
    port: "/images/logistics.webp",
  },
  compliance: {
    documents: "/images/compliance.webp",
  },
  globalMarkets: {
    skyline: "/images/map-skyline.webp",
  },
  featuredProducts: {
    backdrop: "/images/featured-products.webp",
  },
  cta: {
    backdrop: "/images/cta-bg.webp",
  },
  trust: {
    accent: "/images/brand-accent.webp",
  },
  collections: {
    niche: "/images/collections/niche.webp",
    luxury: "/images/collections/luxury.webp",
    "arabic-oud": "/images/collections/arabic-oud.webp",
    "arabic-and-oud": "/images/collections/arabic-oud.webp",
    oud: "/images/collections/arabic-oud.webp",
    french: "/images/collections/french.webp",
    "french-inspired": "/images/collections/french.webp",
    "attars-oils": "/images/collections/attars-oils.webp",
    "attars-and-oils": "/images/collections/attars-oils.webp",
    attar: "/images/collections/attars-oils.webp",
    deodorants: "/images/collections/deodorants.webp",
    deodorant: "/images/collections/deodorants.webp",
  },
} as const;
