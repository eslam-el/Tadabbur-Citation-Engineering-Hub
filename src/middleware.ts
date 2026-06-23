import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isActive } from "@/lib/permissions";

// نسخة Edge بلا Prisma — تفكّ التوكن فقط.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const authed = !!req.auth;
  const active = isActive(req.auth?.user);

  if (pathname === "/login") {
    return active ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (pathname === "/pending") {
    if (!authed) return NextResponse.redirect(new URL("/login", req.url));
    if (active) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (!authed) return NextResponse.redirect(new URL("/login", req.url));
  if (!active) return NextResponse.redirect(new URL("/pending", req.url));
  return NextResponse.next();
});

// استثناء api والأصول الثابتة — يُفرض على الصفحات فقط.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
