import { z } from "zod";

export const userRoleSchema = z.enum(["student", "admin"]);

export const userDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  imageUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const signupBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(128),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

const avatarImageKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .refine((key) => key.startsWith("uploads/"), {
    message: "Image key must be an uploads object key",
  })
  .refine((key) => !/\.pdf$/i.test(key), {
    message: "Profile photo must be an image (jpeg, png, or webp)",
  });

export const patchMeBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    image: avatarImageKeySchema.nullable().optional(),
  })
  .strict()
  .refine((body) => body.name !== undefined || body.image !== undefined, {
    message: "Provide name and/or image",
  });

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export const forgotPasswordBodySchema = z
  .object({
    email: z.string().trim().email().max(254),
  })
  .strict();

export const resetPasswordBodySchema = z
  .object({
    token: z.string().trim().min(1).max(200),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export type UserDto = z.infer<typeof userDtoSchema>;
export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type PatchMeBody = z.infer<typeof patchMeBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
