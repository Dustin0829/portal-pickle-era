import { z } from "zod";

export const userRoleSchema = z.enum(["student", "admin"]);

export const userDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
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

export const patchMeBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
  })
  .strict();

export type UserDto = z.infer<typeof userDtoSchema>;
export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type PatchMeBody = z.infer<typeof patchMeBodySchema>;
