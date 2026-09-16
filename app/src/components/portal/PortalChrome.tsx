import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
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

  return (
    <div className="portal-shell flex h-svh overflow-hidden bg-black text-white">
      <aside
        className="hidden h-full w-64 shrink-0 flex-col border-r border-white/10 bg-black md:flex"
        aria-label={title}
      >
        <SidebarBrand homeTo={homeTo} title={title} />
        <SidebarNav items={items} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter userName={user?.name} onLogout={logout} />
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
              onLogout={() => {
                setMobileOpen(false);
                void logout();
              }}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black px-4 md:hidden">
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
      className={cn("border-b border-white/10", compact ? "py-0" : "px-5 py-6")}
    >
      <Link
        to={homeTo}
        className="inline-flex items-center"
        aria-label="Pickle Era"
      >
        <img
          src="/logo.png"
          alt="Pickle Era"
          className={cn("w-auto", compact ? "h-8" : "h-9")}
        />
      </Link>
      <p
        className={cn(
          "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-yellow",
          compact ? "mt-2" : "mt-4",
        )}
      >
        {title}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
        A new era of pickleball
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
    <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5" aria-label="Portal">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
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
  onLogout,
}: {
  userName?: string;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <div className="mt-auto border-t border-white/10 px-4 py-4">
      {userName ? (
        <p className="truncate text-xs font-medium text-white/80">{userName}</p>
      ) : null}
      <button
        type="button"
        onClick={() => void onLogout()}
        className="mt-3 inline-flex items-center gap-2 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-yellow"
      >
        <LogOut size={12} aria-hidden />
        Log out
      </button>
    </div>
  );
}
