import type { VerificationStatus } from "@/types/domain";

/**
 * Single source of truth for "don't invent data" (docs/adr/0003, extended by
 * docs/adr/0005 for catalogue-sourced fields).
 * Every commercial/logistics UI path should go through this instead of
 * checking `status === "VERIFIED"` inline.
 */
const DISPLAYABLE_STATUSES: readonly VerificationStatus[] = ["VERIFIED", "VERIFIED_FROM_CATALOGUE"];

export function verifiedOrFallback<T>(
  status: VerificationStatus,
  value: T | null | undefined,
  fallback: "Available on request" | "Pending verification" = "Available on request"
): T | string {
  if (DISPLAYABLE_STATUSES.includes(status) && value !== null && value !== undefined) {
    return value;
  }
  return fallback;
}
