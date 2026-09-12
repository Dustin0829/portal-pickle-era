import api from "@/api/client";
import {
  createWaitlistFormSchema,
  waitlistEntrySchema,
  type CreateWaitlistFormValues,
} from "@/api/features/waitlist/waitlist.schema";
import type { WaitlistListResult } from "@/api/features/waitlist/waitlist.types";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function createWaitlistEntry(input: CreateWaitlistFormValues) {
  const body = createWaitlistFormSchema.parse(input);
  const { data } = await api.post("/waitlist", {
    name: body.name ?? "",
    email: body.email,
    ...(body.phone ? { phone: body.phone } : {}),
    source: body.source ?? "join_club",
  });
  return waitlistEntrySchema.parse(data);
}

export async function listAdminWaitlist(signal?: AbortSignal, search?: string) {
  const response = await api.get("/admin/waitlist", {
    params: {
      page: 1,
      limit: 50,
      ...(search && search.trim().length >= 2 ? { search: search.trim() } : {}),
    },
    signal,
  });
  const payload = response.data as { items: unknown };
  const items = z.array(waitlistEntrySchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta } satisfies WaitlistListResult;
}
