import { ArrowRight } from "lucide-react";
import { BookingButton } from "@/components/marketing/BookingButton";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[88svh] overflow-hidden">
      <img
        src="/hero.jpg"
        alt="Pickleball player on court"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

      <div className="relative mx-auto flex min-h-[88svh] max-w-6xl items-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24 xl:max-w-7xl xl:pb-28 2xl:max-w-[92rem] 2xl:pb-32">
        <div className="max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.32em] text-yellow xl:text-[14px] 2xl:text-[15px]">
            Play. Meet. Belong.
          </p>
          <h1 className="display text-[48px] text-white sm:text-[68px] lg:text-[80px] xl:text-[96px] 2xl:text-[112px]">
            Welcome to
            <br />
            your <span className="text-yellow">pickle era.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base xl:mt-6 xl:max-w-lg xl:text-lg 2xl:text-xl">
            A modern pickleball facility built for players of all levels.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 xl:mt-10 xl:gap-4">
            <BookingButton
              plan="court"
              className="inline-flex items-center gap-2 bg-yellow px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white xl:px-8 xl:py-4 xl:text-[13px]"
            >
              Book a court
              <ArrowRight size={14} />
            </BookingButton>
            <a
              href="#facilities"
              className="inline-flex border border-white/40 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-yellow hover:text-yellow xl:px-8 xl:py-4 xl:text-[13px]"
            >
              Explore
            </a>
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 border border-white/35 px-3 py-5 sm:right-8 lg:flex xl:right-12 xl:px-4 xl:py-7">
        <p className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 xl:gap-3 xl:text-[12px]">
          <span>Good</span>
          <span>People</span>
          <span>Great</span>
          <span>Rallies</span>
        </p>
      </div>
    </section>
  );
}
