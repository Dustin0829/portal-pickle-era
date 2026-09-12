import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useState } from "react";
import { Logo } from "@/components/marketing/Logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-black">
      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
        <Logo className="h-9 w-auto mix-blend-screen sm:h-11" />
        <p className="mt-6 hidden max-w-[14ch] text-[11px] font-semibold uppercase leading-relaxed tracking-[0.28em] text-white/70 lg:block">
          Play more.
          <br />
          Live better.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-[78%] w-[48%] lg:block">
        <img
          src="/paddle.png"
          alt=""
          className="h-full w-full object-cover object-[12%_80%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(29 29 27 / 0) 0%, rgb(29 29 27 / 0.08) 38%, rgb(29 29 27 / 0.55) 72%, #1d1d1b 100%), linear-gradient(to right, rgb(29 29 27 / 0.08) 0%, rgb(29 29 27 / 0.12) 28%, rgb(29 29 27 / 0.55) 62%, rgb(29 29 27 / 0.9) 82%, #1d1d1b 100%)",
          }}
        />
      </div>

      <Diamond className="pointer-events-none absolute -right-10 top-8 hidden h-44 w-44 text-yellow/35 lg:block" />
      <Diamond className="pointer-events-none absolute -right-6 bottom-28 hidden h-28 w-28 text-yellow/20 lg:block" />

      <div className="relative flex min-h-svh items-center justify-center px-5 py-24 sm:px-8">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>

      <p className="absolute bottom-7 right-6 hidden text-right text-[10px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-white/55 lg:block">
        Good people.
        <br />
        Great rallies.
        <span className="ml-auto mt-2 block h-0.5 w-8 bg-yellow" />
      </p>
    </div>
  );
}

function Diamond({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

const fieldClass =
  "h-12 w-full rounded-lg border border-white/12 bg-transparent text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow";

export function AuthField({
  label,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
}) {
  const id = props.id ?? props.name;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          {...props}
          className={`${fieldClass} ${icon ? "pl-11 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export function AuthPasswordField({
  label,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const id = props.id ?? props.name;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          {...props}
          className={`${fieldClass} ${icon ? "pl-11" : "pl-4"} pr-12`}
          type={visible ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-yellow"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="text-sm text-yellow">{message}</p>;
}

export function AuthSubmit({
  children,
  pending,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35"
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 text-[12px] text-white/45">
      <span className="h-px flex-1 bg-white/15" />
      {label}
      <span className="h-px flex-1 bg-white/15" />
    </div>
  );
}
