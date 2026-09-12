import { Check } from "lucide-react";
import { BookingButton } from "@/components/marketing/BookingButton";

const points = [
  "Book a court",
  "Join a clinic or open play",
  "Meet a community that shares your passion",
];

export function Pillars() {
  return (
    <section className="bg-black">
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        <div className="relative min-h-[380px] overflow-hidden lg:h-full lg:min-h-0">
          <img
            src="/action.jpg"
            alt="Pickleball player at Pickle Era"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end px-6 py-10 sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Pickleball community lifestyle
            </p>
            <h2 className="display mt-3 max-w-[8ch] text-[52px] text-white sm:text-[72px]">
              Play
              <br />
              <span className="text-yellow">your</span>
              <br />
              era
            </h2>
          </div>
        </div>

        <div className="dots flex flex-col justify-center bg-green px-5 py-16 sm:px-10 sm:py-20">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
            Get started
          </p>
          <h2 className="display max-w-[14ch] text-[36px] text-white sm:text-[52px]">
            Same sport. A healthier, happier you.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80">
            Whether it&apos;s your first time or your hundredth game,
            there&apos;s always a place for you at Pickle Era.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-white"
              >
                <span className="mt-0.5 grid h-5 w-5 place-items-center bg-yellow text-black">
                  <Check size={12} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <BookingButton
            plan="court"
            className="mt-10 inline-flex w-fit bg-yellow px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
          >
            Book a court
          </BookingButton>
        </div>
      </div>
    </section>
  );
}
