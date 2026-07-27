# 0007: Hand-Written API Types and Domain-Organized Service Layer

## Status

Active. Supersedes [0003](0003-backend-contract-and-api-wrapper.md).

## Decision

Replace the Swagger code generation pipeline (`yarn generate:api`) with
hand-written TypeScript types and a domain-organized API service layer,
following the patterns established by the backend NestJS monorepo
(momentbook-api).

## Motivation

The previous approach generated `src/apis/core/client.ts` (5,388 lines)
from the backend Swagger spec. Only **28 of ~170+ exported types** (16%)
were actually used by the admin app. The generated `Api` and `HttpClient`
classes were never instantiated at runtime. The code generation added:

- A runtime dependency on `swagger-typescript-api` (via `npx`)
- An environment variable for the Swagger URL (`API_SWAGGER_URL`)
- Startup latency from fetching the Swagger spec
- Dead code that confused developers and type-checkers

Hand-written types provide:

- **Precision** — only the types actually needed by the admin app
- **Clarity** — proper string/number types instead of `object` (which the
  Swagger generator produced for weakly-typed fields like JWT claims)
- **Maintainability** — backend contract changes are updated directly in the
  admin frontend, in coordination with backend work
- **No codegen infrastructure** — no Swagger URL, no generator tool, no
  regeneration step

## Implementation Shape

### Type Definitions (`src/apis/types/`)

Three domain-organized files, following momentbook-api's DTO naming conventions:

```
src/apis/types/
├── index.ts       # Barrel re-export
├── shared.ts      # LocalDateTimeContext, CaptureTimeContext, SeoImage, JourneyImageLocation
├── journeys.ts    # JourneyReview, PublishedJourney*, AdminPublishedJourney*, Update*Review*
└── articles.ts    # Article*, AdminArticle*, Create*Request*, Update*Request*
```

Patterns:
- All types are plain TypeScript interfaces and literal union types
- Enums use `enum` keyword for runtime-accessible values
- Response wrappers follow backend shape: `{ status: 'success', data: T }`
- Pagination follows backend shape: `{ items[], total, page, pages, limit, hasMore }`
- Admin item types extend public item types via interface inheritance

### API Service Layer (`lib/api/`)

Domain-organized service functions replacing the monolithic `lib/admin/api.ts`:

```
lib/api/
├── client.ts       # Shared fetch infrastructure
│   ├── requestEnvelope<T>() — generic fetch wrapper with auth + error parsing
│   ├── parseEnvelope<T>() — response envelope parsing
│   ├── BackendApiError, AdminSessionExpiredError, AdminAccessDeniedError
│   └── isBackendApiError() — cross-chunk-safe type guard
│
├── auth.ts         # Auth endpoints
│   ├── loginAdmin() — raw fetch (pre-session)
│   ├── logoutAdmin() — POST /auth/logout
│   └── refreshAdminTokens() — POST /auth/refresh
│
├── journeys.ts     # Admin journey endpoints
│   ├── listPublishedJourneys() — GET /core/admin/journeys/publish
│   ├── getPublishedJourneyDetail() — GET .../:publicId
│   └── updateReviewStatus() — PATCH .../:publicId/review
│
├── articles.ts     # Admin article endpoints
│   ├── listAdminArticles() — GET /core/admin/articles
│   ├── getAdminArticle() — GET .../:articleId
│   ├── createAdminArticle() — POST /core/admin/articles
│   ├── updateAdminArticle() — PATCH .../:articleId
│   └── deleteAdminArticle() — DELETE .../:articleId
│
├── public.ts       # Public API fetch helper (moved from lib/public-api.ts)
│
└── index.ts        # Barrel export
```

### Token Helpers (`lib/admin/token.ts`)

`readAccessTokenClaims()` and `readTokenExpiryMs()` were extracted from the old
monolithic `lib/admin/api.ts` into a dedicated module. These are JWT decoding
utilities, not API infrastructure, and belong with auth concerns.

## Migration Path

1. Created `src/apis/types/` with hand-written interfaces matching the
   backend contract
2. Created `lib/api/` with domain-organized service functions
3. Created `lib/admin/token.ts` for JWT token helpers
4. Converted all callers to import from the new modules
5. Removed `src/apis/core/client.ts` (generated file)
6. Removed `src/apis/core/` directory
7. Removed `generate:api` and `generate:api:core` scripts from `package.json`
8. Removed `API_SWAGGER_URL` from `.env` and `.env.example`
9. Removed deprecated bridge files: `lib/admin/api.ts`, `lib/public-api.ts`

## Consequences

### Positive

- **No codegen dependency** — removes `swagger-typescript-api` and Swagger URL
- **No dead code** — only types actually used are defined
- **Better type safety** — hand-written types use `string | null | undefined`
  instead of `object`, catching real type mismatches at compile time
- **Domain cohesion** — types and API functions are organized by feature area,
  matching the backend's module structure
- **Smaller builds** — no 5,388-line generated file with 140+ unused types

### Negative

- **Manual sync** — backend contract changes now require manual type updates in
  the admin frontend, instead of regenerating from Swagger
- **Discovery friction** — new team members must look at the backend or
  network traffic to find available endpoints, instead of reading the
  generated client
- **Maintenance overhead** — type updates must be coordinated with backend
  changes during development

### Mitigations

- Backend contracts change infrequently for admin surfaces (journeys, articles)
- The admin app only uses ~10 of the ~50 available backend endpoints
- When backend types change, the corresponding updated types in
  `src/apis/types/` serve as the single source of truth for the admin frontend
- `yarn tsc --noEmit` catches type mismatches immediately
