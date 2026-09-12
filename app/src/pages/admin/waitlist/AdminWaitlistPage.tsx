import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { listWaitlistEntries } from "@/lib/waitlist/waitlistStorage";

export function AdminWaitlistPage() {
  const entries = listWaitlistEntries().sort((a, b) =>
    b.joinedAt.localeCompare(a.joinedAt),
  );

  return (
    <AppPageShell>
      <PageHeader
        title="Waitlist"
        description="People who joined from the marketing waitlist form."
      />
      <PageSection>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Waitlist is empty. Entries appear after someone submits the
            marketing form.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li
                key={entry.email}
                className="rounded-lg border border-border px-4 py-3"
              >
                <p className="text-sm font-medium">{entry.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.email}
                  {entry.phone ? ` · ${entry.phone}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Joined {new Date(entry.joinedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </AppPageShell>
  );
}
