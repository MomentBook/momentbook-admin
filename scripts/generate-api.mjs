import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Writes each service's paths and schemas as TypeScript types with
// openapi-typescript to src/lib/api/generated/<service>.ts. openapi-fetch
// reads the paths; `--root-types` also exports every schema by its own name,
// and a field with a default stays as optional as the document declares it.
// The files are committed, so a Vercel build never reaches the dev server;
// never edit them by hand.
//
// Name the source with one of:
//   API_SPEC_DIR=../momentbook-api/docs/openapi yarn generate:api
//     reads <service>.json from a directory, such as the API repository's
//     committed documents
//   API_SPEC_URL=http://<dev API gateway> yarn generate:api
//     reads <url>/<service>/swagger/json from a running API

const SERVICES = ["core", "auth"];
const OUT_DIR = "./src/lib/api/generated";
// The exact version is pinned in package.json.
const GENERATOR_BIN = "./node_modules/.bin/openapi-typescript";

const specDir = process.env.API_SPEC_DIR;
const specUrl = process.env.API_SPEC_URL;

function assertSpec(body, source) {
  if (!body || (!body.openapi && !body.swagger)) {
    throw new Error(`[generate:api] ${source} is not an OpenAPI document`);
  }
}

function resolveSpecFile(service) {
  const specPath = path.resolve(specDir, `${service}.json`);
  if (!existsSync(specPath)) {
    throw new Error(`[generate:api] missing spec file: ${specPath}`);
  }

  assertSpec(JSON.parse(readFileSync(specPath, "utf8")), specPath);
  return specPath;
}

// The generator does not check the HTTP status, so a 404 from a server with
// swagger turned off would surface as an unrelated parse error.
async function resolveSwaggerUrl(service) {
  const url = `${specUrl.replace(/\/+$/, "")}/${service}/swagger/json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[generate:api] ${url} answered HTTP ${response.status}`);
  }

  assertSpec(await response.json(), url);
  return url;
}

async function main() {
  if (!specDir && !specUrl) {
    throw new Error(
      "[generate:api] set API_SPEC_DIR (a directory of <service>.json) or API_SPEC_URL (a running API)",
    );
  }

  for (const service of SERVICES) {
    const source = specDir ? resolveSpecFile(service) : await resolveSwaggerUrl(service);
    const output = `${OUT_DIR}/${service}.ts`;
    console.log(`[generate:api] ${service}: ${source} -> ${output}`);
    execFileSync(
      GENERATOR_BIN,
      [
        source,
        "--root-types",
        "--root-types-no-schema-prefix",
        // A request field with a default (acceptUntranslated) may be left out.
        "--default-non-nullable",
        "false",
        "-o",
        output,
      ],
      { stdio: "inherit" },
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
