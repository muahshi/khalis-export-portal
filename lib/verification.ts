import type { VerificationStatus } from "@/types/domain";

/**
 * Single source of truth for "don't invent data" (docs/adr/0003...).
 * Every commercial/logistics UI path should go through this instead of
 * checking `status === "VERIFIED"` inline.
 */
export function verifiedOrFallback<T>(
  status: VerificationStatus,
  value: T | null | undefined,
  fallback: "Available on request" | "Pending verification" = "Available on request"
): T | string {
  if (status === "VERIFIED" && value !== null && value !== undefined) {
    return value;
  }
  return fallback;
}
