import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { flattenZodError, formatFlattenedZodError } from "./format-zod-error.js";
import { configureZodErrorMap } from "./zod-error-map.js";
import { validationErrorFromZod } from "./zod-validation.js";

configureZodErrorMap();

describe("flattenZodError", () => {
  it("uses dot paths for nested fields", () => {
    const schema = z.object({
      identitySummary: z.object({
        builds: z.string(),
        audience: z.string(),
        expertise: z.array(z.string()),
      }),
    });

    const parsed = schema.safeParse({ identitySummary: {} });
    assert.equal(parsed.success, false);
    if (parsed.success) return;

    const flat = flattenZodError(parsed.error);
    const buildsErrors = flat.fieldErrors["identitySummary.builds"];
    assert.ok(buildsErrors);
    assert.equal(buildsErrors[0], "This field is required");
    assert.ok(flat.fieldErrors["identitySummary.expertise"]);
  });

  it("never puts raw Zod JSON in validationError message", () => {
    const parsed = z.object({ label: z.string().min(1) }).safeParse({});
    assert.equal(parsed.success, false);
    if (parsed.success) return;

    const err = validationErrorFromZod(parsed.error);
    assert.equal(err.message, "Validation failed");
    assert.equal(err.code, "VALIDATION_ERROR");
    assert.ok(!err.message.startsWith("ZodError:"));
  });
});

describe("formatFlattenedZodError", () => {
  it("formats nested paths for ops logs", () => {
    const summary = formatFlattenedZodError({
      formErrors: [],
      fieldErrors: {
        "identitySummary.builds": ["This field is required"],
      },
    });
    assert.match(summary, /identitySummary › builds/);
    assert.match(summary, /required/i);
  });
});
