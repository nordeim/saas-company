/**
 * Session 29 R1 (D113) — the JSON-LD script renderer (the App Router
 * pattern): mounts a schema.org structured-data graph into the page's
 * HTML. A `<script type="application/ld+json">` has no box, no fetch,
 * and no innerText — invisible to the word-parity battery, the
 * transfer budgets (no resource-timing entry), and the CLS budgets.
 *
 * Server component (renders into the static/prerendered HTML); the DATA
 * always comes from the pure builders in src/lib/seo.ts — never inline
 * literals (the content-as-code law).
 */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
