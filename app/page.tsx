import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { ManufacturingCapabilitySection } from "@/components/home/ManufacturingCapabilitySection";
import { FactorySection } from "@/components/home/FactorySection";
import { GlobalMarketsSection } from "@/components/home/GlobalMarketsSection";
import { LogisticsCapabilitySection } from "@/components/home/LogisticsCapabilitySection";
import { ComplianceSection } from "@/components/home/ComplianceSection";
import { RfqCTASection } from "@/components/home/RfqCTASection";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { Certification, Collection, Market, PublicProduct } from "@/types/domain";

// Server Component — reads only public-tier data via the anon client (RLS-enforced).
export default async function HomePage() {
  const supabase = getSupabaseAnonServerClient();

  const [{ data: collections }, { data: products }, { data: markets }, { data: certifications }] =
    await Promise.all([
      supabase.from("collections").select("*").limit(6),
      supabase.from("public_products").select("*").limit(8),
      supabase.from("markets").select("*").eq("is_active_export_market", true),
      supabase.from("certifications").select("*").eq("is_public", true).eq("verification_status", "VERIFIED"),
    ]);

  return (
    <>
      <Hero />
      <TrustSection />
      <CollectionsSection collections={(collections as Collection[]) ?? []} />
      <FeaturedProductsSection products={(products as PublicProduct[]) ?? []} />
      <ManufacturingCapabilitySection />
      <FactorySection />
      <GlobalMarketsSection markets={(markets as Market[]) ?? []} />
      <LogisticsCapabilitySection />
      <ComplianceSection certifications={(certifications as Certification[]) ?? []} />
      <RfqCTASection />
    </>
  );
}
