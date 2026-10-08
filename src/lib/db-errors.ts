import { Prisma } from "@prisma/client";

/**
 * Session 17 F2 — classification of Prisma's unique-constraint violation
 * (P2002) at the register route's create seam.
 *
 * The findUnique → create gap is a TOCTOU window: under truly-parallel
 * duplicate registrations the loser's `create` throws P2002, which —
 * unhandled — surfaced as a bare 500 with an empty body (the envelope
 * contract's worst violation: the client's `payload?.error?.message`
 * contract dead-ends into null). The catch converts it to the exact
 * sequential-duplicate contract (409 EMAIL_TAKEN); every other error
 * rethrows (the route must not swallow what it cannot classify).
 *
 * Pure module — importing it never instantiates a PrismaClient (only the
 * Prisma namespace's error class is referenced).
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
