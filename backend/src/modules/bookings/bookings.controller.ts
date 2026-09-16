import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type {
  CreateAdminBookingBody,
  CreatePublicBookingBody,
  ListBookingsQuery,
  ListUsersQuery,
  PatchBookingBody,
} from "./bookings.schema.js";
import {
  createAdminBooking,
  createPublicBooking,
  getBookingReceiptUrl,
  listAdminBookings,
  listAdminUsers,
  listMyBookings,
  listOccupancy,
  patchBookingStatus,
} from "./bookings.service.js";

export async function createPublicBookingController(req: Request, res: Response) {
  const booking = await createPublicBooking(req.body as CreatePublicBookingBody, req.authUser);
  return sendSuccess(res, booking, "ok", 201);
}

export async function occupancyController(req: Request, res: Response) {
  const items = await listOccupancy(req.query);
  return sendSuccess(res, { items }, "ok", 200);
}

export async function myBookingsController(req: Request, res: Response) {
  const items = await listMyBookings(req.authUser);
  return sendSuccess(res, { items }, "ok", 200);
}

export async function listAdminBookingsController(req: Request, res: Response) {
  const result = await listAdminBookings(req.query as unknown as ListBookingsQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}

export async function createAdminBookingController(req: Request, res: Response) {
  const booking = await createAdminBooking(req.body as CreateAdminBookingBody);
  return sendSuccess(res, booking, "ok", 201);
}

export async function patchBookingController(req: Request, res: Response) {
  const booking = await patchBookingStatus(req.params.id as string, req.body as PatchBookingBody);
  return sendSuccess(res, booking, "ok", 200);
}

export async function bookingReceiptUrlController(req: Request, res: Response) {
  const result = await getBookingReceiptUrl(req.params.id as string);
  return sendSuccess(res, result, "ok", 200);
}

export async function listAdminUsersController(req: Request, res: Response) {
  const result = await listAdminUsers(req.query as unknown as ListUsersQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}
