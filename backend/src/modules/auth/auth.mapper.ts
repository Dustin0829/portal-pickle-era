import type { Prisma } from "../../generated/prisma/client.js";
import type { UserDto } from "./auth.schema.js";

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

export type UserPublicRow = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

export function toUserDto(row: UserPublicRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
