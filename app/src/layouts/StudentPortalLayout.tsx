import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";
import { PlayerComingSoon } from "@/pages/app/PlayerComingSoon";

export function StudentPortalLayout() {
  return (
    <ProtectedRoute>
      <PortalChrome title="Player portal" items={[]} homeTo="/app">
        <PlayerComingSoon />
      </PortalChrome>
    </ProtectedRoute>
  );
}
