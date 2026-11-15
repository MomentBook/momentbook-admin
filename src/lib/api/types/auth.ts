// ──────────────────────────────────────────────
// Auth API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AuthSessionDto as GeneratedAuthSessionDto,
  EmailLoginDto as GeneratedEmailLoginDto,
  TokenPairDto as GeneratedTokenPairDto,
} from "@/lib/api/generated/auth";

/** The body of `POST /auth/email/login`. */
export type EmailLoginDto = GeneratedEmailLoginDto;
/** The bare body of `POST /auth/email/login` (contract-v3 §2.4). */
export type AuthSessionDto = GeneratedAuthSessionDto;
/** The bare body of `POST /auth/refresh`. */
export type TokenPairDto = GeneratedTokenPairDto;
