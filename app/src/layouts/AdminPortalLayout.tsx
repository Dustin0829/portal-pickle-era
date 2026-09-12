import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";

const items = [
  { to: "/admin", label: "Bookings", end: true },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/waitlist", label: "Waitlist" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminPortalLayout() {
  return (
    <ProtectedRoute requireRole="admin">
      <PortalChrome title="Facility admin" items={items} homeTo="/admin">
        <Outlet />
      </PortalChrome>
    </ProtectedRoute>
  );
}
