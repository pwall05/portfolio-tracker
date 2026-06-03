import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "portfolio_session";

const PUBLIC_PATH_PREFIXES = ["/_next", "/api/auth", "/icons"];

const PUBLIC_PATHS = new Set([
  "/favicon.ico",
  "/login",
  "/manifest.webmanifest",
]);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isAuthConfigured() {
  return Boolean(process.env.APP_PASSWORD);
}

async function createSessionToken() {
  const password = process.env.APP_PASSWORD || "";
  const secret = process.env.APP_SESSION_SECRET || password;
  const data = new TextEncoder().encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidSessionToken(token?: string) {
  if (!token || !isAuthConfigured()) {
    return false;
  }

  return token === (await createSessionToken());
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthConfigured()) {
    // No password configured → auth disabled (works in dev and production).
    // Set APP_PASSWORD (and optionally APP_SESSION_SECRET) to enable protection.
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await isValidSessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*", "/manifest.webmanifest"],
};
