import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Optimistic gate only: bounces visitors with no session cookie before any
 * rendering happens. It cannot tell a valid cookie from a forged or expired
 * one — requireUser() on every page, action and route handler is the real
 * check.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
