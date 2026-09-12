import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";

const items = [
  { to: "/app", label: "Overview", end: true },
  { to: "/app/bookings", label: "My bookings" },
  { to: "/app/calendar", label: "Court calendar" },
  { to: "/app/profile", label: "Profile" },
];

export function StudentPortalLayout() {
  return (
    <ProtectedRoute>
      <PortalChrome title="Student portal" items={items} homeTo="/app">
        <Outlet />
      </PortalChrome>
    </ProtectedRoute>
  );
}
