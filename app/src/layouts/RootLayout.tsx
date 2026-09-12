import { Outlet, useLocation } from "react-router-dom";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function RootLayout() {
  const { pathname } = useLocation();
  const isPortal = pathname.startsWith("/app") || pathname.startsWith("/admin");

  return (
    <div className="min-h-svh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground"
      >
        Skip to main content
      </a>
      <OfflineBanner />
      {/* Portal shells own full-viewport height; skip wrapper box. */}
      <main id="main" className={isPortal ? "contents" : undefined}>
        <Outlet />
      </main>
    </div>
  );
}
