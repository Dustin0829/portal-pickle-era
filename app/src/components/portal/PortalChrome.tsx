import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  appContentPaddingClass,
  appContentWidthClass,
} from "@/components/layout/layout.constants";
import { useAuth } from "@/providers/AuthProvider";

export type PortalNavItem = {
  to: string;
  label: string;
  end?: boolean;
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-5xl items-center justify-between gap-4",
            appContentPaddingClass,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={homeTo}
              className="truncate text-sm font-semibold tracking-tight"
            >
              {title}
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Marketing
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Log out
            </button>
          </div>
        </div>
        <nav
          className={cn(
            "mx-auto flex max-w-5xl gap-1 overflow-x-auto pb-2",
            appContentPaddingClass,
          )}
          aria-label={title}
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className={cn("mx-auto max-w-5xl", appContentWidthClass.full)}>
        {children}
      </div>
    </div>
  );
}
