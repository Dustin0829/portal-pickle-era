export type BookingPlan = "court" | "open-play" | "clinic";

export type Court = {
  id: string;
  name: string;
  group: "Indoor" | "Outdoor";
};

export type TimeSlot = {
  id: string;
  label: string;
  hour: number;
};

export type BookingRequest = {
  id: string;
  plan: BookingPlan;
  date: string;
  courtId: string;
  slotId?: string;
  slotIds: string[];
  name: string;
  email: string;
  referenceId: string;
  receiptName: string;
  status: "pending";
  createdAt: string;
};

export const COURTS: Court[] = [
  { id: "in-1", name: "Court 1", group: "Indoor" },
  { id: "in-2", name: "Court 2", group: "Indoor" },
  { id: "in-3", name: "Court 3", group: "Indoor" },
  { id: "out-1", name: "Court 4", group: "Outdoor" },
  { id: "out-2", name: "Court 5", group: "Outdoor" },
  { id: "out-3", name: "Court 6", group: "Outdoor" },
];

export const PLAN_META: Record<
  BookingPlan,
  { title: string; eyebrow: string; price: number; unit: string }
> = {
  court: {
    title: "Court Rental",
    eyebrow: "Book a court",
    price: 300,
    unit: "/ hour",
  },
  "open-play": {
    title: "Open Play",
    eyebrow: "Join open play",
    price: 150,
    unit: "/ session",
  },
  clinic: {
    title: "Clinics & Coaching",
    eyebrow: "View clinics",
    price: 500,
    unit: "/ session",
  },
};

export const PAYMENT = {
  method: "GCash",
  name: "Pickle Era",
  number: "0917 850 0107",
};

const STORAGE_KEY = "pickle-era-bookings";

export const SLOTS: Record<BookingPlan, TimeSlot[]> = {
  court: hoursToSlots(6, 21),
  "open-play": [
    { id: "07:00", label: "7:00–9:00 AM", hour: 7 },
    { id: "09:00", label: "9:00–11:00 AM", hour: 9 },
    { id: "16:00", label: "4:00–6:00 PM", hour: 16 },
    { id: "18:00", label: "6:00–8:00 PM", hour: 18 },
  ],
  clinic: [
    { id: "10:00", label: "10:00 AM · Beginner", hour: 10 },
    { id: "14:00", label: "2:00 PM · Intermediate", hour: 14 },
    { id: "18:00", label: "6:00 PM · Advanced", hour: 18 },
  ],
};

function hoursToSlots(from: number, to: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = from; hour <= to; hour += 1) {
    slots.push({
      id: `${String(hour).padStart(2, "0")}:00`,
      label: `${formatHour(hour)} to ${formatHour(hour + 1)}`,
      hour,
    });
  }
  return slots;
}

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(key: string) {
  return parseDateKey(key).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function courtLabel(courtId: string) {
  const court = COURTS.find((item) => item.id === courtId);
  return court ? `${court.group} ${court.name}` : courtId;
}

export function allowsMultiSlot(plan: BookingPlan) {
  return plan === "court";
}

export function bookingTotal(plan: BookingPlan, count: number) {
  return PLAN_META[plan].price * Math.max(count, 0);
}

export function selectedSlotLabels(plan: BookingPlan, slotIds: string[]) {
  return SLOTS[plan]
    .filter((slot) => slotIds.includes(slot.id))
    .map((slot) => slot.label);
}

function bookingSlotIds(item: BookingRequest) {
  if (item.slotIds?.length) return item.slotIds;
  return item.slotId ? [item.slotId] : [];
}

function hash(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) {
    total = (total * 31 + value.charCodeAt(index)) >>> 0;
  }
  return total;
}

export function listBookings(): BookingRequest[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as BookingRequest[];
  } catch {
    return [];
  }
}

export function saveBooking(
  entry: Omit<BookingRequest, "id" | "status" | "createdAt">,
) {
  const next: BookingRequest = {
    ...entry,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...listBookings(), next]));
  return next;
}

export function isSlotTaken(
  plan: BookingPlan,
  date: string,
  courtId: string,
  slotId: string,
) {
  const seeded = hash(`${plan}|${date}|${courtId}|${slotId}`) % 9 === 0;
  const reserved = listBookings().some(
    (item) =>
      item.date === date &&
      item.courtId === courtId &&
      item.plan === plan &&
      bookingSlotIds(item).includes(slotId),
  );
  return seeded || reserved;
}

export function isSlotPast(date: string, hour: number) {
  const now = new Date();
  if (date !== dateKey(now)) return date < dateKey(now);
  return hour <= now.getHours();
}

export function isSlotOpen(
  plan: BookingPlan,
  date: string,
  courtId: string,
  slot: TimeSlot,
) {
  return (
    !isSlotPast(date, slot.hour) && !isSlotTaken(plan, date, courtId, slot.id)
  );
}

export function courtHasOpening(
  plan: BookingPlan,
  date: string,
  courtId: string,
) {
  return SLOTS[plan].some((slot) => isSlotOpen(plan, date, courtId, slot));
}
