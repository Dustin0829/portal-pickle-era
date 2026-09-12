import { Link, Navigate } from "react-router-dom";
import { AuthLoadingShell } from "@/components/guards/AuthLoadingShell";
import { useAuth } from "@/providers/AuthProvider";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** When set, only users with this role may pass (after session resolves). */
  requireRole?: "admin";
};

/**
 * Session/role gate — UX only; backend must enforce roles when APIs exist.
 */
export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <AuthLoadingShell label="Checking session" />;
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === "admin" && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin access required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for facility admins. Your account does not have the admin
          stub role.
        </p>
        <Link
          to="/app"
          className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Go to student portal
        </Link>
      </div>
    );
  }

  return children;
}
