import { ArrowRight, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthLayout,
  AuthSubmit,
} from "@/components/marketing/AuthLayout";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const next = email.trim().toLowerCase();
    if (!next) {
      setError("Enter the email on your account.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
        Account
      </p>
      <h1 className="display mt-3 text-[36px] text-white sm:text-[48px]">
        Forgot password.
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Enter your email and we&apos;ll help you set a new password.
      </p>

      {sent ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm leading-relaxed text-white/70">
            If an account exists for{" "}
            <span className="text-white">{email.trim().toLowerCase()}</span>,
            you can reset the password now.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`,
              )
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
          >
            Reset password
            <ArrowRight size={16} />
          </button>
          <AuthDivider label="Remembered it?" />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow transition hover:text-white"
          >
            Back to log in
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            icon={<Mail size={16} />}
          />
          <AuthError message={error} />
          <AuthSubmit>
            Continue
            <ArrowRight size={16} />
          </AuthSubmit>
          <AuthDivider label="Remembered it?" />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow transition hover:text-white"
          >
            Log in
            <ArrowRight size={14} />
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
