import { type FormEvent, useState } from "react";
import { useCreateWaitlistEntry } from "@/api/features/waitlist/use-waitlist";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";

export function Waitlist() {
  const { createWaitlistEntry, isCreatingWaitlist } = useCreateWaitlistEntry();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim()) return;
    try {
      await createWaitlistEntry({
        name: "",
        email: email.trim(),
        source: "newsletter",
      });
      setSubmitted(true);
    } catch (caught) {
      setError(getUserFacingApiErrorMessage(caught));
    }
  }

  return (
    <section
      id="waitlist"
      className="dots relative overflow-hidden bg-green px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
          Join the community
        </p>
        <h2 className="display text-[48px] text-white sm:text-[68px]">
          Be first in.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
          Get updates on opening, events, and everything Pickle Era.
        </p>

        {submitted ? (
          <p className="mt-8 bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-yellow">
            You&apos;re on the list. See you in the era.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row sm:gap-0 sm:overflow-hidden"
          >
            <label htmlFor="subscribe-email" className="sr-only">
              Email
            </label>
            <input
              id="subscribe-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="h-14 w-full bg-black px-5 text-base leading-normal text-white outline-none placeholder:text-white/40 sm:h-12 sm:flex-1 sm:text-sm"
            />
            <button
              type="submit"
              disabled={isCreatingWaitlist}
              className="h-14 bg-yellow px-7 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60 sm:h-12"
            >
              {isCreatingWaitlist ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        {error ? (
          <p className="mt-3 text-sm text-yellow" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
