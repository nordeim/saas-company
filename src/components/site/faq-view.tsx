"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FAQ_ITEMS } from "@/lib/faq-content";

/**
 * FAQ — the reference's accordion (border/rounded-xl rows, violet ring when
 * open, chevron that rotates) over the same py-28/pt-40 section frame.
 * Client view for /faq (the page itself is a server component so it can
 * export the reference's `FAQ | SAAS Company` title).
 *
 * Session 4 parity audit: the live uses the Radix/shadcn pattern — the
 * panel carries data-state + `data-[state=open]:animate-accordion-down` /
 * `data-[state=closed]:animate-accordion-up` (0.2s ease-out height
 * keyframes against --radix-accordion-content-height), and CLOSED panels
 * are UNMOUNTED (absent from the DOM — Radix unmounts closed content,
 * which is why the live's collapsed answers never appear in its HTML).
 */
export function FaqView() {
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState<number | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function toggle(i: number) {
    if (open === i) {
      // Keep the panel mounted with data-state=closed so the accordion-up
      // animation runs, then unmount it like Radix does.
      setClosing(i);
      setOpen(null);
      timers.current.push(
        setTimeout(() => setClosing((c) => (c === i ? null : c)), 220)
      );
    } else {
      setOpen(i);
      setClosing(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main>
        <section className="relative py-28 pt-40">
          <div className="max-w-3xl mx-auto px-6">
            {/* The live's heading block is a motion element (y=20 /
                600ms — its settled inline carries the framer state). */}
            <Reveal className="text-center mb-16" y={20} duration={600}>
              <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
                FAQ
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Questions? We&apos;ve Got Answers
              </h2>
              <p className="text-white/40 font-body text-lg">
                Everything you need to know about getting started with NovaAI.
              </p>
            </Reveal>

            <div className="space-y-3" data-orientation="vertical">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = open === i;
                const mounted = isOpen || closing === i;
                return (
                  /* The live wraps each item in an UNCLASSED motion div
                     (y=15, delay i*80ms, 400ms — measured). */
                  <Reveal key={item.q} y={15} delay={i * 80} duration={400}>
                  <div
                    data-state={isOpen ? "open" : "closed"}
                    className="border border-white/15 rounded-xl bg-white/[0.02] px-6 data-[state=open]:border-violet/40 transition-colors"
                  >
                    <h3 className="flex">
                      <button
                        type="button"
                        data-state={isOpen ? "open" : "closed"}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-trigger-${i}`}
                        onClick={() => toggle(i)}
                        className="flex flex-1 items-center justify-between transition-all hover:underline [&[data-state=open]>svg]:rotate-180 text-left font-heading text-base font-medium text-white hover:text-white/90 py-5 [&[data-state=open]>svg]:text-violet"
                      >
                        {item.q}
                        {/* The live's chevron color: text-muted-foreground → rgb(163,163,163)
              (its --muted-foreground: 0 0% 64%) — not white/50. Session 8 F6. */}
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </button>
                    </h3>
                    {mounted && (
                      <div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        data-state={isOpen ? "open" : "closed"}
                        ref={(el) => {
                          // Radix sets this var to the content height — the
                          // keyframes animate against it.
                          if (el) {
                            el.style.setProperty(
                              "--radix-accordion-content-height",
                              `${el.scrollHeight}px`
                            );
                          }
                        }}
                        className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                      >
                        <p className="pb-5 text-white/60 font-body leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
