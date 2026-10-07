import { Star } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Loved by Teams Everywhere" — the reference's horizontal drag-scroll
 * strip of testimonial cards with edge fades (no scrollbar).
 */
const TESTIMONIALS = [
  {
    quote: "Cut our pipeline errors by 94%",
    copy: "NovaAI replaced 6 different tools and 20 hours of weekly manual work. Our engineering team finally focuses on building, not babysitting scripts.",
    initials: "SC",
    name: "Sarah Chen",
  },
  {
    quote: "ROI within the first week",
    copy: "We were skeptical about another AI tool, but the results spoke for themselves. 3x faster data processing and zero config needed from our side.",
    initials: "MR",
    name: "Marcus Rivera",
  },
  {
    quote: "The automation platform we always needed",
    copy: "Our team of 8 now operates with the efficiency of 30. NovaAI's workflow builder is intuitive, and the AI suggestions are genuinely useful.",
    initials: "EW",
    name: "Emily Watkins",
  },
  {
    quote: "Enterprise-grade, startup-fast",
    copy: "Security was our top concern. NovaAI's SOC 2 compliance and on-prem option made it an easy sell to our board. The speed was a bonus.",
    initials: "DP",
    name: "David Park",
  },
];

export function Testimonials() {
  const cards = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section id="testimonials" className="relative py-16 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <Reveal className="text-center" y={20}>
          <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-normal mb-4">
            Loved by Teams Everywhere
          </h2>
          <p className="text-white/50 max-w-xl mx-auto font-body">
            Hear from the teams building the future with NovaAI.
          </p>
        </Reveal>
      </div>

      <Reveal className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab px-6 pb-4">
          {cards.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex-shrink-0 w-[280px] md:w-[380px] p-6 rounded-2xl border border-violet/40 bg-transparent hover:border-violet/60 transition-colors duration-500"
            >
              <div className="flex items-center gap-1 mb-4" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="font-heading text-base font-semibold text-white mb-3">
                {`"${t.quote}"`}
              </p>
              <p className="text-sm text-white/50 font-body leading-relaxed mb-6">{t.copy}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
