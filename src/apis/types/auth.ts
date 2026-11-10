// ──────────────────────────────────────────────
// Auth API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AuthSessionDto as GeneratedAuthSessionDto,
  TokenPairDto as GeneratedTokenPairDto,
} from "../generated/auth";

/** The bare body of `POST /auth/email/login` (contract-v3 §2.4). */
export type AuthSessionDto = GeneratedAuthSessionDto;
/** The bare body of `POST /auth/refresh`. */
export type TokenPairDto = GeneratedTokenPairDto;
