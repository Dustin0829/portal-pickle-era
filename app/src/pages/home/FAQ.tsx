import { Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I book a court?",
    a: "Join the waitlist and we’ll send booking details as soon as courts open. Founding members get first access to court time.",
  },
  {
    q: "What are your operating hours?",
    a: "Hours will be announced with opening day. Expect early mornings through late evenings so you can play around your schedule.",
  },
  {
    q: "Do you offer equipment rental?",
    a: "Yes. Paddles and balls will be available on-site so you can walk in and play even if you are just getting started.",
  },
  {
    q: "Are walk-ins allowed?",
    a: "Open play and drop-ins are part of the club. We’ll share the walk-in and reservation setup with waitlist members first.",
  },
  {
    q: "Do you offer clinics or coaching?",
    a: "Yes. Clinics, open play, and resident coaches are built into the club for every level — first rally to regulars.",
  },
  {
    q: "Is there parking available?",
    a: "Yes. The Imus, Cavite club includes parking so you can come for a game and stay for the hangout.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-black px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              FAQ
            </p>
            <h2 className="display text-[42px] text-white sm:text-[58px]">
              Got <span className="text-yellow">questions?</span>
            </h2>
          </div>
          <p className="text-sm text-white/60 sm:pb-2">
            Here are some quick answers.
          </p>
        </div>

        <div className="mt-10">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <div
                key={item.q}
                className="border-t border-white/15 last:border-b"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-[14px] text-white/90">{item.q}</span>
                  <Plus
                    size={18}
                    className={`shrink-0 text-white/70 transition ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                {isOpen ? (
                  <p className="pb-4 text-sm leading-relaxed text-white/60">
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
