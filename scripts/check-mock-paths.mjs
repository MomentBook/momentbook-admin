// Fails when a test names a module that does not exist.
//
// `vi.mock("@/x")` with a path that resolves to nothing does not error: the
// mock is silently never applied and the real module runs instead. Every
// `vi.mock`, `vi.doMock`, `vi.importActual` and dynamic `import()` specifier
// under `@/` in the tests must resolve through the tsconfig alias to a file.
import fs from "node:fs";
import path from "node:path";

const TEST_DIR = "scripts/__tests__";
const SPECIFIER =
  /(?:vi\.(?:doMock|mock|importActual)\s*(?:<[^>]*>)?\(|import\()\s*(["'])(@\/[^"']+)\1/g;

function aliasRoot() {
  const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
  const target = tsconfig.compilerOptions?.paths?.["@/*"]?.[0];
  if (!target || !target.endsWith("/*")) {
    throw new Error('tsconfig.json has no "@/*" path alias');
  }
  return target.slice(0, -2);
}

function resolves(base) {
  return [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")].some(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
}

function testFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return testFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const root = aliasRoot();
const unresolved = [];

for (const file of testFiles(TEST_DIR)) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(SPECIFIER)) {
    const specifier = match[2];
    if (!resolves(path.join(root, specifier.slice(2)))) {
      unresolved.push(`${file}: ${specifier}`);
    }
  }
}

if (unresolved.length > 0) {
  console.error("Test module paths that resolve to no file (a vi.mock on them is silently ignored):");
  for (const line of unresolved) console.error(`  ${line}`);
  process.exit(1);
}

console.log("check-mock-paths: every @/ module named in the tests exists");
