import { ArrowRight, BarChart3, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";

const pillars = ["Play", "Connect", "Improve", "Belong"];

const cards: {
  n: string;
  title: string;
  body: string;
  image: string;
  overlay: string;
  icon: ReactNode;
}[] = [
  {
    n: "01",
    title: "Play",
    body: "Well-maintained courts for all skill levels.",
    image: "/vibe-play.jpg",
    overlay: "bg-green/78",
    icon: <PaddleIcon />,
  },
  {
    n: "02",
    title: "Improve",
    body: "Clinics, open play, and resident coaches.",
    image: "/vibe-improve.jpg",
    overlay: "bg-blue/80",
    icon: <BarChart3 size={20} strokeWidth={2.2} />,
  },
  {
    n: "03",
    title: "Connect",
    body: "A growing community that loves the game.",
    image: "/vibe-connect.jpg",
    overlay: "bg-maroon/82",
    icon: <Users size={20} strokeWidth={2.2} />,
  },
  {
    n: "04",
    title: "Belong",
    body: "More than a sport, it's a lifestyle.",
    image: "/lounge.jpg",
    overlay: "bg-black/70",
    icon: <Trophy size={20} strokeWidth={2.2} />,
  },
];

function PaddleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect
        x="6.4"
        y="2.2"
        width="11.2"
        height="13.6"
        rx="5.6"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <rect
        x="10"
        y="15.4"
        width="4"
        height="6.4"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function Vibe() {
  return (
    <section
      id="play"
      className="relative overflow-hidden bg-black px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="pointer-events-none absolute right-0 top-1/2 hidden origin-center -translate-y-1/2 rotate-90 text-[11px] font-bold uppercase tracking-[0.55em] text-white/25 xl:block">
        Pickle Era
      </p>

      <div className="relative mx-auto max-w-6xl xl:max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Why Pickle Era
              <span className="h-px w-14 bg-yellow" />
            </p>
            <h2 className="display max-w-[15ch] text-[42px] text-white sm:text-[64px] xl:text-[76px]">
              More than just
              <br />
              <span className="text-yellow">a game.</span>
            </h2>
          </div>

          <div className="lg:max-w-md lg:justify-self-end">
            <div className="flex items-start justify-between gap-6">
              <p className="text-[15px] leading-relaxed text-white/70">
                Pickleball is for everyone. Whether you&apos;re here to compete,
                stay active, or just have fun, Pickle Era gives you the space to
                do more.
              </p>
              <p className="hidden shrink-0 flex-col items-end text-[9px] font-semibold uppercase leading-[1.45] tracking-[0.18em] text-white/45 xl:flex">
                <span>Good people</span>
                <span>Great rallies</span>
              </p>
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              {pillars.map((item, index) => (
                <span key={item}>
                  {index > 0 && <span className="mx-2 text-green">·</span>}
                  {item}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.title}
              className="relative overflow-hidden px-5 py-5 text-white"
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className={`absolute inset-0 ${card.overlay}`} />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_42px_rgba(0,0,0,0.55),inset_0_-30px_40px_rgba(0,0,0,0.5)]" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    {card.icon}
                  </div>
                  <a
                    href="#facilities"
                    aria-label={`${card.title} — explore`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition hover:border-yellow hover:bg-yellow hover:text-black"
                  >
                    <ArrowRight size={14} strokeWidth={2.4} />
                  </a>
                </div>
                <div className="[text-shadow:0_2px_12px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.55)]">
                  <p className="text-[11px] font-bold tracking-[0.22em] text-white">
                    {card.n}
                  </p>
                  <h3 className="display mt-0.5 text-[34px] leading-none sm:text-[38px]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[13px] font-medium leading-snug text-white">
                    {card.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
