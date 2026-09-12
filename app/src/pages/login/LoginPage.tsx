import { ArrowRight, Lock, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthLayout,
  AuthPasswordField,
  AuthSubmit,
} from "@/components/marketing/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";
import { portalHomePath } from "@/lib/auth/portalHome";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to={portalHomePath(user.role)} replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const next = await login({ email, password });
      navigate(portalHomePath(next.role), { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
        Account
      </p>
      <h1 className="display mt-3 text-[44px] text-white sm:text-[56px]">
        Log in.
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Welcome back. Book courts faster once you&apos;re in.
      </p>

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
        <AuthPasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          icon={<Lock size={16} />}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-yellow"
          >
            Forgot password?
          </Link>
        </div>
        <AuthError message={error} />
        <AuthSubmit pending={pending}>
          Log in
          <ArrowRight size={16} />
        </AuthSubmit>
      </form>

      <div className="mt-8 space-y-4">
        <AuthDivider label="New here?" />
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow transition hover:text-white"
        >
          Create an account
          <ArrowRight size={14} />
        </Link>
      </div>
    </AuthLayout>
  );
}
