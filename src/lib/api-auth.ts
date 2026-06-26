import { auth } from "@/lib/auth";

/**
 * Data-source-level auth guard for route handlers. `proxy.ts` is an optimistic
 * cookie check; this is the real check, run as close to the data as possible.
 *
 * Usage at the top of a route handler:
 *   const unauthorized = await requireSession();
 *   if (unauthorized) return unauthorized;
 *
 * Returns a 401 Response when there is no session, otherwise null.
 */
export async function requireSession(): Promise<Response | null> {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
