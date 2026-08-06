import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

/**
 * Cuma cek keberadaan cookie session (optimistic check) - validasi
 * signature/kedaluwarsa yang sesungguhnya tetap terjadi di backend lewat
 * JwtAuthGuard setiap kali Server Component fetch data (lib/api.ts redirect
 * ke /login kalau dapat 401).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api");
  const hasSession = request.cookies.has("session");

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
