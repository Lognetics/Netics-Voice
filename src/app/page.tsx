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
import {
  CallJourney,
  PlatformArchitecture,
} from "@/features/marketing/how-it-works-flow";

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <LandingNav />
      <Hero />
      <Features />
      <CallJourney />
      <Industries />
      <HowItWorks />
      <PlatformArchitecture />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
