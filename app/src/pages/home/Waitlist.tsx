import { type FormEvent, useState } from "react";
import { saveWaitlistEntry } from "@/lib/waitlist/waitlistStorage";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    if (!saveWaitlistEntry({ name: "", email })) return;
    setSubmitted(true);
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
              className="h-14 bg-yellow px-7 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white sm:h-12"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
