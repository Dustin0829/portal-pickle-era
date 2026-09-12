import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildOpenApiDocument } from "../src/app/openapi.js";

const outputPath = path.join(process.cwd(), "contracts", "openapi.json");
const expected = `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`;

try {
  const actual = await readFile(outputPath, "utf8");
  if (actual !== expected) {
    console.error("contracts/openapi.json is stale. Run pnpm openapi:generate.");
    process.exit(1);
  }
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    await writeFile(outputPath, expected);
    console.error("contracts/openapi.json was missing and has been created. Commit it.");
    process.exit(1);
  }
  throw error;
}

console.log("contracts/openapi.json is up to date.");
