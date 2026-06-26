import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Default-deny gate: every route requires an authenticated session EXCEPT the
// paths listed here. New pages/APIs are locked down automatically — only expose
// something publicly by deliberately adding it to PUBLIC_PATHS.
const PUBLIC_PATHS = new Set<string>([
  "/", // landing (logged out) / home dashboard (logged in)
]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Authenticated, or an explicitly public route — allow through.
  if (req.auth || PUBLIC_PATHS.has(pathname)) {
    return;
  }

  // Unauthenticated request to a protected route.
  // APIs get a 401; pages are redirected to the landing page.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/", req.nextUrl));
});

export const config = {
  // Run on every route except NextAuth's own endpoints and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
