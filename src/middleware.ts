import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/login", "/signup"].includes(nextUrl.pathname);
  
  if (isApiAuthRoute) return null;

  if (isPublicRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // RBAC checks
  const role = (req.auth?.user as any)?.role;
  const adminRoutes = ["/agents", "/assign", "/products", "/performance"];
  
  if (adminRoutes.some(route => nextUrl.pathname.startsWith(route)) && role !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
