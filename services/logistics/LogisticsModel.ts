/**
 * Domain model only — the full calculator is Phase 2 (brief §17). All values
 * are derived exclusively from VERIFIED carton_specs/logistics_specs rows;
 * never estimated or defaulted.
 */
import type { CartonSpec, ContainerType, LogisticsSpec } from "@/types/domain";

export interface ContainerCapacityEstimate {
  containerType: ContainerType;
  totalUnits: number;
  totalCartons: number;
  totalCbm: number;
  totalWeightKg: number;
}

/**
 * Phase 2 will implement this against real container CBM limits (20FT ≈ 28–30 CBM,
 * 40FT ≈ 58–60 CBM, 40FT_HC ≈ 68–70 CBM) once those figures are confirmed by Khalis.
 * Phase 1 only defines the shape so downstream code can be written against it.
 */
export function estimateContainerCapacity(
  _carton: CartonSpec,
  _logistics: LogisticsSpec,
  _containerType: ContainerType
): ContainerCapacityEstimate | null {
  if (_carton.verification_status !== "VERIFIED") return null;
  throw new Error("Logistics calculator not implemented — Phase 2 (brief §17).");
}
