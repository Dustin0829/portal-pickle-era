import { z } from "zod";

/** Fallback when Zod still returns a technical default message. */
export function humanizeZodMessage(message: string): string {
  if (!message) return "Please check this field and try again.";

  if (
    message.includes("Too small: expected string to have >=1 characters") ||
    message === "Required"
  ) {
    return "This field is required";
  }

  const stringMinMatch = message.match(/Too small: expected string to have >=(\d+) characters/);
  if (stringMinMatch) {
    const min = stringMinMatch[1];
    return min === "1" ? "This field is required" : `Must be at least ${min} characters`;
  }

  const stringMaxMatch = message.match(/Too big: expected string to have <=(\d+) characters/);
  if (stringMaxMatch) {
    return `Must be at most ${stringMaxMatch[1]} characters`;
  }

  const arrayMinMatch = message.match(/Too small: expected array to have >=(\d+)/);
  if (arrayMinMatch) {
    const min = Number(arrayMinMatch[1]);
    return min === 1 ? "Add at least one item" : `Add at least ${min} items`;
  }

  const numberMinMatch = message.match(/Too small: expected number to be >=(\d+)/);
  if (numberMinMatch) {
    return `Must be at least ${numberMinMatch[1]}`;
  }

  if (message.includes("Invalid url")) {
    return "Enter a valid URL starting with https://";
  }

  if (message.includes("Invalid enum value")) {
    return "Select a valid option";
  }

  if (message.startsWith("Invalid input")) {
    return "Please check this field and try again.";
  }

  return message;
}

export const templateZodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        if (issue.minimum === 1) {
          return { message: "This field is required" };
        }
        return { message: `Must be at least ${issue.minimum} characters` };
      }
      if (issue.type === "array") {
        return {
          message:
            issue.minimum === 1 ? "Add at least one item" : `Add at least ${issue.minimum} items`,
        };
      }
      if (issue.type === "number") {
        return { message: `Must be at least ${issue.minimum}` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `Must be at most ${issue.maximum} characters` };
      }
      if (issue.type === "array") {
        return { message: `Must have at most ${issue.maximum} items` };
      }
      if (issue.type === "number") {
        return { message: `Must be at most ${issue.maximum}` };
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "url") {
        return { message: "Enter a valid URL starting with https://" };
      }
      if (issue.validation === "email") {
        return { message: "Enter a valid email address" };
      }
      break;
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        return { message: "This field is required" };
      }
      break;
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "Select a valid option" };
    case z.ZodIssueCode.custom:
      if (issue.message) {
        return { message: issue.message };
      }
      break;
    default:
      break;
  }

  return { message: humanizeZodMessage(ctx.defaultError) };
};

let configured = false;

export function configureZodErrorMap(): void {
  if (configured) return;
  z.setErrorMap(templateZodErrorMap);
  configured = true;
}

/** Raw ZodError.message — never show in API responses or toasts. */
export function isZodDumpMessage(message: string): boolean {
  const trimmed = message.trim();
  return (
    trimmed.startsWith("ZodError:") ||
    (trimmed.startsWith("[") && trimmed.includes('"code"') && trimmed.includes('"path"'))
  );
}
