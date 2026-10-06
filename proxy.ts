import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => name === "authjs.session-token" || name === "__Secure-authjs.session-token" || name.startsWith("authjs.session-token.") || name.startsWith("__Secure-authjs.session-token."));
}

function safeDestination(request: NextRequest) {
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return destination.startsWith("/admin/") && !destination.startsWith("//") && request.nextUrl.pathname !== "/admin/login" ? destination : "/admin/dashboard";
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path !== "/admin" && !path.startsWith("/admin/")) return NextResponse.next();
  const bypass = (process.env.NODE_ENV === "development" && process.env.CMS_LOCAL_DEV_BYPASS === "true") || (process.env.NODE_ENV === "development" && process.env.CMS_TEMP_BYPASS === "true");
  const loggedIn = bypass || hasSessionCookie(request);
  if (path === "/admin/login") return loggedIn ? NextResponse.redirect(new URL(safeDestination(request), request.url)) : NextResponse.next();
  if (!loggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", safeDestination(request));
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
