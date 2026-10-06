/** FAQ content — questions and answers captured verbatim from the reference. */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is my data secure with NovaAI?",
    a: "Absolutely. We're SOC 2 Type II certified with end-to-end encryption, and we offer on-premise deployment for enterprise clients. Your data never leaves your control.",
  },
  {
    q: "What integrations do you support?",
    a: "NovaAI connects with 200+ tools including Salesforce, HubSpot, Slack, Google Workspace, PostgreSQL, MongoDB, and more. Our open API also allows custom integrations.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel anytime with no penalties or hidden fees. If you're on an annual plan, we'll prorate your remaining balance.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams are up and running in under 15 minutes. Connect your data sources, and our AI will auto-configure initial workflows based on your toolset.",
  },
  {
    q: "Do I need technical skills to use NovaAI?",
    a: "Not at all. Our visual workflow builder is designed for non-technical users. That said, developers love our API and SDK for advanced customization.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We'll notify you when you're approaching your limit and offer easy upgrade options. We never cut off your service without warning.",
  },
];
