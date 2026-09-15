// Domain types aligned with supabase/migrations/0001_init.sql.
// Keep in sync manually until `supabase gen types typescript` is wired into CI.

export type VerificationStatus = "PENDING_VERIFICATION" | "VERIFIED" | "VERIFIED_FROM_CATALOGUE";
export type PackUnit = "ML" | "GRAM";
export type ImageStatus = "PENDING" | "AVAILABLE";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BusinessType =
  | "DISTRIBUTOR"
  | "WHOLESALER"
  | "RETAILER"
  | "IMPORTER"
  | "PRIVATE_LABEL"
  | "FRAGRANCE_BRAND"
  | "OTHER";
export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "ENTERPRISE";
export type RfqStatus = "NEW" | "QUALIFYING" | "QUOTED" | "NEGOTIATING" | "WON" | "LOST";
export type StaffRole = "SALES" | "MANAGER" | "ADMIN";
export type ContainerType = "20FT" | "40FT" | "40FT_HC";

interface Timestamped {
  created_at: string;
  updated_at: string;
}

export interface Brand extends Timestamped {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Category extends Timestamped {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Collection extends Timestamped {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  source: string;
}

/** PUBLIC-tier product shape — safe to send to an anonymous client. */
export interface PublicProduct {
  id: string;
  sku: string | null;
  slug: string;
  name: string;
  description: string | null;
  fragrance_notes: string | null;
  volume_ml: number | null;
  status: ProductStatus;
  brand_name: string | null;
  // Catalogue-derived (docs/adr/0005) — all PUBLIC-tier, all nullable since
  // not every product carries every field.
  barcode: string | null;
  inspiration: string | null;
  top_notes: string | null;
  middle_notes: string | null;
  base_notes: string | null;
  pack_size: number | null;
  pack_unit: PackUnit | null;
  image_status: ImageStatus;
}

/** Full product row — server-side only; never send raw to an anonymous client. */
export interface Product extends Timestamped {
  id: string;
  sku: string | null;
  slug: string;
  brand_id: string | null;
  name: string;
  description: string | null;
  fragrance_notes: string | null;
  volume_ml: number | null;
  status: ProductStatus;
  logistics_status: VerificationStatus;
  commercial_status: VerificationStatus;
  barcode: string | null;
  inspiration: string | null;
  top_notes: string | null;
  middle_notes: string | null;
  base_notes: string | null;
  pack_size: number | null;
  pack_unit: PackUnit | null;
  image_status: ImageStatus;
  catalogue_status: VerificationStatus;
}

/** CONFIDENTIAL tier — server-only, MANAGER/ADMIN-readable, never sent to an anonymous client. */
export interface CatalogueUnitPrice extends Timestamped {
  id: string;
  product_id: string;
  price_usd: number | null;
  price_aed: number | null;
  source_page: number | null;
  verification_status: VerificationStatus;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

/** Buyer/RFQ-tier — only ever surfaced within an RFQ/quotation context. */
export interface PackagingSpec extends Timestamped {
  id: string;
  product_id: string;
  packaging_type: string | null;
  private_label_available: boolean | null;
  verification_status: VerificationStatus;
}

export interface CartonSpec extends Timestamped {
  id: string;
  product_id: string;
  units_per_carton: number | null;
  carton_length_cm: number | null;
  carton_width_cm: number | null;
  carton_height_cm: number | null;
  carton_cbm: number | null;
  carton_gross_weight_kg: number | null;
  carton_net_weight_kg: number | null;
  verification_status: VerificationStatus;
}

export interface LogisticsSpec extends Timestamped {
  id: string;
  product_id: string;
  moq_units: number | null;
  moq_cartons: number | null;
  pallet_quantity: number | null;
  container_type: ContainerType | null;
  estimated_capacity_units: number | null;
  export_docs_available: boolean | null;
  lead_time_days: number | null;
  verification_status: VerificationStatus;
}

export interface Certification extends Timestamped {
  id: string;
  name: string;
  issuing_body: string | null;
  verification_status: VerificationStatus;
  is_public: boolean;
  document_id: string | null;
}

export interface Market {
  id: string;
  country_code: string;
  country_name: string;
  is_active_export_market: boolean;
  created_at: string;
}

export interface Company extends Timestamped {
  id: string;
  name: string;
  country: string | null;
  business_type: BusinessType | null;
  website: string | null;
}

export interface Contact extends Timestamped {
  id: string;
  company_id: string | null;
  full_name: string;
  email: string | null;
  whatsapp: string | null;
}

/** Shape submitted by the public RFQ form — validated server-side before insert. */
export interface RfqSubmission {
  full_name: string;
  company_name: string;
  country: string;
  business_type: BusinessType;
  email: string;
  whatsapp?: string;
  products: { product_id: string; estimated_quantity?: number; estimated_cartons?: number }[];
  container_interest?: ContainerType;
  target_market?: string;
  private_label_requirement?: boolean;
  packaging_requirement?: string;
  shipping_preference?: string;
  message?: string;
}

export interface Rfq extends Timestamped {
  id: string;
  contact_id: string;
  company_id: string | null;
  target_market: string | null;
  container_interest: ContainerType | null;
  private_label_requirement: boolean | null;
  packaging_requirement: string | null;
  shipping_preference: string | null;
  message: string | null;
  status: RfqStatus;
  lead_priority: LeadPriority | null;
}
