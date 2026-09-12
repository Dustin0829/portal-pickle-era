import api from "@/api/client";
import {
  createExampleFormSchema,
  exampleSchema,
} from "@/api/features/examples/examples.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function listExamples(signal?: AbortSignal) {
  const response = await api.get("/examples", {
    params: { page: 1, limit: 20 },
    signal,
  });
  const payload = response.data as { items: unknown };
  const items = z.array(exampleSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function createExample(input: { label: string }) {
  const body = createExampleFormSchema.parse(input);
  const { data } = await api.post("/examples", body);
  return exampleSchema.parse(data);
}
