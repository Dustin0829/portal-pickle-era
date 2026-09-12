import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const [, , rawName, ...flags] = process.argv;
const withJob = flags.includes("--with-job");

if (!rawName) {
  console.error("Usage: pnpm make:module <plural-kebab-name> [--with-job]");
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*s$/.test(rawName)) {
  console.error("Module name must be plural kebab-case, e.g. campaigns, webhook-events.");
  process.exit(1);
}

const root = process.cwd();
const templateDir = path.join(root, "scripts", "templates", "module");
const targetDir = path.join(root, "src", "modules", rawName);

const pascalName = rawName
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("");
const camelName = pascalName[0].toLowerCase() + pascalName.slice(1);
const route = `/${rawName}`;

const replacements = {
  "{{name}}": rawName,
  "{{Name}}": pascalName,
  "{{camelName}}": camelName,
  "{{route}}": route,
};

await mkdir(targetDir, { recursive: false }).catch((error) => {
  if (error && error.code === "EEXIST") {
    console.error(`Module already exists: ${targetDir}`);
    process.exit(1);
  }
  throw error;
});

const templateFiles = await readdir(templateDir);
for (const file of templateFiles) {
  if (!withJob && file === "__name__.job.ts") continue;

  const templatePath = path.join(templateDir, file);
  const targetFile = file.replace("__name__", rawName);
  const targetPath = path.join(targetDir, targetFile);
  let content = await readFile(templatePath, "utf8");

  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replaceAll(placeholder, value);
  }

  await writeFile(targetPath, content);
}

console.log(`Created src/modules/${rawName}/`);
console.log("");
console.log("Next steps:");
console.log(`1. Wire ${camelName}Router in src/app/router.ts`);
console.log(`2. Wire register${pascalName}OpenApi in src/app/openapi.ts`);
console.log("3. Fill service logic and Prisma model if needed");
console.log("4. Run pnpm openapi:generate");
console.log("5. Run pnpm verify");
