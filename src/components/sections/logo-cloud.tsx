import { Activity, Aperture, Cpu, Satellite, Star } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/**
 * "Trusted by 5,000+ teams worldwide" — the G2 rating pill and the
 * wordmark-style client logos (mixing Playfair Display / DM Serif Display
 * accents and icon-led marks, measured from the reference).
 */
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

        {/* The live's wordmark cloud is NOT a motion element (its settled
            style is null — Session 8 F1-EXTRA): only the eyebrow block
            above animates. */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-x-10 md:gap-y-8">
          {/* Zphlix — serif wordmark. The live's three serif wordmarks carry
              INLINE font-family styles (Session 7 F3): Zphlix/Melpyx
              "Playfair Display", Thrune "DM Serif Display" — measured on
              the live's DOM (the spans carry no font class at all). */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>Zphlix</span>
            </div>
          </div>
          {/* KVORAT — stacked monogram */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex flex-col items-center leading-none gap-[3px]">
              <span className="font-heading font-black text-3xl tracking-tight leading-none">KV</span>
              <span className="font-body font-light text-[9px] tracking-[0.35em] uppercase">KVORAT</span>
            </div>
          </div>
          {/* Thrune — aperture + serif (the live's DM Serif Display cut,
              italic — its inline style measured on the live; the face is
              loaded via next/font with the italic variant included) */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex items-center gap-2">
              <Aperture className="w-5 h-5" strokeWidth={1} />
              <span className="text-lg italic tracking-wide" style={{ fontFamily: '"DM Serif Display", serif' }}>Thrune</span>
            </div>
          </div>
          {/* BRANTOX — bordered spaced caps */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="border border-white/20 rounded-sm p-3 flex items-center justify-center">
              <span className="font-heading font-bold text-xs tracking-[0.45em] mr-[-0.45em]">BRANTOX</span>
            </div>
          </div>
          {/* Melpyx — activity + serif (Playfair Display, the live's inline style) */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6" strokeWidth={1.2} />
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Melpyx</span>
            </div>
          </div>
          {/* QUIXTAL — satellite */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex flex-col items-center gap-1">
              <Satellite className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-heading font-semibold text-[11px] tracking-[0.4em]">QUIXTAL</span>
            </div>
          </div>
          {/* DROLE — cpu */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span className="font-heading font-black text-xl tracking-[0.15em]">DROLE</span>
            </div>
          </div>
          {/* Gasparyan — image logo (the SVG bytes are identical to the
              live's; its alt is the live's verbatim "Logo" — Session 7 F5).
              loading="lazy" (Session 12 F2): the live's SPA ships this img
              EAGER with no preload link — but React Float auto-preloads
              eager imgs rendered in the SSR shell, and the Next.js router's
              RSC prefetch injects that head link into every navbar-bearing
              route (the logo Link to /), where the image never renders: a
              console "preloaded but not used" warning + a wasted fetch on
              six routes. lazy suppresses the Float emission; the below-fold
              cloud's visible behavior is unchanged (4KB local SVG). */}
          <div className="text-white/60 hover:text-white/90 transition-all duration-500 cursor-default hover:scale-110 flex justify-center scale-[0.825] md:scale-100">
            <img
              src="/media/gasparyan-logo.svg"
              alt="Logo"
              loading="lazy"
              className="h-6 w-auto brightness-0 invert opacity-60 hover:opacity-90 transition-opacity duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
