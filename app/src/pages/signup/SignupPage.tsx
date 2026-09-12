import { ArrowRight, Lock, Mail, User } from "lucide-react";
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

export function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await signup({ name, email, password });
      navigate("/", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not create your account.",
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
      <h1 className="display mt-3 text-[40px] text-white sm:text-[52px]">
        Join the era.
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Create an account to book courts and save your details.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <AuthField
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          icon={<User size={16} />}
        />
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
          Create account
          <ArrowRight size={16} />
        </AuthSubmit>
      </form>

      <div className="mt-8 space-y-4">
        <AuthDivider label="Already have an account?" />
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow transition hover:text-white"
        >
          Log in
          <ArrowRight size={14} />
        </Link>
      </div>
    </AuthLayout>
  );
}
