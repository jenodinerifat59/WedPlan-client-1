
import { NextRequest, NextResponse } from "next/server";

const dashboardRoutes: Record<string, string> = {
  admin: "/admin",
  vendor: "/vendor",
  customer: "/customer",
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requiredRole = Object.keys(dashboardRoutes).find(
    (role) => {
      const route = dashboardRoutes[role];

      return (
        pathname === route ||
        pathname.startsWith(`${route}/`)
      );
    }
  );

  if (!requiredRole) {
    return NextResponse.next();
  }

  // Verify the actual Better Auth session
  const sessionResponse = await fetch(
    new URL("/api/auth/get-session", request.url),
    {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    }
  );

  if (!sessionResponse.ok) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const session = await sessionResponse.json();
  const user = session?.user;

  // Not logged in
  if (!user) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  // Blocked account
  if (user.isBlocked) {
    return NextResponse.redirect(
      new URL("/login?error=blocked", request.url)
    );
  }

  const userRole = user.role;

  // Wrong dashboard access
  if (userRole !== requiredRole) {
    const correctDashboard = dashboardRoutes[userRole];

    return NextResponse.redirect(
      new URL(correctDashboard || "/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/customer/:path*",
    "/booking/:path*",
    "/bookings/:path*",
  ],
};
