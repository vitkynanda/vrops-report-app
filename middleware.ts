import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (
    !request.cookies.get("token") &&
    request.nextUrl.pathname !== "/sign-in" &&
    request.nextUrl.pathname !== "/api/sign-in"
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
