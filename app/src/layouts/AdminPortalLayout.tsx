import {
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";

const items = [
  { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/admin/players", label: "Players", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
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
