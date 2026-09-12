import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { saveWaitlistEntry } from "@/lib/waitlist/waitlistStorage";

type JoinClubModalProps = {
  onClose: () => void;
};

export function JoinClubModal({ onClose }: JoinClubModalProps) {
  const lenis = useLenis();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lenis?.start();
    };
  }, [onClose, lenis]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!saveWaitlistEntry({ name, email, phone: phone || undefined })) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
        aria-label="Close join club"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-club-title"
        className="relative z-10 w-full max-w-md border border-yellow/20 bg-black shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Pre-signup
            </p>
            <h2
              id="join-club-title"
              className="display mt-2 text-[28px] text-white sm:text-[32px]"
            >
              Join the club.
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Leave your details and we&apos;ll reach out when booking opens.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center text-white/70 transition hover:text-yellow"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="px-5 py-8 text-center sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-yellow">
              You&apos;re on the list
            </p>
            <p className="mt-3 text-sm text-white/65">
              See you in the era. We&apos;ll email you first.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 bg-yellow px-6 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3 px-5 py-5 sm:px-6">
            <label className="flex flex-col gap-1.5 text-xs text-white/55">
              Name
              <input
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-white/55">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                className="h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-white/55">
              Phone{" "}
              <span className="font-normal normal-case tracking-normal text-white/35">
                (optional)
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="09XX XXX XXXX"
                className="h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow"
              />
            </label>

            {error ? (
              <p className="text-xs text-maroon" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-2 h-11 bg-yellow text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
            >
              Join the club
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
