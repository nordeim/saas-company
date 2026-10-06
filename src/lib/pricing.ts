/**
 * Pricing domain — the plans, billing periods, and discount math behind the
 * pricing section's Monthly/Annual toggle. Pure and unit-tested.
 */

export type BillingPeriod = "monthly" | "annual";

export interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  tagline: string;
  /** Monthly price in USD; null = "Custom". */
  monthlyPrice: number | null;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For individuals exploring AI automation.",
    monthlyPrice: 0,
    features: [
      "Up to 3 workflows",
      "500 AI operations/mo",
      "Basic analytics",
      "Community support",
      "1 team member",
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing teams that need powerful automation.",
    monthlyPrice: 39,
    features: [
      "Unlimited workflows",
      "25,000 AI operations/mo",
      "Advanced analytics & reports",
      "Priority support",
      "Up to 25 team members",
      "Custom integrations",
      "API access",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with custom requirements.",
    monthlyPrice: null,
    features: [
      "Everything in Pro",
      "Unlimited operations",
      "Dedicated account manager",
      "Custom SLA",
      "SSO & SAML",
      "Audit logs",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
  },
];

/** The reference's advertised annual discount, applied per month. */
export const ANNUAL_DISCOUNT = 0.2;

/** Effective per-month price for a plan under a billing period. */
export function monthlyPriceFor(plan: Plan, period: BillingPeriod): number | null {
  if (plan.monthlyPrice === null) return null;
  if (plan.monthlyPrice === 0) return 0;
  return period === "annual"
    ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT))
    : plan.monthlyPrice;
}

/** What the checkout line says under each period. */
export function priceCaptionFor(plan: Plan, period: BillingPeriod): string {
  if (plan.monthlyPrice === null) return "Custom";
  if (plan.monthlyPrice === 0) return "$0";
  const price = monthlyPriceFor(plan, period);
  return `$${price}`;
}

export function periodCaption(period: BillingPeriod): string {
  return period === "annual" ? "/month, billed annually" : "/month";
}
