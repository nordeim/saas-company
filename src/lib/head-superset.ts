/**
 * The documented-superset registry — Session 33 R1 (the session_64 S33
 * candidate: "a documented-superset registry the battery reads, so a NEW
 * clone-only tag surfaces as drift rather than blending into the known
 * set").
 *
 * The drift battery's head-tag SET column (S32's seventh surface) answers
 * "which meta/link tags EXIST on each side." Live-only tags are DRIFT by
 * definition (the reference wins). Clone-only tags are the superset — but
 * an UNKNOWN clone-only tag is indistinguishable from a regression until
 * someone adjudicates it: through Session 32 the adjudicated set lived
 * only in the battery's research/ scratch (gitignored, rebuilt every
 * session), so a NEW clone-only tag — a dependency upgrade's telemetry,
 * a route's accidental metadata — would have blended silently into the
 * "superset" reading.
 *
 * This file is the versioned source of truth. The battery READS it (the
 * tsx eval in research/drift-battery-s33.mjs) and flags every clone-only
 * tag NOT listed here as DRIFT; the unit pins (src/lib/seo.test.ts) hold
 * the registry to its documented shape. Adding an entry is an explicit,
 * reviewed act — the adjudication lives beside the tag it explains.
 *
 * The vocabulary matches the battery's collector exactly: `name:X` for
 * meta[name], `prop:X` for meta[property], bare `canonical` / `rel:X`
 * for links.
 */

export interface HeadSupersetEntry {
  /** The head-tag key in the battery collector's spelling ("name:robots",
   * "prop:og:image:width", "rel:whatever"). */
  key: string;
  /** "all" — every route carries it — or the explicit route list. */
  routes: "all" | string[];
  /** Why the clone ships it where the live does not (the adjudication). */
  reason: string;
  /** The session that adjudicated it (the PAD ledger reference). */
  session: number;
}

export const HEAD_SUPERSET: HeadSupersetEntry[] = [
  {
    key: "name:next-size-adjust",
    routes: "all",
    reason:
      "Turbopack next/font telemetry meta (empty content, zero visual/SEO impact); the documented adjustFontFallback:false opt-out was tested INERT under this repo's Turbopack build — a webpack-pipeline lever Next 16.4's Turbopack ignores",
    session: 32,
  },
  {
    key: "name:robots",
    routes: ["/does-not-exist-404"],
    reason:
      "Next's automatic not-found noindex; the clone's real HTTP 404 vs the live's 200-SPA-404 is the honest superset (the live ships no robots meta because it never returns a real 404 status)",
    session: 32,
  },
  {
    key: "prop:og:image:width",
    routes: "all",
    reason:
      "The working og-image's real width (1200); the live's own og:image URL is DEAD (404, 29 bytes) — its head never describes a working image, so the clone's self-hosted replacement carries its true dimensions",
    session: 32,
  },
  {
    key: "prop:og:image:height",
    routes: "all",
    reason:
      "The working og-image's real height (630); the dead-og-image adjudication above (the D30 working-asset family)",
    session: 32,
  },
  {
    key: "prop:og:image:type",
    routes: "all",
    reason:
      "The working og-image's real MIME (image/png); the dead-og-image adjudication above (the D30 working-asset family)",
    session: 32,
  },
  {
    key: "rel:apple-touch-icon",
    routes: ["/", "/faq", "/privacy", "/terms", "/accessibility", "/refund-policy", "/does-not-exist-404"],
    reason:
      "The Session-7 F8 working-asset superset (the live's own apple-touch-icon URL is dead media.base44.com storage — the D30 family), emitted app-wide through the layout's metadata.icons; the live injects the tag ONLY through its login bundle (on /login both sides carry it — parity there), so the seven non-login routes are the registered superset surface",
    session: 34,
  },
];

/** True when `key` is an adjudicated clone-only tag on `route`
 * ("all"-scoped entries cover every route; explicit lists carry the
 * battery collector's route spellings, e.g. "/does-not-exist-404"). */
export function isDocumentedSuperset(key: string, route: string): boolean {
  return HEAD_SUPERSET.some(
    (e) => e.key === key && (e.routes === "all" || e.routes.includes(route)),
  );
}

/**
 * Session 33 R1 (F4) — the DOM-attribute layer's registry, the eighth
 * battery column's adjudicated set. Where the head layer's law makes
 * live-only ALWAYS drift (the reference wins — the clone must match),
 * the DOM-attribute layer adjudicates BOTH directions: the live ships
 * its own library instrumentation (react-hot-toast's dormant container,
 * Radix's collection markers) the clone must not simulate, and the
 * clone ships its own functional markers (the navbar theme-swap hooks)
 * the live achieves by its own mechanism. The `side` field carries the
 * direction; the pins (head-superset.test.ts) hold the shape.
 */
export interface DomAttrSupersetEntry {
  /** The data-* attribute name, verbatim ("data-nav-theme"). */
  attr: string;
  /** Which side ships it. */
  side: "clone" | "live";
  /** "all" or the explicit route list (the battery's spellings). */
  routes: "all" | string[];
  /** Why it is adjudicated (the in-vivo probe evidence, one sentence). */
  reason: string;
  /** The session that adjudicated it (the PAD ledger reference). */
  session: number;
}

export const DOM_ATTR_SUPERSET: DomAttrSupersetEntry[] = [
  {
    attr: "data-nav-theme",
    side: "clone",
    routes: ["/"],
    reason:
      "The section-aware navbar's theme-swap hooks (gotcha 14: the chrome swaps to black variants over [data-nav-theme=light] sections — #features the sole carrier); invisible data-* with zero rendering/AT impact, the swap behavior itself pinned GREEN by navbar-behavior.spec.ts",
    session: 33,
  },
  {
    attr: "data-rht-toaster",
    side: "live",
    routes: ["/login"],
    reason:
      "react-hot-toast's global container, mounted DORMANT in the live's login bundle — measured in vivo: 0 children at rest, and the failed-login error surfaces through the inline [role=alert] banner exactly like the clone; simulating a dead fixed z-9999 container would be byte-parity for an instrumentation attribute",
    session: 33,
  },
  {
    attr: "data-radix-collection-item",
    side: "live",
    routes: ["/faq"],
    reason:
      "Radix Accordion's internal collection-registration marker on the live's FAQ triggers; the ARIA contract is at parity on both sides (aria-expanded/aria-controls/role=region/aria-labelledby/data-state + byte-identical trigger classes — measured), and stamping a custom accordion with a Radix registry marker it does not belong to would be simulated instrumentation",
    session: 33,
  },
];

/** True when `attr` on `side` is an adjudicated DOM-attribute delta on
 * `route`. The side must match exactly — a clone-only entry never
 * excuses the live side, and vice versa. */
export function isDocumentedDomSuperset(
  attr: string,
  side: "clone" | "live",
  route: string,
): boolean {
  return DOM_ATTR_SUPERSET.some(
    (e) =>
      e.attr === attr &&
      e.side === side &&
      (e.routes === "all" || e.routes.includes(route)),
  );
}

/**
 * Session 34 R1 — the VALUE-level layer's registry, the battery's ninth
 * column. The S33 SET column answers "which attributes EXIST on each
 * side"; the VALUE twin answers "do the SHARED attributes carry the same
 * values" — with the multiset (values AND carrier counts) as the DEFAULT
 * comparison, because a value or a count drift on a shared attribute is
 * invisible to the SET column by construction. A registered rule here
 * downgrades ONE (attr, route) pair's comparison:
 *
 *   - "values-only": the distinct VALUE SET stays measured (a
 *     "closed"-vs-"collapsed" spelling drift still surfaces) while the
 *     carrier-COUNT delta is the adjudicated library-structure difference
 *     (the S32 "never simulate a library's internals" law — the D125
 *     wrapper adjudication one layer deeper).
 *   - "id-refs" (Session 35): the attribute's values are ID REFERENCES
 *     whose spellings are per-library namespaces (the live's radix-:rN:
 *     hydration ids vs the clone's stable semantic stems — the D125
 *     record). The battery compares the FUNCTIONAL contract instead:
 *     every reference must RESOLVE to a mounted element in its own
 *     document at rest (a dangling aria-controls is a real a11y defect;
 *     a resolved one in a different namespace is not). The namespace
 *     spelling itself is never compared.
 */
export interface DomValueRuleEntry {
  /** The shared attribute name, verbatim ("data-state", "aria-controls"). */
  attr: string;
  /** "all" or the explicit route list (the battery's spellings). */
  routes: "all" | string[];
  /** Which side carries the EXTRA carriers (the structure being scoped). */
  side: "clone" | "live";
  /** The comparison downgrade: "values-only" or "id-refs". */
  rule: "values-only" | "id-refs";
  /** Why the downgrade is adjudicated (the probe evidence). */
  reason: string;
  /** The session that adjudicated it (the PAD ledger reference). */
  session: number;
}

export const DOM_VALUE_RULES: DomValueRuleEntry[] = [
  {
    attr: "data-state",
    routes: ["/faq"],
    side: "live",
    rule: "values-only",
    reason:
      "Radix stamps data-state on every accordion node (Item + Trigger + Content — measured: the live carries ~3x the clone's carriers, all \"closed\" at rest); the clone's custom accordion carries it on trigger + panel only. The VALUES are the functional contract (measured at parity at rest); the count delta is the D125 Radix-wrapper structure one layer deeper — never simulate library internals",
    session: 34,
  },
  {
    attr: "data-orientation",
    routes: ["/faq"],
    side: "live",
    rule: "values-only",
    reason:
      "Radix stamps data-orientation on the Root and every Item/Trigger/Content (measured: 4+ live carriers vs the clone's 1 container); the value (\"vertical\") is the contract, measured at parity on both sides",
    session: 34,
  },
  {
    attr: "aria-expanded",
    routes: ["/faq"],
    side: "clone",
    rule: "values-only",
    reason:
      "Every carrier measures \"false\" at rest on both sides (the values are the contract, at parity); the clone's one extra carrier is its burger — the live's burger carries no aria-expanded (gotcha 47) while the clone's announces menu state, the functional superset. The carrier-count delta is scoped; a \"false\"-vs-\"true\" spelling drift still surfaces",
    session: 35,
  },
  {
    attr: "aria-controls",
    routes: ["/faq"],
    side: "clone",
    rule: "id-refs",
    reason:
      "The values are per-library ID namespaces (the live's radix-:rN: hydration ids vs the clone's stable faq-panel-N stems — the D125 record) plus the clone's burger pointing at its mobile-menu (the gotcha-47 functional superset). The measured contract: every reference RESOLVES to a mounted element in its own document at rest — the live's Radix regions are mounted-hidden, and the clone's panels + mobile-menu are mounted-hidden since Session 35 (D132; the old unmount left every reference dangling). The battery compares resolution validity, never the namespace spelling",
    session: 35,
  },
  {
    attr: "aria-labelledby",
    routes: ["/faq"],
    side: "clone",
    rule: "id-refs",
    reason:
      "The aria-controls twin (the panels' region→trigger back-references): the live's radix-:rN: hydration ids vs the clone's stable faq-trigger-N stems — the same D125 id-namespace record, shared since Session 35 mounted the clone's panels at rest (D132). Every reference RESOLVES to a mounted element on both sides; the battery compares resolution validity, never the namespace spelling",
    session: 35,
  },
];

/** True when the (attr, route) pair's battery comparison is downgraded
 * (values-only: the distinct value set stays measured, the carrier-count
 * delta is the adjudicated structure; id-refs: the resolution contract
 * replaces the namespace-spelling comparison). */
export function isDocumentedDomValueRule(
  attr: string,
  route: string,
): boolean {
  return DOM_VALUE_RULES.some(
    (e) => e.attr === attr && (e.routes === "all" || e.routes.includes(route)),
  );
}
