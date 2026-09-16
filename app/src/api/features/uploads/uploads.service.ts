import api from "@/api/client";
import { z } from "zod";

const ALLOWED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

const presignResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.string().url(),
});

function inferReceiptContentType(file: File): string | null {
  if (file.type && ALLOWED_RECEIPT_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  const inferred = EXT_TO_MIME[ext];
  return inferred && ALLOWED_RECEIPT_TYPES.has(inferred) ? inferred : null;
}

export async function presignUpload(input: {
  filename: string;
  contentType: string;
}) {
  const { data } = await api.post("/uploads/presign", input);
  return presignResponseSchema.parse(data);
}

/** Upload file via presigned URL; returns storage key or throws. */
export async function uploadReceiptFile(file: File): Promise<{
  receiptKey: string;
  receiptMimeType: string;
}> {
  const contentType = inferReceiptContentType(file);
  if (!contentType) {
    throw new Error(
      "Receipt must be a JPEG, PNG, WebP, or PDF file.",
    );
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
  if (!put.ok) {
    throw new Error(
      "Could not upload receipt. Check storage CORS and try again.",
    );
  }
  return {
    receiptKey: presign.key,
    receiptMimeType: contentType,
  };
}
