// ──────────────────────────────────────────────
// Storage admin API types: aliases of the generated DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminStorageBucketDto as GeneratedAdminStorageBucketDto,
  AdminStorageMetricsDto,
  AdminStoragePlanDto as GeneratedAdminStoragePlanDto,
  AdminStorageTopAccountDto as GeneratedAdminStorageTopAccountDto,
} from "../generated/core";

// ─── Storage overview (GET /core/admin/metrics/storage) ───

export type AdminStorageDataDto = AdminStorageMetricsDto;
export type AdminStorageBucketDto = GeneratedAdminStorageBucketDto;
export type AdminStorageTopAccountDto = GeneratedAdminStorageTopAccountDto;
export type AdminStoragePlanDto = GeneratedAdminStoragePlanDto;
