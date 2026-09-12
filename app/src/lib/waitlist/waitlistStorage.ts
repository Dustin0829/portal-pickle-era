export type WaitlistEntry = {
  name: string;
  email: string;
  phone?: string;
  joinedAt: string;
};

const STORAGE_KEY = "pickle-era-waitlist";

export function listWaitlistEntries(): WaitlistEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as WaitlistEntry[];
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
