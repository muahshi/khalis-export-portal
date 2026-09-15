import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";

// Static routes + dynamic /products/[slug] and /collections/[slug] entries
// pulled from Supabase (docs/adr/0005 — extends the Phase 1 static-only sitemap
// now that real catalogue data exists).
// Static routes + dynamic /products/[slug] and /collections/[slug] entries
// pulled from Supabase (docs/adr/0005 — extends the Phase 1 static-only sitemap
// now that real catalogue data exists). Forced dynamic like the other
// Supabase-backed routes (see app/page.tsx) — otherwise Next tries to
// prerender this at build time, before Supabase env vars are available.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/products",
    "/collections",
    "/factory",
    "/manufacturing",
    "/compliance",
    "/logistics",
    "/about",
    "/contact",
    "/rfq",
  ];

  const supabase = getSupabaseAnonServerClient();
  const [{ data: products }, { data: collections }] = await Promise.all([
    supabase.from("public_products").select("slug"),
    supabase.from("collections").select("slug"),
  ]);

  const dynamicRoutes = [
    ...((products ?? []) as { slug: string }[]).map((p) => `/products/${p.slug}`),
    ...((collections ?? []) as { slug: string }[]).map((c) => `/collections/${c.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
