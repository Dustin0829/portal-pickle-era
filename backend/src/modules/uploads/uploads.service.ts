import { randomUUID } from "node:crypto";
import { createPresignedUpload } from "../../lib/storage/r2.js";
import type { PresignUploadBody } from "./uploads.schema.js";

export async function presignUpload(body: PresignUploadBody) {
  const extension = body.filename.includes(".") ? body.filename.split(".").at(-1) : undefined;
  const key = `uploads/${randomUUID()}${extension ? `.${extension}` : ""}`;

  return createPresignedUpload({
    key,
    contentType: body.contentType,
  });
}
