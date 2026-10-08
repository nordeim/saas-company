import { redirect } from "next/navigation";
import { Suspense } from "react";
import { sessionUserId } from "@/lib/auth";
import { LoginCard } from "./login-card";

/**
 * The login route's server half (Session 14 F2). The card itself is the
 * byte-pinned reference component (login-card.tsx, unchanged); this page
 * adds the authenticated-navigation gate: a user who already holds a
 * session and asks for /login is sent to the workspace — the honest
 * contract every production auth system upholds (an authenticated user
 * never needs to re-authenticate). Pure superset (the live has no real
 * auth — D62/D74).
 *
 * The metadata stays in login/layout.tsx (this file renders the client
 * card; layout owns the head — the established pattern for this route).
 */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userId = await sessionUserId();
  if (userId) redirect("/dashboard");
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
