import { ArrowRight, Lock, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthLayout,
  AuthPasswordField,
  AuthSubmit,
} from "@/components/marketing/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await resetPassword({ email, password });
      navigate("/login", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not reset that password.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
        Account
      </p>
      <h1 className="display mt-3 text-[36px] text-white sm:text-[48px]">
        New password.
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Choose a new password for your Pickle Era account.
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
          label="New password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          icon={<Lock size={16} />}
        />
        <AuthPasswordField
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Repeat password"
          icon={<Lock size={16} />}
        />
        <AuthError message={error} />
        <AuthSubmit pending={pending}>
          Save password
          <ArrowRight size={16} />
        </AuthSubmit>
      </form>

      <div className="mt-8 space-y-4">
        <AuthDivider label="Ready to play?" />
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow transition hover:text-white"
        >
          Back to log in
          <ArrowRight size={14} />
        </Link>
      </div>
    </AuthLayout>
  );
}
