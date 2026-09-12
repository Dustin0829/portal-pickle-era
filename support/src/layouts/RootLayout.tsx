import { Outlet } from "react-router-dom";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <OfflineBanner />
      <main id="main" className="pb-10">
        <Outlet />
      </main>
    </div>
  );
}
