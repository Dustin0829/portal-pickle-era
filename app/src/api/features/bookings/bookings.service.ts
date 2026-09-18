import api from "@/api/client";
import {
  bookingDtoSchema,
  bookingOccupancyItemSchema,
  createAdminBookingBodySchema,
  createPublicBookingBodySchema,
  listBookingsQuerySchema,
  listUsersQuerySchema,
  occupancyQuerySchema,
  openPlaySessionItemSchema,
  openPlaySessionsQuerySchema,
  patchBookingBodySchema,
  type CreateAdminBookingBody,
  type CreatePublicBookingBody,
  type ListBookingsQuery,
  type ListUsersQuery,
  type OccupancyQuery,
  type OpenPlaySessionsQuery,
  type PatchBookingBody,
} from "@/api/features/bookings/bookings.schema";
import { authUserSchema } from "@/api/features/auth/auth.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function createPublicBooking(input: CreatePublicBookingBody) {
  const body = createPublicBookingBodySchema.parse(input);
  const { data } = await api.post("/bookings", body);
  return bookingDtoSchema.parse(data);
}

export async function listOccupancy(
  query: OccupancyQuery,
  signal?: AbortSignal,
) {
  const params = occupancyQuerySchema.parse(query);
  const { data } = await api.get("/bookings/occupancy", { params, signal });
  const payload = data as { items: unknown };
  return z.array(bookingOccupancyItemSchema).parse(payload.items);
}

export async function listOpenPlaySessions(
  query: OpenPlaySessionsQuery,
  signal?: AbortSignal,
) {
  const params = openPlaySessionsQuerySchema.parse(query);
  const { data } = await api.get("/bookings/open-play-sessions", {
    params,
    signal,
  });
  const payload = data as { items: unknown };
  return z.array(openPlaySessionItemSchema).parse(payload.items);
}

export async function listMyBookings(signal?: AbortSignal) {
  const { data } = await api.get("/me/bookings", { signal });
  const payload = data as { items: unknown };
  return z.array(bookingDtoSchema).parse(payload.items);
}

export async function listAdminBookings(
  query: ListBookingsQuery = {},
  signal?: AbortSignal,
) {
  const params = listBookingsQuerySchema.parse(query);
  const response = await api.get("/admin/bookings", { params, signal });
  const payload = response.data as { items: unknown };
  const items = z.array(bookingDtoSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function createAdminBooking(input: CreateAdminBookingBody) {
  const body = createAdminBookingBodySchema.parse(input);
  const { data } = await api.post("/admin/bookings", body);
  return bookingDtoSchema.parse(data);
}

export async function patchAdminBooking(id: string, input: PatchBookingBody) {
  const body = patchBookingBodySchema.parse(input);
  const { data } = await api.patch(`/admin/bookings/${id}`, body);
  return bookingDtoSchema.parse(data);
}

export async function listAdminUsers(
  query: ListUsersQuery = {},
  signal?: AbortSignal,
) {
  const params = listUsersQuerySchema.parse(query);
  const response = await api.get("/admin/users", { params, signal });
  const payload = response.data as { items: unknown };
  const items = z.array(authUserSchema).parse(payload.items);
  const metaRaw = (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

const bookingReceiptUrlSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string(),
});

export async function getAdminBookingReceiptUrl(
  id: string,
  signal?: AbortSignal,
) {
  const { data } = await api.get(`/admin/bookings/${id}/receipt-url`, {
    signal,
  });
  return bookingReceiptUrlSchema.parse(data);
}
