import { describe, expect, it } from "vitest";
import { ApiRequestError } from "@/api/client";
import { sanitizeApiErrorMessage } from "@/api/lib/api-error-message";

describe("ApiRequestError from interceptor", () => {
  it("sanitizes Zod dump in message before ApiRequestError is constructed", () => {
    const zodDump =
      'ZodError: [{"code":"invalid_type","path":["identitySummary","builds"]}]';
    const message = sanitizeApiErrorMessage(zodDump, "VALIDATION_ERROR", 422);
    const error = new ApiRequestError(message, 422, "VALIDATION_ERROR");

    expect(error.message).toBe("Validation failed");
    expect(error.message).not.toContain("ZodError:");
  });
});
