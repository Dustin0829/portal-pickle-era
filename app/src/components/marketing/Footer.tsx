import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { href: "#top", label: "Home" },
  { href: "#play", label: "Play" },
  { href: "#facilities", label: "Facilities" },
  { href: "#location", label: "Location" },
  { href: "#faq", label: "FAQ" },
];

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/35 text-white transition hover:border-yellow hover:text-yellow"
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

function Brand() {
  return (
    <div>
      <a href="#top" className="inline-flex" aria-label="Pickle Era">
        <img
          src="/pickle-era-branding-03.png"
          alt="Pickle Era"
          className="-my-8 h-28 w-auto mix-blend-screen lg:-my-10 lg:h-32"
        />
      </a>
      <p className="max-w-[18ch] text-[10px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-white/55">
        Good people.
        <br className="hidden lg:block" />
        <span className="lg:hidden"> </span>
        Great rallies.
      </p>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t-[6px] border-green bg-[#1D1D1B] text-white">
      <img
        src="/footer-ball.jpg"
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[70%] object-cover object-right lg:w-[48%]"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 32%)",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 32%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, #1D1D1B 0%, #1D1D1B 42%, rgb(29 29 27 / 0.96) 54%, rgb(29 29 27 / 0.7) 64%, rgb(29 29 27 / 0.28) 76%, transparent 92%),
            linear-gradient(180deg, rgb(29 29 27 / 0.45) 0%, transparent 18%),
            linear-gradient(0deg, rgb(29 29 27 / 0.5) 0%, transparent 20%)
          `,
          boxShadow:
            "inset 280px 0 160px 80px #1D1D1B, inset 0 36px 40px 0 #1D1D1B, inset 0 -40px 44px 0 #1D1D1B",
        }}
      />

      <svg
        className="pointer-events-none absolute right-3 top-8 h-24 w-24 stroke-green/45 lg:hidden"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="18"
          y="18"
          width="70"
          height="70"
          transform="rotate(45 50 50)"
          strokeWidth="1.2"
        />
      </svg>
      <svg
        className="pointer-events-none absolute bottom-20 left-0 hidden h-28 w-28 stroke-green/35 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="18"
          y="18"
          width="70"
          height="70"
          transform="rotate(45 50 50)"
          strokeWidth="1.2"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 xl:max-w-7xl">
        <div className="lg:hidden">
          <Brand />
          <nav className="mt-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-between border-b border-white/15 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:text-yellow"
              >
                {link.label}
                <ChevronRight size={16} className="text-white/50" />
              </a>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-4">
            <SocialLink href="https://instagram.com" label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href="https://facebook.com" label="Facebook">
              <FacebookIcon />
            </SocialLink>
            <span className="h-8 w-px bg-white/25" />
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/70">
              Play more
              <br />
              Live better
              <span className="mt-1.5 block h-0.5 w-10 bg-yellow" />
            </p>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[1.15fr_0.8fr_0.8fr_0.8fr_auto] lg:items-start lg:gap-8">
          <Brand />
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow">
              Navigate
            </p>
            <div className="flex flex-col gap-2 text-[12px] text-white/70">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-yellow"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow">
              Community
            </p>
            <div className="flex flex-col gap-2 text-[12px] text-white/70">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-yellow"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-yellow"
              >
                Facebook
              </a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow">
              Contact
            </p>
            <p className="text-[12px] text-white/70">Imus, Cavite</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.2em] text-white">
              Play more
              <br />
              Live better
            </p>
            <span className="ml-auto mt-2 block h-0.5 w-12 bg-yellow" />
            <div className="mt-5 flex justify-end gap-3">
              <SocialLink href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://facebook.com" label="Facebook">
                <FacebookIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <p className="text-[12px] text-white/50 lg:hidden">
            © {year} Pickle Era. All rights reserved.
          </p>
          <div className="mt-3 flex gap-4 text-[12px] text-white/50 lg:hidden">
            <a href="#faq" className="transition hover:text-white">
              Privacy Policy
            </a>
            <span className="text-white/25">|</span>
            <a href="#faq" className="transition hover:text-white">
              Terms of Service
            </a>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4 lg:hidden">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase leading-[1.6] tracking-[0.2em] text-white/55">
              <span>
                Play
                <br />
                Connect
                <br />
                Belong
              </span>
              <span className="mb-3 h-px w-20 bg-white/25" />
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Cavite, PH
            </p>
          </div>

          <div className="hidden items-center justify-between text-[12px] text-white/50 lg:flex">
            <p>© {year} Pickle Era. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#faq" className="transition hover:text-white">
                Privacy Policy
              </a>
              <span className="text-white/25">|</span>
              <a href="#faq" className="transition hover:text-white">
                Terms of Service
              </a>
            </div>
            <p className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Cavite, PH
              <span className="mt-1 ml-auto block h-0.5 w-8 bg-yellow" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
