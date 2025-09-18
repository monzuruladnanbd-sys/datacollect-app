import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [/^\/dashboard/, /^\/entry/, /^\/review/, /^\/approve/];
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "wb_session";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some((r) => r.test(pathname));

  if (!needsAuth) return NextResponse.next();

  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = Boolean(sessionCookie);

  if (!isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:js|css|png|jpg|svg|ico)|favicon.ico|api).*)"],
};
