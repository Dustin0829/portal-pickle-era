import { Outlet } from "react-router-dom";
import { CalendarDays, CalendarRange, Home, UserRound } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";

const items = [
  { to: "/app", label: "Overview", end: true, icon: Home },
  { to: "/app/bookings", label: "My bookings", icon: CalendarDays },
  { to: "/app/calendar", label: "Court calendar", icon: CalendarRange },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

export function StudentPortalLayout() {
  return (
    <ProtectedRoute>
      <PortalChrome title="Player portal" items={items} homeTo="/app">
        <Outlet />
      </PortalChrome>
    </ProtectedRoute>
  );
}
