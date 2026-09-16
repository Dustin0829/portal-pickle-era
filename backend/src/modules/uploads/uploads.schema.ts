import { z } from "zod";

export const allowedUploadContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const presignUploadBodySchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    contentType: z.enum(allowedUploadContentTypes),
  })
  .strict();

export const presignUploadResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.string().url(),
});

export type PresignUploadBody = z.infer<typeof presignUploadBodySchema>;
