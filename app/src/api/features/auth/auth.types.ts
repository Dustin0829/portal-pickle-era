import type { AuthUserDto } from "@/api/features/auth/auth.schema";

export type AuthUser = Pick<
  AuthUserDto,
  "id" | "name" | "email" | "role" | "imageUrl"
> & {
  imageUrl: string | null;
};
