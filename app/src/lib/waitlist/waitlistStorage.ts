export type WaitlistEntry = {
  name: string;
  email: string;
  phone?: string;
  joinedAt: string;
};

const STORAGE_KEY = "pickle-era-waitlist";

function normalizeEntry(item: unknown): WaitlistEntry | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const email =
    typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
  if (!email) return null;

  return {
    name: typeof row.name === "string" ? row.name.trim() : "",
    email,
    phone:
      typeof row.phone === "string" && row.phone.trim()
        ? row.phone.trim()
        : undefined,
    joinedAt:
      typeof row.joinedAt === "string" && row.joinedAt ? row.joinedAt : "",
  };
}

export function listWaitlistEntries(): WaitlistEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(normalizeEntry)
      .filter((item): item is WaitlistEntry => item !== null);
  } catch {
    return [];
  }
}

/** Returns false when email is empty; otherwise upserts by email. */
export function saveWaitlistEntry(
  entry: Omit<WaitlistEntry, "joinedAt">,
): boolean {
  const normalizedEmail = entry.email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const existing = listWaitlistEntries();
  const next: WaitlistEntry[] = [
    ...existing.filter((item) => item.email !== normalizedEmail),
    {
      name: entry.name.trim(),
      email: normalizedEmail,
      phone: entry.phone?.trim() || undefined,
      joinedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

const DEMO_WAITLIST_DOMAIN = "@demo.pickleera.local";

const DEMO_WAITLIST: Array<Omit<WaitlistEntry, "joinedAt"> & { daysAgo: number }> =
  [
    { name: "Rica Gomez", email: `rica${DEMO_WAITLIST_DOMAIN}`, phone: "0917 111 2201", daysAgo: 0 },
    { name: "Jon Sy", email: `jon${DEMO_WAITLIST_DOMAIN}`, phone: "0918 222 3302", daysAgo: 1 },
    { name: "Bea Castillo", email: `bea${DEMO_WAITLIST_DOMAIN}`, daysAgo: 1 },
    { name: "Mark Uy", email: `mark${DEMO_WAITLIST_DOMAIN}`, phone: "0920 444 5504", daysAgo: 2 },
    { name: "Lara Chua", email: `lara${DEMO_WAITLIST_DOMAIN}`, daysAgo: 3 },
    { name: "Paolo Dizon", email: `paolo${DEMO_WAITLIST_DOMAIN}`, phone: "0916 666 7706", daysAgo: 4 },
    { name: "Kim Fernandez", email: `kim${DEMO_WAITLIST_DOMAIN}`, daysAgo: 5 },
    { name: "Troy Aguilar", email: `troy${DEMO_WAITLIST_DOMAIN}`, phone: "0915 888 9908", daysAgo: 7 },
    { name: "Irene Basco", email: `irene${DEMO_WAITLIST_DOMAIN}`, daysAgo: 9 },
    { name: "Gabe Ortega", email: `gabe${DEMO_WAITLIST_DOMAIN}`, phone: "0912 101 1120", daysAgo: 12 },
    { name: "Mia Espino", email: `mia${DEMO_WAITLIST_DOMAIN}`, daysAgo: 15 },
    { name: "Noel Pineda", email: `noel${DEMO_WAITLIST_DOMAIN}`, phone: "0910 131 4151", daysAgo: 21 },
    { name: "Carla Sison", email: `carla${DEMO_WAITLIST_DOMAIN}`, daysAgo: 28 },
    { name: "Vince Rojas", email: `vince${DEMO_WAITLIST_DOMAIN}`, phone: "0908 161 7181", daysAgo: 35 },
    { name: "Tess Miranda", email: `tess${DEMO_WAITLIST_DOMAIN}`, daysAgo: 42 },
    { name: "Owen Valdez", email: `owen${DEMO_WAITLIST_DOMAIN}`, daysAgo: 50 },
    { name: "Yuki Sato", email: `yuki${DEMO_WAITLIST_DOMAIN}`, phone: "0906 192 0212", daysAgo: 60 },
    { name: "Dana Flores", email: `dana${DEMO_WAITLIST_DOMAIN}`, daysAgo: 75 },
  ];

/** Seeds / refreshes demo waitlist rows. Keeps non-demo entries. Skipped in Vitest. */
export function ensureWaitlistFixtures() {
  if (import.meta.env.MODE === "test") return;

  const now = Date.now();
  const kept = listWaitlistEntries().filter(
    (item) => !item.email.endsWith(DEMO_WAITLIST_DOMAIN),
  );
  const demos: WaitlistEntry[] = DEMO_WAITLIST.map((item) => ({
    name: item.name,
    email: item.email,
    phone: item.phone,
    joinedAt: new Date(now - item.daysAgo * 24 * 60 * 60_000).toISOString(),
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...kept, ...demos]));
}
