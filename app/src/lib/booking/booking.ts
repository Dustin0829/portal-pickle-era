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

export type BookingStatus = "pending" | "approved" | "rejected";

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
  /** Optional local preview (data URL) or short-lived signed URL. */
  receiptDataUrl?: string;
  receiptMimeType?: string;
  /** Private object storage key when using S3/Railway Bucket. */
  receiptKey?: string | null;
  status: BookingStatus;
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

/** First public court date (YYYY-MM-DD). Advance booking cannot select earlier days. */
export const OPENING_DATE = "2026-10-05";

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

/** Earliest selectable court date: opening day until that day arrives, then today. */
export function earliestBookableDateKey(now = new Date()) {
  const today = dateKey(now);
  return today < OPENING_DATE ? OPENING_DATE : today;
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
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as BookingRequest[];
    return raw.map((item) => ({
      ...item,
      status: item.status ?? "pending",
      slotIds: item.slotIds?.length
        ? item.slotIds
        : item.slotId
          ? [item.slotId]
          : [],
    }));
  } catch {
    return [];
  }
}

function shiftDateKey(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return dateKey(next);
}

/** Tiny stub receipt image for demo inbox previews. */
const DEMO_RECEIPT_SVG = encodeURIComponent(
  `
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640">
  <rect width="420" height="640" fill="#111"/>
  <rect x="24" y="24" width="372" height="592" rx="16" fill="#1a1a1a" stroke="#F5ED5A" stroke-width="2"/>
  <text x="210" y="90" text-anchor="middle" fill="#F5ED5A" font-family="Arial, sans-serif" font-size="22" font-weight="700">GCASH RECEIPT</text>
  <text x="210" y="140" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="14">Pickle Era · Demo</text>
  <text x="48" y="220" fill="#aaa" font-family="Arial, sans-serif" font-size="13">Amount</text>
  <text x="48" y="250" fill="#F5ED5A" font-family="Arial, sans-serif" font-size="36" font-weight="700">₱600.00</text>
  <text x="48" y="320" fill="#aaa" font-family="Arial, sans-serif" font-size="13">Reference</text>
  <text x="48" y="348" fill="#fff" font-family="Arial, sans-serif" font-size="16">09120391239230</text>
  <text x="48" y="420" fill="#666" font-family="Arial, sans-serif" font-size="12">Stub preview for local admin inbox</text>
</svg>
`.trim(),
);

const DEMO_RECEIPT_DATA_URL = `data:image/svg+xml;charset=utf-8,${DEMO_RECEIPT_SVG}`;

/** Demo player for local portal stress-testing (password: password1). */
export const PLAYER_FIXTURE = {
  name: "Demo Player",
  email: "player@pickleera.local",
} as const;

const DEMO_PEOPLE: Array<{ name: string; email: string }> = [
  PLAYER_FIXTURE,
  { name: "Franc Egos", email: "dustinramirez917@gmail.com" },
  { name: "Maya Santos", email: "maya.santos@example.com" },
  { name: "Jordan Cruz", email: "jordan.cruz@example.com" },
  { name: "Alex Rivera", email: "alex.rivera@example.com" },
  { name: "Sam Lee", email: "sam.lee@example.com" },
  { name: "Nina Reyes", email: "nina.reyes@example.com" },
  { name: "Kai Mendoza", email: "kai.mendoza@example.com" },
  { name: "Patricia Lim", email: "patricia.lim@example.com" },
  { name: "Diego Alvarez", email: "diego.alvarez@example.com" },
  { name: "Hannah Park", email: "hannah.park@example.com" },
  { name: "Luis Navarro", email: "luis.navarro@example.com" },
  { name: "Sofia Tan", email: "sofia.tan@example.com" },
  { name: "Marcus Ong", email: "marcus.ong@example.com" },
  { name: "Elena Vargas", email: "elena.vargas@example.com" },
  { name: "Chris Domingo", email: "chris.domingo@example.com" },
  { name: "Aya Villanueva", email: "aya.villanueva@example.com" },
  { name: "Benito Ramos", email: "benito.ramos@example.com" },
];

const DEMO_PLANS: BookingPlan[] = [
  "court",
  "court",
  "court",
  "open-play",
  "clinic",
];
const DEMO_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function slotIdFromHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function demoPerson(seed: number) {
  return DEMO_PEOPLE[Math.abs(seed) % DEMO_PEOPLE.length]!;
}

function demoPlan(seed: number): BookingPlan {
  return DEMO_PLANS[Math.abs(seed) % DEMO_PLANS.length]!;
}

function demoStatus(seed: number): BookingStatus {
  const roll = Math.abs(seed) % 10;
  if (roll < 6) return "approved";
  if (roll < 9) return "pending";
  return "rejected";
}

/**
 * Seeds / refreshes a dense set of demo bookings (ids prefixed `demo-`).
 * Keeps any real user-created bookings. Skipped in Vitest.
 */
export function ensureBookingFixtures() {
  if (import.meta.env.MODE === "test") return;

  const now = new Date();
  const fixtures: BookingRequest[] = [];
  const reserved = new Set<string>();
  let seq = 0;

  const pushBooking = (input: {
    dayOffset: number;
    courtId: string;
    hours: number[];
    status: BookingStatus;
    createdMinutesAgo: number;
    personSeed: number;
    person?: { name: string; email: string };
    withReceipt?: boolean;
  }) => {
    const slotIds = [...new Set(input.hours)]
      .sort((a, b) => a - b)
      .map(slotIdFromHour);
    if (slotIds.length === 0) return;

    const date = shiftDateKey(now, input.dayOffset);
    if (input.status !== "rejected") {
      for (const slotId of slotIds) {
        const key = `${date}|${input.courtId}|${slotId}`;
        if (reserved.has(key)) return;
      }
      for (const slotId of slotIds) {
        reserved.add(`${date}|${input.courtId}|${slotId}`);
      }
    }

    seq += 1;
    const person = input.person ?? demoPerson(input.personSeed);
    const plan = demoPlan(input.personSeed + seq);
    const withReceipt = input.withReceipt ?? input.status === "pending";

    fixtures.push({
      id: `demo-${seq}-${input.status}`,
      plan,
      date,
      courtId: input.courtId,
      slotIds,
      name: person.name,
      email: person.email,
      referenceId: `REF-${String(100000 + seq)}`,
      receiptName: withReceipt
        ? `gcash-${person.name.toLowerCase().replace(/\s+/g, "-")}.png`
        : "receipt.pdf",
      ...(withReceipt
        ? {
            receiptDataUrl: DEMO_RECEIPT_DATA_URL,
            receiptMimeType: "image/svg+xml",
          }
        : {}),
      status: input.status,
      createdAt: new Date(
        now.getTime() - input.createdMinutesAgo * 60_000,
      ).toISOString(),
    });
  };

  // Dense occupancy for today + next week across all courts.
  for (const dayOffset of [0, 1, 2, 3, 4, 5, 6, 7]) {
    for (const [courtIndex, court] of COURTS.entries()) {
      for (const [hourIndex, hour] of DEMO_HOURS.entries()) {
        const seed = dayOffset * 97 + courtIndex * 13 + hourIndex * 7;
        // ~55% of hours booked on near-term days → busy calendar / day modal.
        if (seed % 9 < 4) continue;
        const status =
          dayOffset === 0 && seed % 5 === 0 ? "pending" : "approved";
        const hours = seed % 11 === 0 && hour < 21 ? [hour, hour + 1] : [hour];
        pushBooking({
          dayOffset,
          courtId: court.id,
          hours,
          status,
          createdMinutesAgo: dayOffset * 24 * 60 + hourIndex * 17 + 12,
          personSeed: seed,
          withReceipt: true,
        });
      }
    }
  }

  // Extra pending pile for bookings inbox (created recently).
  for (let i = 0; i < 18; i += 1) {
    const court = COURTS[i % COURTS.length]!;
    const hour = DEMO_HOURS[(i * 3) % DEMO_HOURS.length]!;
    pushBooking({
      dayOffset: 8 + (i % 10),
      courtId: court.id,
      hours: [hour],
      status: "pending",
      createdMinutesAgo: 15 + i * 35,
      personSeed: 400 + i,
      withReceipt: true,
    });
  }

  // Spread across 7 / 30 / 90 day ranges for dashboard + filters.
  for (const daysAgo of [
    0, 1, 2, 3, 5, 7, 10, 14, 21, 28, 35, 45, 60, 75, 89,
  ]) {
    for (let i = 0; i < 4; i += 1) {
      const seed = daysAgo * 31 + i * 17;
      const court = COURTS[seed % COURTS.length]!;
      const hour = DEMO_HOURS[seed % DEMO_HOURS.length]!;
      pushBooking({
        dayOffset: -daysAgo,
        courtId: court.id,
        hours: [hour],
        status: demoStatus(seed),
        createdMinutesAgo: daysAgo * 24 * 60 + i * 90 + 40,
        personSeed: seed + 90,
        withReceipt: true,
      });
    }
  }

  // Guarantee several bookings for the demo player portal.
  for (let i = 0; i < 12; i += 1) {
    pushBooking({
      dayOffset: 9 + i,
      courtId: COURTS[i % COURTS.length]!.id,
      hours: [7 + (i % 10)],
      status: i % 4 === 0 ? "pending" : "approved",
      createdMinutesAgo: 60 + i * 180,
      personSeed: 0,
      person: PLAYER_FIXTURE,
      withReceipt: true,
    });
  }

  // A few rejected samples.
  for (let i = 0; i < 6; i += 1) {
    pushBooking({
      dayOffset: 2 + i,
      courtId: COURTS[(i + 2) % COURTS.length]!.id,
      hours: [9 + i],
      status: "rejected",
      createdMinutesAgo: 60 * 24 * (2 + i) + 30,
      personSeed: 700 + i,
      withReceipt: false,
    });
  }

  const kept = listBookings().filter((item) => !item.id.startsWith("demo-"));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...kept, ...fixtures]));
}

export function listBookingsByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return listBookings().filter((item) => item.email === normalized);
}

export function listBookingsForDate(date: string) {
  return listBookings().filter((item) => item.date === date);
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const next = listBookings().map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.find((item) => item.id === id) ?? null;
}

export function saveBooking(
  entry: Omit<BookingRequest, "id" | "status" | "createdAt"> & {
    status?: BookingStatus;
  },
) {
  const { status = "pending", ...fields } = entry;
  const next: BookingRequest = {
    ...fields,
    id: crypto.randomUUID(),
    status,
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
      item.status !== "rejected" &&
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
