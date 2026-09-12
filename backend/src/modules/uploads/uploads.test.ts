import assert from "node:assert/strict";
import test from "node:test";
import { presignUploadBodySchema } from "./uploads.schema.js";

test("uploads presign schema accepts filename and content type", () => {
  const parsed = presignUploadBodySchema.parse({
    filename: "avatar.png",
    contentType: "image/png",
  });

  assert.equal(parsed.filename, "avatar.png");
  assert.equal(parsed.contentType, "image/png");
});

test("uploads presign schema rejects missing content type", () => {
  assert.equal(presignUploadBodySchema.safeParse({ filename: "avatar.png" }).success, false);
});
