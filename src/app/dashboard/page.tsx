import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await sessionUserId();
  if (!userId) redirect("/login?from_url=/dashboard");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) redirect("/login?from_url=/dashboard");

  const workflows = await db.workflow.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }],
  });

  return <DashboardApp user={user} initialWorkflows={workflows} />;
}
