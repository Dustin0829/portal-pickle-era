import {
  Armchair,
  ArrowRight,
  Check,
  Coffee,
  SquareParking,
  Wifi,
} from "lucide-react";
import { BookingButton } from "@/components/marketing/BookingButton";
import { PLAN_META, type BookingPlan } from "@/lib/booking/booking";
import { usePlanPrices } from "@/lib/booking/planPrices";

const planCopy: Array<{
  n: string;
  image: string;
  title: string;
  body: string;
  unit: string;
  points: string[];
  cta: string;
  featured: boolean;
  plan: BookingPlan;
}> = [
  {
    n: "01",
    image: "/pricing-court.jpg",
    title: "Court Rental",
    body: "Private court for you and your crew.",
    unit: "/ hour",
    points: [
      "Good for up to 4 players",
      "High-quality indoor courts",
      "Paddles and balls available for rent",
      "Perfect for casual or competitive play",
    ],
    cta: "Book a court",
    featured: true,
    plan: "court" as const,
  },
  {
    n: "02",
    image: "/pricing-paddle.jpg",
    title: "Open Play",
    body: "Meet players. All skill levels welcome.",
    unit: "/ session",
    points: [
      "Great for individuals or small groups",
      "Mix and match with other players",
      "A fun way to join the community",
      "Schedules posted weekly",
    ],
    cta: "Join open play",
    featured: false,
    plan: "open-play" as const,
  },
  {
    n: "03",
    image: "/pricing-clinics.jpg",
    title: "Clinics & Coaching",
    body: "Learn, improve, and level up.",
    unit: "/ session",
    points: [
      "Beginner to advanced sessions",
      "Led by experienced coaches",
      "Small group training",
      "Technique, strategy, and game play",
    ],
    cta: "View clinics",
    featured: false,
    plan: "clinic" as const,
  },
];

const amenities = [
  { label: "Premium Courts", icon: CourtIcon },
  { label: "Equipment Rentals", icon: PaddleIcon },
  { label: "Lounge Area", icon: Armchair },
  { label: "Parking Space", icon: SquareParking },
  { label: "Free Wi-Fi", icon: Wifi },
  { label: "Food & Drinks", icon: Coffee },
];

function CourtIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <line
        x1="3"
        y1="12"
        x2="8.5"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <line
        x1="15.5"
        y1="12"
        x2="21"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <line
        x1="8.5"
        y1="4"
        x2="8.5"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="15.5"
        y1="4"
        x2="15.5"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function PaddleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6.2"
        y="2.2"
        width="11.6"
        height="13.4"
        rx="5.6"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="10"
        y="15.2"
        width="4"
        height="6.4"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function Pricing() {
  const savedPlans = usePlanPrices();

  return (
    <section id="pricing" className="bg-black px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              Courts & Pricing
              <span className="h-px w-14 bg-yellow" />
            </p>
            <h2 className="display text-[42px] text-white sm:text-[64px] xl:text-[72px]">
              Play <span className="text-yellow">your way.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
              Flexible options for every kind of player. Whether you&apos;re
              here for a casual game, regular practice, or to join a community,
              we&apos;ve got you covered.
            </p>
          </div>

          <p className="hidden text-[10px] font-semibold uppercase leading-[1.55] tracking-[0.2em] text-white/45 lg:col-span-1 lg:mt-10 lg:flex lg:flex-col">
            <span>Good</span>
            <span>People</span>
            <span>Great</span>
            <span>Rallies</span>
          </p>

          <div className="relative min-h-[200px] overflow-hidden lg:col-span-4 lg:min-h-[220px]">
            <img
              src="/pricing-hero.jpg"
              alt="Pickleball on court"
              className="h-full w-full object-cover"
            />
            <p className="absolute bottom-3 right-3 max-w-[10ch] text-right text-[9px] font-semibold uppercase leading-snug tracking-[0.16em] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.85)]">
              A space for every kind of game
            </p>
          </div>

          <div className="grid items-stretch gap-4 md:grid-cols-3 lg:col-span-8">
            {planCopy.map((plan) => {
              const displayPrice = String(
                savedPlans[plan.plan]?.price ?? PLAN_META[plan.plan].price,
              );
              return (
                <article
                  key={plan.title}
                  className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141413]"
                >
                  <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
                    <img
                      src={plan.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 text-[11px] font-bold tracking-[0.22em] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                      {plan.n}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <h3 className="min-h-[2.6em] text-[15px] font-bold uppercase leading-tight tracking-[0.08em] text-white">
                      {plan.title}
                    </h3>
                    <p className="mt-1.5 min-h-[2.6em] text-[13px] leading-snug text-white/60">
                      {plan.body}
                    </p>
                    <p className="mt-4 text-white">
                      <span className="display text-[40px] leading-none">
                        <span className="align-top text-[22px]">₱</span>
                        {displayPrice}
                      </span>
                      <span className="ml-1 text-sm text-white/50">
                        {plan.unit}
                      </span>
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5">
                      {plan.points.map((point) => (
                        <li
                          key={point}
                          className="flex min-h-[2.5em] items-start gap-2.5 text-[13px] leading-snug text-white/80"
                        >
                          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-yellow text-black">
                            <Check size={10} strokeWidth={3.5} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      <BookingButton
                        plan={plan.plan}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-[11px] font-bold uppercase leading-none tracking-[0.14em] transition ${
                          plan.featured
                            ? "bg-yellow text-black hover:bg-white"
                            : "border border-white/25 text-white hover:border-yellow hover:text-yellow"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight size={13} />
                      </BookingButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex items-center gap-4">
              <p className="text-[11px] font-semibold uppercase leading-[1.6] tracking-[0.18em] text-white/55">
                More games
                <br />
                More people
                <br />
                A brighter
                <br />
                you
              </p>
              <span className="h-16 w-px bg-yellow" />
            </div>
            <div>
              <img
                src="/pricing-indoor.jpg"
                alt="Indoor pickleball courts at Pickle Era"
                className="w-full object-cover"
              />
              <p className="mt-3 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-white/50">
                Premium courts.
                <br />
                Real connections.
                <br />
                All here.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid grid-cols-2 divide-x divide-y divide-white/10 border border-white/10 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {amenities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-5"
              >
                <Icon
                  size={22}
                  strokeWidth={1.6}
                  className="shrink-0 text-white"
                />
                <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-white">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
