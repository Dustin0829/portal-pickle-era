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
      <div className="portal-shell flex min-h-svh items-center justify-center bg-black px-4 text-center text-white">
        <div className="max-w-md">
          <img
            src="/logo.png"
            alt="Pickle Era"
            className="mx-auto h-10 w-auto"
          />
          <h1 className="display mt-8 text-[36px] text-white sm:text-[44px]">
            Admin access required
          </h1>
          <p className="mt-3 text-sm text-white/60">
            This area is for facility admins. Your account does not have the
            admin stub role.
          </p>
          <Link
            to="/app"
            className="mt-8 inline-flex bg-yellow px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
          >
            Go to player portal
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
