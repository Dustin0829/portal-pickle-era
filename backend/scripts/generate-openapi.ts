import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildOpenApiDocument } from "../src/app/openapi.js";

const outputPath = path.join(process.cwd(), "contracts", "openapi.json");
const document = buildOpenApiDocument();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);

console.log(`Generated ${outputPath}`);
