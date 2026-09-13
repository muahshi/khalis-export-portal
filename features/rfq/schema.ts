import { z } from "zod";

// Max lengths are a basic abuse/DoS mitigation on an unauthenticated public
// endpoint — not a substitute for real rate limiting (see docs/security.md,
// "RFQ abuse considerations" for what's still outstanding).
export const rfqSubmissionSchema = z.object({
  full_name: z.string().min(2).max(200),
  company_name: z.string().min(2).max(200),
  country: z.string().min(2).max(100),
  business_type: z.enum([
    "DISTRIBUTOR",
    "WHOLESALER",
    "RETAILER",
    "IMPORTER",
    "PRIVATE_LABEL",
    "FRAGRANCE_BRAND",
    "OTHER",
  ]),
  email: z.string().email().max(320),
  whatsapp: z.string().max(32).optional(),
  // Optional: the standalone /rfq page is a general contact form with no
  // product picker yet (that's Phase 2). "Add to RFQ" from a product page
  // can populate this once that flow exists. Requiring min(1) here made
  // every submission from the current form fail — see docs/adr/0004.
  products: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        estimated_quantity: z.number().int().positive().max(10_000_000).optional(),
        estimated_cartons: z.number().int().positive().max(10_000_000).optional(),
      })
    )
    .max(50)
    .default([]),
  container_interest: z.enum(["20FT", "40FT", "40FT_HC"]).optional(),
  target_market: z.string().max(200).optional(),
  private_label_requirement: z.boolean().optional(),
  packaging_requirement: z.string().max(500).optional(),
  shipping_preference: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),
});

export type RfqSubmissionInput = z.infer<typeof rfqSubmissionSchema>;
