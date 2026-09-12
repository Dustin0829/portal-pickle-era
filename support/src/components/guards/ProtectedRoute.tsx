type ProtectedRouteProps = {
  children: React.ReactNode;
  /** When false, `fallback` is shown instead of `children`. */
  isAllowed: boolean;
  fallback?: React.ReactNode;
};

/**
 * Route guard shell — wire `isAllowed` to your auth layer when you add one.
 * Auth patterns differ per project (cookies, JWT, OAuth, etc.); not included in this template.
 */
export function ProtectedRoute({
  children,
  isAllowed,
  fallback = null,
}: ProtectedRouteProps) {
  if (!isAllowed) return fallback;
  return children;
}
