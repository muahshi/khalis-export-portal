import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Static routes only in Phase 1. Phase 2 should extend this with dynamic
// /products/[slug] and /collections/[slug] entries pulled from Supabase.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/products", "/collections", "/factory", "/manufacturing", "/compliance", "/logistics", "/about", "/contact", "/rfq"];
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
