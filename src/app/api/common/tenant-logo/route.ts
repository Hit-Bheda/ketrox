import { db } from "@/db";
import { tenants, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Forward cookies to auth session endpoint to identify current user
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionRes = await fetch(`${baseURL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      return Response.json({ error: "Unable to fetch session" }, { status: 401 });
    }

    const sessionData = (await sessionRes.json().catch(() => ({}))) as {
      data?: { user?: { id?: string; tenant_id?: string } };
      user?: { id?: string; tenant_id?: string };
    };

    const sessionUser = sessionData?.data?.user ?? sessionData?.user;
    const userId = sessionUser?.id || "";

    if (!userId) {
      return Response.json({ error: "No authenticated user" }, { status: 401 });
    }

    // Prefer tenant_id from session, else read from DB
    let tenantId = sessionUser?.tenant_id as string | undefined;

    if (!tenantId) {
      const dbUser = await db.select().from(user).where(eq(user.id, userId));
      tenantId = dbUser?.[0]?.tenant_id || undefined;
    }

    if (!tenantId) {
      return Response.json({ error: "Tenant not linked to user" }, { status: 404 });
    }

    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    const tenant = tenantRows?.[0];

    if (!tenant) {
      return Response.json({ error: "Tenant not found" }, { status: 404 });
    }

    return Response.json({ logoUrl: tenant.logo_url, tenantId });
  } catch (error) {
    console.error("Error fetching tenant logo:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


