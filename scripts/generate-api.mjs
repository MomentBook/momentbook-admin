import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Writes the API's data contracts as types only (`--no-client`, ADR 0012) to
// src/apis/generated/<service>.ts. The files are committed, so a Vercel build
// never reaches the dev server; never edit them by hand.
//
// The source is the dev server's swagger by default. API_SPEC_DIR reads
// `<service>.json` from a directory instead, such as the API repository's
// committed `docs/openapi/` while the dev server still serves an older
// contract:
//   API_SPEC_DIR=../momentbook-api/docs/openapi yarn generate:api

const SWAGGER_BASE_URL = "http://10.133.199.134:8090";
const SERVICES = ["core", "auth"];
const OUT_DIR = "./src/apis/generated";
// The exact version is pinned in package.json (ADR 0012 item 1).
const GENERATOR_BIN = "./node_modules/.bin/swagger-typescript-api";

const specDir = process.env.API_SPEC_DIR;

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
  const specUrl = `${SWAGGER_BASE_URL}/${service}/swagger/json`;
  const response = await fetch(specUrl);
  if (!response.ok) {
    throw new Error(`[generate:api] ${specUrl} answered HTTP ${response.status}`);
  }

  assertSpec(await response.json(), specUrl);
  return specUrl;
}

async function main() {
  for (const service of SERVICES) {
    const source = specDir ? resolveSpecFile(service) : await resolveSwaggerUrl(service);
    console.log(`[generate:api] ${service}: ${source} -> ${OUT_DIR}/${service}.ts`);
    execFileSync(
      GENERATOR_BIN,
      ["generate", "--no-client", "-p", source, "-o", OUT_DIR, "-n", `${service}.ts`],
      { stdio: "inherit" },
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
