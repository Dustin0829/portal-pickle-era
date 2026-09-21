import {
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { PortalChrome } from "@/components/portal/PortalChrome";
import { PortalRouteFallback } from "@/components/portal/PortalRouteFallback";
import { FOOD_ENABLED } from "@/lib/featureFlags";

const items = [
  { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/top-ups", label: "Top-ups", icon: Wallet },
  { to: "/admin/food", label: "Food", icon: UtensilsCrossed },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/admin/players", label: "Players", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
].filter((item) => FOOD_ENABLED || item.to !== "/admin/food");

export function AdminPortalLayout() {
  return (
    <ProtectedRoute requireRole="admin">
      <PortalChrome title="Facility admin" items={items} homeTo="/admin">
        <Suspense fallback={<PortalRouteFallback />}>
          <Outlet />
        </Suspense>
      </PortalChrome>
    </ProtectedRoute>
  );
}
