import { Activity, Aperture, Cpu, Satellite, Star } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Trusted by 5,000+ teams worldwide" — the G2 rating pill and the
 * wordmark-style client logos (mixing Playfair Display / DM Serif Display
 * accents and icon-led marks, measured from the reference).
 *
 * Session 47 (D164): the live wraps EACH wordmark carrier as a framer
 * motion element with initial `opacity: 0` — an OPACITY-ONLY fade (no
 * transform), revealed per-element on scroll with a ~50ms stagger and
 * ~400ms duration (measured with the frame sampler, probe H: starts
 * 490→890ms). The carriers below are Reveal elements in the same mode
 * (`y={null}`), the motion div being the classed carrier itself — the
 * live's exact structure. The CONTAINER stays static (the S8 F1-EXTRA
 * container record still true — only the per-wordmark carriers animate).
 */
const CARRIER =
  "text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100";

export function LogoCloud() {
  return (
    <section className="relative py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-10" y={20} duration={600}>
          <p className="text-sm text-white/50 tracking-widest uppercase font-body mb-3">
            Trusted by 5,000+ teams worldwide
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/20">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-white/60 ml-1.5">4.9/5 on G2</span>
          </div>
        </Reveal>

        {/* The live's wordmark CLOUD CONTAINER is not a motion element
            (its settled style is null — Session 8 F1-EXTRA, re-verified
            S47); the carriers inside it are (D164). */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-x-10 md:gap-y-8">
          {/* Zphlix — serif wordmark. The live's three serif wordmarks carry
              INLINE font-family styles (Session 7 F3): Zphlix/Melpyx
              "Playfair Display", Thrune "DM Serif Display" — measured on
              the live's DOM (the spans carry no font class at all). */}
          <Reveal className={CARRIER} y={null} duration={400} delay={50}>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>Zphlix</span>
            </div>
          </Reveal>
          {/* KVORAT — stacked monogram */}
          <Reveal className={CARRIER} y={null} duration={400} delay={100}>
            <div className="flex flex-col items-center leading-none gap-[3px]">
              <span className="font-heading font-black text-3xl tracking-tight leading-none">KV</span>
              <span className="font-body font-light text-[9px] tracking-[0.35em] uppercase">KVORAT</span>
            </div>
          </Reveal>
          {/* Thrune — aperture + serif (the live's DM Serif Display cut;
              its italic class renders the browser's SYNTHESIZED OBLIQUE
              over the regular file — the live's css2 URL ships no ital
              axis, so the clone loads the regular cut only and lets the
              italic synthesize identically; Session 51) */}
          <Reveal className={CARRIER} y={null} duration={400} delay={150}>
            <div className="flex items-center gap-2">
              <Aperture className="w-5 h-5" strokeWidth={1} />
              <span className="text-lg italic tracking-wide" style={{ fontFamily: '"DM Serif Display", serif' }}>Thrune</span>
            </div>
          </Reveal>
          {/* BRANTOX — bordered spaced caps */}
          <Reveal className={CARRIER} y={null} duration={400} delay={200}>
            <div className="border border-white/20 rounded-sm p-3 flex items-center justify-center">
              <span className="font-heading font-bold text-xs tracking-[0.45em] mr-[-0.45em]">BRANTOX</span>
            </div>
          </Reveal>
          {/* Melpyx — activity + serif (Playfair Display, the live's inline style) */}
          <Reveal className={CARRIER} y={null} duration={400} delay={250}>
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6" strokeWidth={1.2} />
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Melpyx</span>
            </div>
          </Reveal>
          {/* QUIXTAL — satellite */}
          <Reveal className={CARRIER} y={null} duration={400} delay={300}>
            <div className="flex flex-col items-center gap-1">
              <Satellite className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-heading font-semibold text-[11px] tracking-[0.4em]">QUIXTAL</span>
            </div>
          </Reveal>
          {/* DROLE — cpu */}
          <Reveal className={CARRIER} y={null} duration={400} delay={350}>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span className="font-heading font-black text-xl tracking-[0.15em]">DROLE</span>
            </div>
          </Reveal>
          {/* Gasparyan — image logo (the SVG bytes are identical to the
              live's; its alt is the live's verbatim "Logo" — Session 7 F5).
              loading="lazy" (Session 12 F2): the live's SPA ships this img
              EAGER with no preload link — but React Float auto-preloads
              eager imgs rendered in the SSR shell, and the Next.js router's
              RSC prefetch injects that head link into every navbar-bearing
              route (the logo Link to /), where the image never renders: a
              console "preloaded but not used" warning + a wasted fetch on
              six routes. lazy suppresses the Float emission; the below-fold
              cloud's visible behavior is unchanged (4KB local SVG).
              Session 47 (D164): the live's 9th motion carrier — the
              image carrier fades in last (measured start 890ms). */}
          <Reveal className={CARRIER} y={null} duration={400} delay={400}>
            <img
              src="/media/gasparyan-logo.svg"
              alt="Logo"
              loading="lazy"
              className="h-6 w-auto brightness-0 invert opacity-60 hover:opacity-90 transition-opacity duration-500"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
