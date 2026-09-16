import api from "@/api/client";
import { z } from "zod";

const ALLOWED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const presignResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.string().url(),
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
} | null> {
  try {
    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_RECEIPT_TYPES.has(contentType)) {
      return null;
    }
    const presign = await presignUpload({
      filename: file.name || "receipt",
      contentType,
    });
    const put = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    });
    if (!put.ok) return null;
    return {
      receiptKey: presign.key,
      receiptMimeType: contentType,
    };
  } catch {
    return null;
  }
}
