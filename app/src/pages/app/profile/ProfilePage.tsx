import { Link } from "react-router-dom";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { ADMIN_FIXTURE } from "@/lib/auth/auth";
import { useAuth } from "@/providers/AuthProvider";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <AppPageShell width="profile">
      <PageHeader
        title="Profile"
        description="Account details from the local auth stub."
      />
      <PageSection>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
      </PageSection>
      <PageSection bordered>
        <p className="text-sm text-muted-foreground">
          Demo facility admin (local only): {ADMIN_FIXTURE.email} /{" "}
          {ADMIN_FIXTURE.password}. Gates are UX stubs, not real security.
        </p>
        {user?.role === "admin" ? (
          <Link
            to="/admin"
            className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Open facility admin
          </Link>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className="mt-4 block text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </PageSection>
    </AppPageShell>
  );
}
