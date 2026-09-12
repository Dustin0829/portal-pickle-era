import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  CircleParking,
  Coffee,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type Slide = {
  src: string;
  alt: string;
  feature: {
    icon: LucideIcon;
    label: string;
  };
};

const slides: Slide[] = [
  {
    src: "/Indoor-pickleball-court_page-0003.jpg",
    alt: "Indoor pickleball courts at Pickle Era",
    feature: { icon: LayoutGrid, label: "Premium Courts" },
  },
  {
    src: "/Indoor-pickleball-court_page-0002.jpg",
    alt: "Lounge and seating area at Pickle Era",
    feature: { icon: Armchair, label: "Lounge Area" },
  },
  {
    src: "/foodpark.jpg",
    alt: "Food park at Pickle Era",
    feature: { icon: Coffee, label: "Food Park" },
  },
  {
    src: "/parking.jpg",
    alt: "Parking space at Pickle Era",
    feature: { icon: CircleParking, label: "Parking Space" },
  },
];

export function Space() {
  const [index, setIndex] = useState(0);
  const active = slides[index];
  const FeatureIcon = active.feature.icon;

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section id="facilities" className="bg-black px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Our facility
            </p>
            <h2 className="display max-w-[12ch] text-[42px] text-white sm:text-[64px]">
              Your new <span className="text-yellow">favorite place</span> to
              play
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/65 lg:justify-self-end">
            3 indoor courts. 3 outdoor courts. A food park. A space designed for
            good games and great company.
          </p>
        </div>

        <div className="relative mt-10 h-[380px] overflow-hidden sm:h-[440px] lg:h-[500px]">
          {slides.map((slide, slideIndex) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                slideIndex === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <img
            src="/pickle-era-branding-04.png"
            alt=""
            className="absolute left-1/2 top-1/2 h-24 w-auto -translate-x-1/2 -translate-y-1/2 mix-blend-screen sm:h-32"
          />

          <article className="absolute right-4 top-1/2 hidden w-[140px] -translate-y-1/2 bg-black/75 px-4 py-5 backdrop-blur-sm sm:block sm:right-6 sm:w-[160px]">
            <FeatureIcon size={18} className="text-yellow" />
            <p className="mt-3 font-display text-[15px] font-bold uppercase leading-tight text-yellow">
              {active.feature.label}
            </p>
          </article>

          <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="grid h-11 w-11 place-items-center bg-black/75 text-white transition hover:bg-yellow hover:text-black"
              aria-label="Previous facility photo"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.feature.label}
                  type="button"
                  onClick={() => setIndex(slideIndex)}
                  className={`h-2 w-2 rounded-full transition ${
                    slideIndex === index
                      ? "bg-yellow"
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Show ${slide.feature.label}`}
                  aria-current={slideIndex === index ? true : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="grid h-11 w-11 place-items-center bg-black/75 text-white transition hover:bg-yellow hover:text-black"
              aria-label="Next facility photo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-yellow sm:hidden">
          <FeatureIcon size={16} />
          <span className="font-display text-[15px] font-bold uppercase tracking-[0.08em]">
            {active.feature.label}
          </span>
        </p>
      </div>
    </section>
  );
}
