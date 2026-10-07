import { Database, SlidersHorizontal, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Up and Running in Minutes" — the three numbered steps connected by a
 * horizontal gradient hairline on md+.
 */
const STEPS = [
  {
    n: "01",
    icon: Database,
    title: "Connect Your Data",
    copy: "Link your existing tools in one click — CRMs, databases, spreadsheets, and 200+ integrations.",
  },
  {
    n: "02",
    icon: SlidersHorizontal,
    title: "Set Your Parameters",
    copy: "Define your goals and let NovaAI configure the optimal automation strategy for your workflow.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Get Automated Insights",
    copy: "Watch real-time dashboards populate while AI-driven pipelines handle the heavy lifting.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-20" y={20} duration={600}>
          <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-normal mb-4">
            Up and Running in Minutes
          </h2>
          <p className="text-white/50 max-w-xl mx-auto font-body">
            Three simple steps to transform your entire workflow.
          </p>
        </Reveal>

        <div className="relative">
          <div className="hidden md:block absolute top-24 left-[16.66%] right-[16.66%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-violet/30 to-transparent" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((step, i) => (
              <Reveal
                key={step.n}
                className="text-center relative group"
                y={40}
                delay={i * 200}
                duration={600}
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet/20 to-electric-blue/10 border border-violet/50 group-hover:border-violet/80 transition-colors" />
                  <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-violet" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-violet to-electric-blue flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{step.n}</span>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 font-body leading-relaxed max-w-xs mx-auto">
                  {step.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
