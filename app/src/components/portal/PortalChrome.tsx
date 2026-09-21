import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { initialsFromName } from "@/lib/user/initials";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

export type PortalNavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon?: LucideIcon;
};

type PortalChromeProps = {
  title: string;
  items: PortalNavItem[];
  children: React.ReactNode;
  homeTo?: string;
};

export function PortalChrome({
  title,
  items,
  children,
  homeTo = "/",
}: PortalChromeProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="portal-shell flex h-svh overflow-hidden bg-black text-white">
      <aside
        className="hidden h-full w-56 shrink-0 flex-col border-r border-white/10 bg-black md:flex"
        aria-label={title}
      >
        <SidebarBrand homeTo={homeTo} title={title} />
        <SidebarNav items={items} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter
          userName={user?.name}
          userEmail={user?.email}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
              <SidebarBrand homeTo={homeTo} title={title} compact />
              <button
                type="button"
                className="grid size-10 place-items-center rounded-xl border border-white/20 text-white"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav items={items} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter
              userName={user?.name}
              userEmail={user?.email}
              loggingOut={loggingOut}
              onLogout={() => {
                setMobileOpen(false);
                void handleLogout();
              }}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black px-4 md:hidden">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-white/20 text-white"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <img src="/logo.png" alt="Pickle Era" className="h-7 w-auto" />
          <span className="size-10" aria-hidden />
        </header>

        <main
          className="portal-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          data-lenis-prevent
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarBrand({
  homeTo,
  title,
  compact = false,
}: {
  homeTo: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("border-b border-white/10", compact ? "py-0" : "px-4 py-4")}
    >
      <Link
        to={homeTo}
        className="inline-flex items-center"
        aria-label="Pickle Era"
      >
        <img src="/logo.png" alt="Pickle Era" className="h-8 w-auto" />
      </Link>
      <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-yellow">
        {title}
      </p>
    </div>
  );
}

function SidebarNav({
  items,
  onNavigate,
}: {
  items: PortalNavItem[];
  onNavigate: () => void;
}) {
  return (
    <nav
      className="flex flex-1 flex-col gap-0.5 px-2.5 py-3"
      aria-label="Portal"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                // Touch drawer keeps a 44px row; the pointer sidebar runs tighter.
                "flex min-h-11 items-center gap-2.5 rounded-full px-3 text-[13px] font-semibold transition md:min-h-0 md:py-2",
                isActive
                  ? "bg-yellow text-black"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )
            }
          >
            {Icon ? <Icon size={16} aria-hidden className="shrink-0" /> : null}
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  userName,
  userEmail,
  loggingOut,
  onLogout,
}: {
  userName?: string;
  userEmail?: string;
  loggingOut: boolean;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-3 py-3">
      {userName ? (
        <>
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-yellow text-[11px] font-bold text-black"
            aria-hidden
          >
            {initialsFromName(userName, userEmail ?? "")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">
              {userName}
            </span>
            {userEmail ? (
              <span className="block truncate text-[11px] text-white/45">
                {userEmail}
              </span>
            ) : null}
          </span>
        </>
      ) : null}
      <button
        type="button"
        disabled={loggingOut}
        onClick={() => void onLogout()}
        className="grid size-11 shrink-0 place-items-center rounded-full text-white/55 transition hover:bg-white/5 hover:text-yellow disabled:cursor-not-allowed disabled:opacity-50 md:size-9"
        aria-label={loggingOut ? "Logging out" : "Log out"}
        title="Log out"
      >
        <LogOut size={16} aria-hidden />
      </button>
    </div>
  );
}
