/**
 * The "NovaAI Dashboard" browser-chrome mockup — the reference's skeleton:
 * traffic-light dots, gradient header bars, four avatar tiles, a 12-bar
 * analytics chart, and a side list — over a blurred primary/accent glow
 * with a soft reflection underneath.
 *
 * Session 10 loop parity (docs/remediation-plan-session10.md F1/F2): the
 * live's mockup is NOT static — its framer loops (inline writes per frame,
 * invisible to the Session-4 CSS-property census) pulse the ambient glow
 * (scale 1→1.15→1 + opacity .3→.5→.3, 4s), the red chrome dot (scale
 * 1→1.2→1, 2s), the four side-list dots (same, delay i*0.1), and the
 * under-glow (y 0→−12→0 + opacity .3→.5→.3, 3s) — reproduced here as the
 * measured CSS keyframes (animate-mockup-*; the D10 animate-scroll-dot
 * pattern). The list dots keep their SOLID bg-primary/80 fill (the loops
 * are transform/opacity only — never re-add the skeleton-wave shimmer
 * whose unlayered CSS overran the purple). The under-glow is a SIBLING of
 * the card on the live (child of this wrapper — unclipped) and renders
 * UNCENTERED: its framer transform replaces v3's --tw-translate-x, so the
 * -translate-x-1/2 class is inert in effect — translate-none reproduces
 * the rendered geometry (left edge at the wrapper's center). The bar
 * heights stay the measured D20 snapshot (the live randomizes per load).
 */
import { Reveal } from "@/components/site/reveal";

const BAR_HEIGHTS = [42, 64, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95];

export function DashboardPreview() {
  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* The live's mockup container is a motion element (y=60 /
            800ms — measured pre-reveal style translateY(60px)). */}
        <Reveal className="relative w-full max-w-4xl mx-auto" y={60} duration={800}>
          <div className="relative rounded-2xl md:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-1 shadow-2xl shadow-black/50 aspect-square md:aspect-[16/9] overflow-hidden group">
            {/* Ambient brand glow — the live pulses it (scale + opacity, 4s) */}
            <div className="absolute -inset-32 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 blur-3xl pointer-events-none animate-mockup-ambient" />

            <div className="relative rounded-2xl bg-gradient-to-br from-black/80 via-black/90 to-black/95 overflow-hidden h-full flex flex-col border border-white/5">
              {/* Browser chrome — the red dot pulses on the live (2s) */}
              <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-4 border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-mockup-dot" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-4 text-xs text-white/40 font-body tracking-wide">
                  NovaAI Dashboard
                </span>
              </div>

              {/* Skeleton body */}
              <div className="p-3 md:p-6 flex-1 flex flex-col gap-3 md:gap-5 overflow-hidden">
                {/* Header bars */}
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <div className="col-span-2 h-7 md:h-10 rounded-lg bg-gradient-to-r from-primary/40 via-primary/25 to-accent/35 border border-white/5" />
                  <div className="h-7 md:h-10 rounded-lg bg-gradient-to-br from-accent/50 to-primary/35 border border-white/5" />
                </div>

                {/* Avatar tiles */}
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="relative h-10 md:h-20 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/10 flex flex-col items-center justify-center gap-1 md:gap-2 overflow-hidden"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-accent/60" />
                      <div className="w-[65%] h-1.5 rounded-full bg-white/30" />
                    </div>
                  ))}
                </div>

                {/* Analytics chart + side list */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 flex-1 min-h-0">
                  <div className="col-span-2 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/10 p-2 md:p-5 flex flex-col">
                    <div className="flex gap-1 md:gap-1.5 items-end flex-1">
                      {BAR_HEIGHTS.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary to-accent opacity-80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/10 p-2 md:p-4 flex flex-col justify-between">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full bg-primary/80 animate-mockup-dot"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                        <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-white/25 to-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Under-glow reflection — a SIBLING of the card on the live (child
              of this wrapper, unclipped), pulsing y+opacity at 3s. The live's
              framer transform kills its -translate-x-1/2 (left edge renders
              at the wrapper's center, past the card's right edge) — the
              translate-none pin reproduces that rendered geometry. */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 translate-none w-2/3 h-28 bg-gradient-to-t from-primary/20 via-accent/10 to-transparent blur-3xl rounded-full pointer-events-none animate-mockup-glow" />
        </Reveal>
      </div>
    </section>
  );
}
