import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { JsonLd } from "@/components/site/json-ld";
import { softwareStructuredData } from "@/lib/seo";
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
      {/* Session 30 R1 (D115): the landing's superset node — the S29
          @graph split: the layout now mounts the sitewide WebSite +
          Organization pair (the live's redeployed every-route pattern),
          and the landing adds the SoftwareApplication with the
          PLANS-derived offers on top (the superset the live does not
          ship; the publisher link resolves through the shared @id). */}
      <JsonLd data={softwareStructuredData()} />
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
