import {
  CalendarDays,
  CalendarRange,
  Home,
  UserRound,
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
  { to: "/app", label: "Overview", end: true, icon: Home },
  { to: "/app/bookings", label: "My bookings", icon: CalendarDays },
  { to: "/app/calendar", label: "Court calendar", icon: CalendarRange },
  { to: "/app/food", label: "Food", icon: UtensilsCrossed },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/profile", label: "Profile", icon: UserRound },
].filter((item) => FOOD_ENABLED || item.to !== "/app/food");

export function StudentPortalLayout() {
  return (
    <PortalChrome title="Player portal" items={items} homeTo="/app">
      <ProtectedRoute>
        <Suspense fallback={<PortalRouteFallback />}>
          <Outlet />
        </Suspense>
      </ProtectedRoute>
    </PortalChrome>
  );
}
