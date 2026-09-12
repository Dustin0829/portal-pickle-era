import { z } from "zod";

export const presignUploadBodySchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120),
  })
  .strict();

export const presignUploadResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.string().url(),
  publicUrl: z.string().url().optional(),
});

export type PresignUploadBody = z.infer<typeof presignUploadBodySchema>;
