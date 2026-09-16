import api from "@/api/client";
import { z } from "zod";

const presignResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.string().url(),
  publicUrl: z.string().url().optional(),
});

export async function presignUpload(input: {
  filename: string;
  contentType: string;
}) {
  const { data } = await api.post("/uploads/presign", input);
  return presignResponseSchema.parse(data);
}

/** Upload file via presigned URL; returns storage key (soft-fails to null). */
export async function uploadReceiptFile(file: File): Promise<{
  receiptKey?: string;
  receiptMimeType?: string;
  publicUrl?: string;
} | null> {
  try {
    const presign = await presignUpload({
      filename: file.name || "receipt",
      contentType: file.type || "application/octet-stream",
    });
    const put = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (!put.ok) return null;
    return {
      receiptKey: presign.publicUrl ?? presign.key,
      receiptMimeType: file.type || undefined,
      publicUrl: presign.publicUrl,
    };
  } catch {
    return null;
  }
}
