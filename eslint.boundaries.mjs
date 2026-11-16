// The layer contract (ADR 0014): a module imports its own layer and the
// layers below it, never above, and an entity or a feature imports no other
// entity or feature. `eslint.config.mjs` splices `boundaryConfigBlocks()` in.
//
//   lib ─▶ components · hooks ─▶ entities/<e> ─▶ features/<f> ─▶ app
//
// Two screens that need each other's parts meet in an app route, which passes
// one into the other as a slot. Element patterns are `<dir>/**`, never
// `<dir>/**/*`: the latter misses a file sitting directly in the directory
// and silently leaves it unchecked.
export const BOUNDARY_ELEMENTS = [
  // 0 — infrastructure: env, API, session, actions, navigation, formatting.
  { type: "lib", pattern: "src/lib/**" },
  // 1 — shared UI and hooks.
  { type: "components", pattern: "src/components/**" },
  { type: "hooks", pattern: "src/hooks/**" },
  // 2 — domain shared by several screens.
  { type: "entity", pattern: "src/entities/*/**", capture: ["entityName"] },
  // 3 — one screen each.
  { type: "feature", pattern: "src/features/*/**", capture: ["featureName"] },
  // 4 — routes only.
  { type: "app", pattern: "src/app/**" },
];

const SETTINGS = {
  "boundaries/elements": BOUNDARY_ELEMENTS,
  "boundaries/include": ["src/**/*"],
  "import/resolver": {
    typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
    node: { extensions: [".js", ".jsx", ".ts", ".tsx", ".json"] },
  },
};

const to = (...types) => types.map((type) => ({ to: { element: { type } } }));

/** The same entity or feature the importing file belongs to. */
const own = (type, capture) => ({
  to: { element: { type, captured: { [capture]: `{{from.${capture}}}` } } },
});

const SHARED = ["lib", "components", "hooks"];

// Deny by default; this is the complete allow-list.
export const BOUNDARY_POLICIES = [
  { from: [{ element: { type: "lib" } }], allow: to("lib") },
  {
    from: [{ element: { type: "components" } }, { element: { type: "hooks" } }],
    allow: to(...SHARED),
  },
  {
    from: [{ element: { type: "entity" } }],
    allow: [...to(...SHARED), own("entity", "entityName")],
  },
  {
    from: [{ element: { type: "feature" } }],
    allow: [...to(...SHARED, "entity"), own("feature", "featureName")],
  },
  { from: [{ element: { type: "app" } }], allow: to(...SHARED, "entity", "feature", "app") },
];

/**
 * The flat-config block that enforces the contract on every source file.
 * Tests (`scripts/__tests__`) and config files are outside `src/` and
 * unchecked.
 *
 * @param {{ boundaries: import("eslint").ESLint.Plugin }} deps
 */
export function boundaryConfigBlocks({ boundaries }) {
  return [
    {
      files: ["src/**/*.{js,jsx,ts,tsx}"],
      plugins: { boundaries },
      settings: SETTINGS,
      rules: {
        "boundaries/dependencies": ["error", { default: "disallow", policies: BOUNDARY_POLICIES }],
      },
    },
  ];
}
