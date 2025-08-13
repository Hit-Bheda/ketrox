// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // Fetch session data
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    // Handle unauthenticated users
    if (!session?.user) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const role = session.user.role;
    const user=session.user
    console.log("fsdfdd",user);
    
    console.log("Session data:", role);

    // Define role-based paths
    const rolePaths: Record<string, string> = {
      "super-admin": "/super-admin",
      "admin": "/admin",
      "manager": "/manager",
      "waiter": "/waiter",
    };

    // Get path for current role or default to unauthorized
    const rolePath = role && role in rolePaths 
      ? rolePaths[role] 
      : "/unauthorized";

    // Construct target path
    const targetPath = `/dashboard${rolePath}`;

    // Only redirect if user isn't already on the correct path
    if (!pathname.startsWith(targetPath)) {
      console.log(`Redirecting ${role} to:`, targetPath);
      return NextResponse.redirect(new URL(targetPath, request.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Continue processing if no redirect is needed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};