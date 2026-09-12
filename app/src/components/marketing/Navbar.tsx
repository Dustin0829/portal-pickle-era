import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/marketing/Logo";
import { portalHomePath } from "@/lib/auth/portalHome";
import { useAuth } from "@/providers/AuthProvider";

const links = [
  { href: "#top", label: "Home" },
  { href: "#play", label: "Play" },
  { href: "#facilities", label: "Facilities" },
  { href: "#location", label: "Location" },
  { href: "#faq", label: "FAQ" },
];

const loginClass =
  "bg-yellow px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white";
const loginMobileClass =
  "mt-2 inline-flex w-full items-center justify-center bg-yellow px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-black";
const portalLinkClass =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-yellow";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const portalTo = portalHomePath(user?.role);

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 sm:h-[80px] sm:px-8">
        <Logo />

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-yellow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {user ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link to={portalTo} className={portalLinkClass}>
              Portal
            </Link>
            <button type="button" onClick={logout} className={loginClass}>
              Log out
            </button>
          </div>
        ) : (
          <Link to="/login" className={`hidden md:inline-flex ${loginClass}`}>
            Log in
          </Link>
        )}

        <button
          type="button"
          className="grid h-10 w-10 place-items-center border border-white/20 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-black px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-1 text-sm font-semibold uppercase tracking-[0.16em] text-white/85"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link
                  to={portalTo}
                  className="py-1 text-sm font-semibold uppercase tracking-[0.16em] text-yellow"
                  onClick={() => setOpen(false)}
                >
                  Portal
                </Link>
                <button
                  type="button"
                  className={loginMobileClass}
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={loginMobileClass}
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
