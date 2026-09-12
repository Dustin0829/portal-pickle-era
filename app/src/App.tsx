import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import RootLayout from "@/layouts/RootLayout";
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}
