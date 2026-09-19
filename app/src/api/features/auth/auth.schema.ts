import { z } from "zod";
import { nonEmptyString } from "@/api/schema/primitives.schema";

export const userRoleSchema = z.enum(["student", "admin"]);

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const loginBodySchema = z
  .object({
    email: nonEmptyString.email("Enter a valid email address").max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const signupBodySchema = z
  .object({
    name: nonEmptyString.max(120),
    email: nonEmptyString.email("Enter a valid email address").max(254),
    password: z.string().min(8, "Use at least 8 characters").max(128),
  })
  .strict();

export const patchMeBodySchema = z
  .object({
    name: nonEmptyString.max(120),
  })
  .strict();

export const forgotPasswordBodySchema = z
  .object({
    email: nonEmptyString.email("Enter a valid email address").max(254),
  })
  .strict();

export const resetPasswordBodySchema = z
  .object({
    token: nonEmptyString.max(200),
    newPassword: z.string().min(8, "Use at least 8 characters").max(128),
  })
  .strict();

export type AuthUserDto = z.infer<typeof authUserSchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type SignupBody = z.infer<typeof signupBodySchema>;
export type PatchMeBody = z.infer<typeof patchMeBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
