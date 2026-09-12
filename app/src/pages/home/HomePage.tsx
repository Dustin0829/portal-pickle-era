import { BookCta } from "@/components/marketing/BookCta";
import { FAQ } from "./FAQ";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "./Hero";
import { Location } from "./Location";
import { Navbar } from "@/components/marketing/Navbar";
import { Pillars } from "./Pillars";
import { Pricing } from "./Pricing";
import { Space } from "./Space";
import { Vibe } from "./Vibe";
import { Waitlist } from "./Waitlist";

export function HomePage() {
  return (
    <div className="min-h-svh bg-black">
      <Navbar />
      <div>
        <Hero />
        <Pricing />
        <BookCta />
        <Vibe />
        <Space />
        <Pillars />
        <Location />
        <FAQ />
        <Waitlist />
      </div>
      <Footer />
    </div>
  );
}
