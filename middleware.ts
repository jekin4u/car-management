import { type NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/auth";

const publicRoutes = ["/"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await getSession();

  if (!session && !publicRoutes.includes(path))
    return NextResponse.redirect(new URL("/", request.url));

  if (path == "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
