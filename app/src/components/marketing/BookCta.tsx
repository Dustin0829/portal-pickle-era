import { BookingButton } from "@/components/marketing/BookingButton";

const pillars = ["Play", "Improve", "Connect", "Belong"];

export function BookCta() {
  return (
    <section className="bg-black">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px] overflow-hidden lg:min-h-[340px]">
          <img
            src="/cta-paddle.jpg"
            alt="Player holding a pickleball paddle"
            className="absolute inset-0 h-full w-full object-cover object-[30%_center]"
          />
          <div className="absolute inset-0 bg-black/25" />
          <p className="absolute left-5 top-1/2 flex -translate-y-1/2 flex-col gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:left-8">
            {pillars.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden bg-green px-6 py-14 sm:px-12 sm:py-16">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
            Ready to play?
          </p>
          <h2 className="display max-w-[12ch] text-[40px] text-white sm:text-[56px] xl:text-[64px]">
            Join the club today.
          </h2>
          <p className="mt-4 text-sm text-white/80">
            Leave your details — we&apos;ll reach out when courts open.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookingButton
              plan="court"
              className="inline-flex items-center gap-2 bg-yellow px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white"
            />
            <a
              href="#pricing"
              className="inline-flex border border-white/50 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-yellow hover:text-yellow"
            >
              View pricing
            </a>
          </div>
          <p className="pointer-events-none absolute right-0 top-1/2 hidden origin-center -translate-y-1/2 rotate-90 text-[11px] font-bold uppercase tracking-[0.55em] text-white/25 xl:block">
            Pickle Era
          </p>
        </div>
      </div>
    </section>
  );
}
