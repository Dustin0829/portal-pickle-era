import { describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/api/client";
import {
  getUserFacingApiErrorMessage,
  handleApiMutationError,
  isZodDumpMessage,
  sanitizeApiErrorMessage,
} from "@/api/lib/api-error-message";
import {
  applyFieldErrorsToForm,
  isApiValidationError,
  parseApiFieldErrors,
} from "@/api/lib/apply-field-errors-to-form";

const ZOD_DUMP =
  'ZodError: [{"code":"invalid_type","expected":"string","received":"undefined","path":["identitySummary","builds"],"message":"Required"}]';

describe("isZodDumpMessage", () => {
  it("detects raw ZodError strings", () => {
    expect(isZodDumpMessage(ZOD_DUMP)).toBe(true);
    expect(isZodDumpMessage("Validation failed")).toBe(false);
  });
});

describe("sanitizeApiErrorMessage", () => {
  it("replaces Zod dumps for validation errors", () => {
    expect(sanitizeApiErrorMessage(ZOD_DUMP, "VALIDATION_ERROR", 422)).toBe(
      "Validation failed",
    );
  });

  it("replaces Zod dumps for server errors", () => {
    expect(sanitizeApiErrorMessage(ZOD_DUMP, undefined, 500)).toBe(
      "Something went wrong. Try again.",
    );
  });
});

describe("getUserFacingApiErrorMessage", () => {
  it("never returns raw Zod dump", () => {
    const error = new ApiRequestError(ZOD_DUMP, 422, "VALIDATION_ERROR");
    expect(getUserFacingApiErrorMessage(error)).toBe(
      "Check the highlighted fields and try again.",
    );
  });

  it("returns safe message for 5xx", () => {
    const error = new ApiRequestError("Database unavailable", 503);
    expect(getUserFacingApiErrorMessage(error)).toBe(
      "Something went wrong. Try again.",
    );
  });
});

describe("isApiValidationError", () => {
  it("returns true for VALIDATION_ERROR", () => {
    const error = new ApiRequestError(
      "Validation failed",
      422,
      "VALIDATION_ERROR",
    );
    expect(isApiValidationError(error)).toBe(true);
  });

  it("returns false for business errors", () => {
    const error = new ApiRequestError("Resource conflict", 409, "CONFLICT");
    expect(isApiValidationError(error)).toBe(false);
  });
});

describe("parseApiFieldErrors", () => {
  it("extracts field messages from flattened Zod errors", () => {
    expect(
      parseApiFieldErrors({
        formErrors: [],
        fieldErrors: { userLimit: ["Number must be greater than 0"] },
      }),
    ).toEqual({ userLimit: ["Number must be greater than 0"] });
  });

  it("extracts nested dot-path field keys", () => {
    expect(
      parseApiFieldErrors({
        formErrors: [],
        fieldErrors: {
          "identitySummary.builds": ["This field is required"],
          "identitySummary.expertise": ["Add at least one item"],
        },
      }),
    ).toEqual({
      "identitySummary.builds": ["This field is required"],
      "identitySummary.expertise": ["Add at least one item"],
    });
  });

  it("returns undefined for missing or empty fieldErrors", () => {
    expect(parseApiFieldErrors(undefined)).toBeUndefined();
    expect(
      parseApiFieldErrors({ formErrors: [], fieldErrors: {} }),
    ).toBeUndefined();
  });
});

describe("applyFieldErrorsToForm", () => {
  it("calls setError for each field with server type", () => {
    const setError = vi.fn();

    const applied = applyFieldErrorsToForm(
      { fieldErrors: { userLimit: ["Number must be greater than 0"] } },
      setError,
    );

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("userLimit", {
      type: "server",
      message: "Number must be greater than 0",
    });
  });

  it("maps nested dot paths for RHF", () => {
    const setError = vi.fn();

    applyFieldErrorsToForm(
      {
        fieldErrors: {
          "identitySummary.builds": ["This field is required"],
        },
      },
      setError,
    );

    expect(setError).toHaveBeenCalledWith("identitySummary.builds", {
      type: "server",
      message: "This field is required",
    });
  });

  it("returns false when there are no field errors", () => {
    const setError = vi.fn();
    expect(applyFieldErrorsToForm(null, setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});

describe("handleApiMutationError", () => {
  it("does not toast validation errors when field errors map", () => {
    const setError = vi.fn();
    const toastError = vi.fn();

    handleApiMutationError(
      new ApiRequestError("Validation failed", 422, "VALIDATION_ERROR", {
        formErrors: [],
        fieldErrors: { label: ["This field is required"] },
      }),
      { setError, toastError },
    );

    expect(setError).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts safe message for business errors", () => {
    const toastError = vi.fn();

    handleApiMutationError(
      new ApiRequestError("Resource conflict", 409, "CONFLICT"),
      { toastError },
    );

    expect(toastError).toHaveBeenCalledWith("Resource conflict");
  });

  it("never toasts raw Zod dump", () => {
    const toastError = vi.fn();

    handleApiMutationError(new ApiRequestError(ZOD_DUMP, 500), { toastError });

    expect(toastError).toHaveBeenCalledWith("Something went wrong. Try again.");
  });
});
