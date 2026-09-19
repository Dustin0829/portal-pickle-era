import type { Prisma } from "../../generated/prisma/client.js";
import type { UserDto } from "./auth.schema.js";

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

export type UserPublicRow = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

export function toUserDto(row: UserPublicRow, imageUrl: string | null = null): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    imageUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
