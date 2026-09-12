import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import RootLayout from "@/layouts/RootLayout";
import { StudentPortalLayout } from "@/layouts/StudentPortalLayout";
import { AdminPortalLayout } from "@/layouts/AdminPortalLayout";
import { HomePage } from "@/pages/home/HomePage";
import { Skeleton } from "@/components/ui/skeleton";

const LoginPage = lazy(() =>
  import("@/pages/login/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("@/pages/signup/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/forgot-password/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/reset-password/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/not-found/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

const OverviewPage = lazy(() =>
  import("@/pages/app/overview/OverviewPage").then((m) => ({
    default: m.OverviewPage,
  })),
);
const BookingsPage = lazy(() =>
  import("@/pages/app/bookings/BookingsPage").then((m) => ({
    default: m.BookingsPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@/pages/app/calendar/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/pages/app/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/dashboard/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminBookingsPage = lazy(() =>
  import("@/pages/admin/bookings/AdminBookingsPage").then((m) => ({
    default: m.AdminBookingsPage,
  })),
);
const AdminCalendarPage = lazy(() =>
  import("@/pages/admin/calendar/AdminCalendarPage").then((m) => ({
    default: m.AdminCalendarPage,
  })),
);
const AdminWaitlistPage = lazy(() =>
  import("@/pages/admin/waitlist/AdminWaitlistPage").then((m) => ({
    default: m.AdminWaitlistPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/settings/AdminSettingsPage").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-lg items-center justify-center p-8">
      <Skeleton className="h-48 w-full" aria-label="Loading page" />
    </div>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            <Route path="app" element={<StudentPortalLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="admin" element={<AdminPortalLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="calendar" element={<AdminCalendarPage />} />
              <Route path="waitlist" element={<AdminWaitlistPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}
