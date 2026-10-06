import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { DashboardPreview } from "@/components/sections/dashboard-preview";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { Problem } from "@/components/sections/problem";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";
import { CtaSection } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <LogoCloud />
        <Problem />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
