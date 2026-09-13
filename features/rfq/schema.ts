import { z } from "zod";

export const rfqSubmissionSchema = z.object({
  full_name: z.string().min(2),
  company_name: z.string().min(2),
  country: z.string().min(2),
  business_type: z.enum([
    "DISTRIBUTOR",
    "WHOLESALER",
    "RETAILER",
    "IMPORTER",
    "PRIVATE_LABEL",
    "FRAGRANCE_BRAND",
    "OTHER",
  ]),
  email: z.string().email(),
  whatsapp: z.string().optional(),
  products: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        estimated_quantity: z.number().int().positive().optional(),
        estimated_cartons: z.number().int().positive().optional(),
      })
    )
    .min(1),
  container_interest: z.enum(["20FT", "40FT", "40FT_HC"]).optional(),
  target_market: z.string().optional(),
  private_label_requirement: z.boolean().optional(),
  packaging_requirement: z.string().optional(),
  shipping_preference: z.string().optional(),
  message: z.string().optional(),
});

export type RfqSubmissionInput = z.infer<typeof rfqSubmissionSchema>;
