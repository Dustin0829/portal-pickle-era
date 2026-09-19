import api from "@/api/client";
import {
  authUserSchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  patchMeBodySchema,
  resetPasswordBodySchema,
  signupBodySchema,
  type ForgotPasswordBody,
  type LoginBody,
  type PatchMeBody,
  type ResetPasswordBody,
  type SignupBody,
} from "@/api/features/auth/auth.schema";
import type { AuthUser } from "@/api/features/auth/auth.types";

function toAuthUser(data: unknown): AuthUser {
  const parsed = authUserSchema.parse(data);
  return {
    id: parsed.id,
    name: parsed.name,
    email: parsed.email,
    role: parsed.role,
  };
}

export async function signup(input: SignupBody) {
  const body = signupBodySchema.parse(input);
  const { data } = await api.post("/auth/signup", body);
  return toAuthUser(data);
}

export async function login(input: LoginBody) {
  const body = loginBodySchema.parse(input);
  const { data } = await api.post("/auth/login", body);
  return toAuthUser(data);
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getMe(signal?: AbortSignal) {
  const { data } = await api.get("/auth/me", { signal });
  return toAuthUser(data);
}

export async function patchMe(input: PatchMeBody) {
  const body = patchMeBodySchema.parse(input);
  const { data } = await api.patch("/auth/me", body);
  return toAuthUser(data);
}

export async function forgotPassword(input: ForgotPasswordBody) {
  const body = forgotPasswordBodySchema.parse(input);
  await api.post("/auth/forgot-password", body);
}

export async function resetPassword(input: ResetPasswordBody) {
  const body = resetPasswordBodySchema.parse(input);
  await api.post("/auth/reset-password", body);
}
