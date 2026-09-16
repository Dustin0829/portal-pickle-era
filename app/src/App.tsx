import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import RootLayout from "@/layouts/RootLayout";
import { StudentPortalLayout } from "@/layouts/StudentPortalLayout";
import { AdminPortalLayout } from "@/layouts/AdminPortalLayout";
import { HomePage } from "@/pages/home/HomePage";
import { OverviewPage } from "@/pages/app/overview/OverviewPage";
import { BookingsPage } from "@/pages/app/bookings/BookingsPage";
import { CalendarPage } from "@/pages/app/calendar/CalendarPage";
import { ProfilePage } from "@/pages/app/profile/ProfilePage";
import { AdminDashboardPage } from "@/pages/admin/dashboard/AdminDashboardPage";
import { AdminBookingsPage } from "@/pages/admin/bookings/AdminBookingsPage";
import { AdminCalendarPage } from "@/pages/admin/calendar/AdminCalendarPage";
import { AdminPlayersPage } from "@/pages/admin/waitlist/AdminWaitlistPage";
import { AdminSettingsPage } from "@/pages/admin/settings/AdminSettingsPage";
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

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="login"
            element={
              <LazyPage>
                <LoginPage />
              </LazyPage>
            }
          />
          <Route
            path="signup"
            element={
              <LazyPage>
                <SignupPage />
              </LazyPage>
            }
          />
          <Route
            path="forgot-password"
            element={
              <LazyPage>
                <ForgotPasswordPage />
              </LazyPage>
            }
          />
          <Route
            path="reset-password"
            element={
              <LazyPage>
                <ResetPasswordPage />
              </LazyPage>
            }
          />

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
            <Route path="players" element={<AdminPlayersPage />} />
            <Route
              path="waitlist"
              element={<Navigate to="/admin/players" replace />}
            />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route
            path="*"
            element={
              <LazyPage>
                <NotFoundPage />
              </LazyPage>
            }
          />
        </Route>
      </Routes>
    </SmoothScroll>
  );
}
