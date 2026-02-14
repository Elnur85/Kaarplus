import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    // req.auth is the session object
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Protected routes pattern
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/sell") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/admin");

    const isAdminRoute = pathname.startsWith("/admin");

    // Auth routes (redirect to dashboard if already logged in)
    const isAuthRoute = pathname.startsWith("/login") ||
        pathname.startsWith("/register");

    if (isProtectedRoute && !isLoggedIn) {
        const callbackUrl = pathname;
        const loginUrl = new URL("/login", req.nextUrl);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && isLoggedIn) {
        const role = (req.auth?.user as any)?.role;
        if (role !== "ADMIN" && role !== "SUPPORT") {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
});

// Configure middleware matcher
export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images etc)
     */
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
