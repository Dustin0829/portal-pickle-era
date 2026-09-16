import assert from "node:assert/strict";
import test from "node:test";
import { ValidationError } from "../../lib/errors.js";
import { allowedUploadContentTypes, presignUploadBodySchema } from "./uploads.schema.js";

test("uploads presign schema accepts filename and allowed content type", () => {
  const parsed = presignUploadBodySchema.parse({
    filename: "receipt.png",
    contentType: "image/png",
  });
  assert.equal(parsed.filename, "receipt.png");
  assert.equal(parsed.contentType, "image/png");
});

test("uploads allowlist includes jpeg png webp pdf", () => {
  assert.deepEqual(
    [...allowedUploadContentTypes],
    ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  );
});

test("uploads presign schema rejects missing content type", () => {
  assert.equal(presignUploadBodySchema.safeParse({ filename: "avatar.png" }).success, false);
});

test("uploads presign schema rejects disallowed content type", () => {
  assert.equal(
    presignUploadBodySchema.safeParse({
      filename: "x.bin",
      contentType: "application/octet-stream",
    }).success,
    false,
  );
});

test("createPresignedUpload fails clearly when S3 env unset", async () => {
  const { createPresignedUpload } = await import("../../lib/storage/s3.js");
  await assert.rejects(
    () =>
      createPresignedUpload({
        key: "uploads/test.png",
        contentType: "image/png",
      }),
    (error: unknown) => error instanceof ValidationError,
  );
});

test("createPresignedDownload fails clearly when S3 env unset", async () => {
  const { createPresignedDownload } = await import("../../lib/storage/s3.js");
  await assert.rejects(
    () => createPresignedDownload({ key: "uploads/test.png" }),
    (error: unknown) => error instanceof ValidationError,
  );
});
