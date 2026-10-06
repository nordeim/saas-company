import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import type { LegalPage } from "@/lib/legal-content";

/**
 * Shared legal-page template — the reference's frame: navbar, pt-32/pb-20
 * main with a max-w-3xl column, H1 + "A legal disclaimer" caption, then
 * space-y-10 sections of white/70 body text.
 */
export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
          <p className="text-white/60 text-sm mb-16 font-body">{page.disclaimer}</p>
          <div className="space-y-10 text-white/70 font-body leading-relaxed">
            {page.sections.map((section, i) => (
              <section key={i}>
                {section.h2 && (
                  <h2 className="font-heading text-2xl font-semibold text-white mb-4">
                    {section.h2}
                  </h2>
                )}
                {section.paras.map((para, j) => (
                  <p key={j} className={j > 0 ? "mt-4" : undefined}>
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
