import { LandingNav } from "@/features/marketing/landing-nav";
import { Hero } from "@/features/marketing/hero";
import {
  Features,
  Industries,
  HowItWorks,
  Pricing,
  CTA,
  Footer,
} from "@/features/marketing/sections";

export default function LandingPage() {
  return (
    <main className="relative">
      <LandingNav />
      <Hero />
      <Features />
      <Industries />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
