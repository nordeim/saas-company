/**
 * Idempotent demo seed: wipes the domain tables and reinserts the canonical
 * demo workspace. Run with `npm run db:seed` (tsx).
 *
 * Demo account: demo@novaai.app / Demo1234!
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // Wipe domain tables (idempotent reseed, children first).
  await prisma.workflow.deleteMany({});
  await prisma.demoRequest.deleteMany({});
  await prisma.subscriber.deleteMany({});
  await prisma.user.deleteMany({});

  const demo = await prisma.user.create({
    data: {
      email: "demo@novaai.app",
      name: "Demo User",
      passwordHash: hashPassword("Demo1234!"),
    },
  });

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const workflows: Array<{
    name: string;
    description: string;
    category: string;
    status: string;
    runs: number;
    successRate: number;
    timeSavedHours: number;
    createdAt: Date;
  }> = [
    {
      name: "Lead enrichment pipeline",
      description: "Enrich inbound leads from the CRM, dedupe against the warehouse, and score with AI before routing to sales.",
      category: "Sales",
      status: "active",
      runs: 1284,
      successRate: 99.7,
      timeSavedHours: 41.5,
      createdAt: new Date(now - 46 * day),
    },
    {
      name: "Weekly investor update digest",
      description: "Compile metrics from Stripe, the product DB, and the roadmap into a Monday-morning digest email.",
      category: "Ops",
      status: "active",
      runs: 148,
      successRate: 100,
      timeSavedHours: 12,
      createdAt: new Date(now - 38 * day),
    },
    {
      name: "Anomaly scan on billing events",
      description: "Detect unusual charge patterns and page the on-call engineer with an AI-summarized root-cause brief.",
      category: "Engineering",
      status: "active",
      runs: 3422,
      successRate: 99.2,
      timeSavedHours: 26,
      createdAt: new Date(now - 31 * day),
    },
    {
      name: "Content repurposing engine",
      description: "Turn each published blog post into a newsletter section, three social variants, and a short video script.",
      category: "Marketing",
      status: "active",
      runs: 96,
      successRate: 98.4,
      timeSavedHours: 33,
      createdAt: new Date(now - 22 * day),
    },
    {
      name: "Churn-risk early warning",
      description: "Blend usage, support sentiment, and billing signals into a weekly churn-risk list with suggested plays.",
      category: "Ops",
      status: "paused",
      runs: 63,
      successRate: 97.8,
      timeSavedHours: 18.5,
      createdAt: new Date(now - 15 * day),
    },
    {
      name: "Onboarding email orchestration",
      description: "Behavior-triggered onboarding emails with AI-personalized copy per signup cohort.",
      category: "Marketing",
      status: "active",
      runs: 2107,
      successRate: 99.9,
      timeSavedHours: 29,
      createdAt: new Date(now - 9 * day),
    },
  ];

  for (const w of workflows) {
    await prisma.workflow.create({ data: { ...w, userId: demo.id } });
  }

  for (const email of ["reader1@example.com", "reader2@example.com"]) {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  console.log(
    `Seeded: 1 user (demo@novaai.app / Demo1234!), ${workflows.length} workflows, 2 subscribers.`,
  );
  // Deterministic marker so the smoke suite can assert the seed ran.
  console.log(`seed-checksum:${createHash("sha256").update(String(workflows.length)).digest("hex").slice(0, 8)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
