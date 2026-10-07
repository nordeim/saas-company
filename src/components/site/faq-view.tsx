"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FAQ_ITEMS } from "@/lib/faq-content";

/**
 * FAQ — the reference's accordion (border/rounded-xl rows, violet ring when
 * open, chevron that rotates) over the same py-28/pt-40 section frame.
 * Client view for /faq (the page itself is a server component so it can
 * export the reference's `FAQ | SAAS Company` title).
 */
export function FaqView() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main>
        <section className="relative py-28 pt-40">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs tracking-widest uppercase text-violet font-body mb-4 block">
                FAQ
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Questions? We&apos;ve Got Answers
              </h2>
              <p className="text-white/40 font-body text-lg">
                Everything you need to know about getting started with NovaAI.
              </p>
            </div>

            <div className="space-y-3" data-orientation="vertical">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={item.q}
                    data-state={isOpen ? "open" : "closed"}
                    className={`border rounded-xl bg-white/[0.02] px-6 transition-colors ${
                      isOpen ? "border-violet/40" : "border-white/15"
                    }`}
                  >
                    <h3 className="flex">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-trigger-${i}`}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className={`flex flex-1 items-center justify-between transition-all hover:underline text-left font-heading text-base font-medium text-white hover:text-white/90 py-5 [&[aria-expanded=true]>svg]:text-violet [&[aria-expanded=true]>svg]:rotate-180`}
                      >
                        {item.q}
                        <ChevronDown className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-200" />
                      </button>
                    </h3>
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      hidden={!isOpen}
                      className="overflow-hidden text-sm"
                    >
                      <p className="pb-5 text-white/60 font-body leading-relaxed">{item.a}</p>
                    </div>
                  </div>
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
