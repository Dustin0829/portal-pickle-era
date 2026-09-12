import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../lib/errors.js";
import type { Create{{Name}}Body } from "./{{name}}.schema.js";

const inMemory{{Name}} = new Map<string, { id: string; label?: string }>();

export async function list{{Name}}() {
  return [...inMemory{{Name}}.values()];
}

export async function get{{Name}}(id: string) {
  const row = inMemory{{Name}}.get(id);
  if (!row) throw new NotFoundError("{{Name}} not found");
  return row;
}

export async function create{{Name}}(body: Create{{Name}}Body) {
  const id = randomUUID();
  const row = { id, ...(body.label ? { label: body.label } : {}) };
  inMemory{{Name}}.set(id, row);
  return row;
}
