/**
 * The "NovaAI Dashboard" browser-chrome mockup — the reference's skeleton:
 * traffic-light dots, gradient header bars, four avatar tiles, a 12-bar
 * analytics chart, and a side list — over a blurred primary/accent glow
 * with a soft reflection underneath.
 *
 * Session 4 parity audit: the live's mockup is completely STATIC (animation
 * census: zero running animations in the section) — the bars sit at fixed
 * percentages, the tiles at full opacity, and the side-list dots render
 * SOLID purple (bg-primary/80). The old clone ran a skeleton-wave shimmer
 * (which also overran the dot's purple — unlayered CSS beats layered
 * utilities) and a grow-in stagger the live doesn't have; both removed.
 * The bar heights are a measured snapshot of the live (which randomizes
 * them slightly per load, e.g. 45.93% vs 45%).
 */
const BAR_HEIGHTS = [42, 64, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95];

export function DashboardPreview() {
  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="relative rounded-2xl md:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-1 shadow-2xl shadow-black/50 aspect-square md:aspect-[16/9] overflow-hidden group">
            {/* Ambient brand glow */}
            <div className="absolute -inset-32 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 blur-3xl pointer-events-none" />

            <div className="relative rounded-2xl bg-gradient-to-br from-black/80 via-black/90 to-black/95 overflow-hidden h-full flex flex-col border border-white/5">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-4 border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
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
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary/80" />
                        <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-white/25 to-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Under-glow reflection */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-2/3 h-28 bg-gradient-to-t from-primary/20 via-accent/10 to-transparent blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
