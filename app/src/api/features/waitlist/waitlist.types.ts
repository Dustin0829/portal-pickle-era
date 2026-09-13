import type { WaitlistEntry } from "@/api/features/waitlist/waitlist.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import type { z } from "zod";

export type WaitlistListResult = {
  items: WaitlistEntry[];
  meta?: z.infer<typeof paginationMetaSchema>;
};
