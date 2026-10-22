# MomentBook Admin

Admin-only Next.js app (App Router) for MomentBook moderation and editorial
work. Port 3200. Deployed on Vercel Hobby.

## Tech

| Area | Version |
|---|---|
| next / eslint-config-next | 16.3.8 |
| react / react-dom | 19.2.x (`~19.2.9`) |
| typescript | 5.9.3 |
| tailwindcss / @tailwindcss/postcss | 4.3.3 |
| UI | shadcn/ui `new-york` (v4 registry) in `components/ui`, `radix-ui ~1.6.7`, `tw-animate-css ~1.4.0`, `lucide-react` 1.8.0 |
| vitest | 4.1.x (node env) |

Auth: Nest API role/RBAC-backed, encrypted `momentbook_admin_session` cookie.
Scripts: `yarn dev`, `yarn build`, `yarn lint`, `yarn test` (`vitest run`),
`yarn typecheck` (`next typegen && tsc --noEmit`), `yarn verify`
(typecheck + lint + test). Gate before done: `yarn verify && yarn build`.

shadcn components are added only with `npx shadcn@4.22.1 add <name>`. Rewrite
its `import { cn } from "cn"` to `@/lib/utils`, do not keep the `cn` package,
and keep `radix-ui` at `~1.6.7`.

## Boundary
Admin-only, at the root of the admin origin: `/` (attention overview),
`/reviews`, `/reports`, `/comments`, `/users`, `/articles`, `/metrics`,
`/audit-log`, `/login`, `/session*`.
Do not expand into public UX. Ownership transfers require an ADR.

## Architecture
Design decisions: `docs/adr/README.md` (11 ADRs). Product and UX intent:
`docs/DESIGN.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
