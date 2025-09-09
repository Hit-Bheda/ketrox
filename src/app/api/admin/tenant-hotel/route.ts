import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // Get user session to find tenant_id
    const cookieHeader = request.headers.get("cookie") || "";
    
    // For now, we'll get the user's tenant_id from the session
    // You might need to adjust this based on your auth implementation
    let tenantId = "";
    const tenantMatch = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
    if (tenantMatch) {
      tenantId = decodeURIComponent(tenantMatch[1]);
    }

    if (!tenantId) {
      return Response.json({ error: "Tenant ID not found" }, { status: 400 });
    }

    // Fetch hotel data for this tenant
    const hotel = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!hotel || hotel.length === 0) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    return Response.json({
      message: "Hotel data fetched successfully",
      hotel: hotel[0],
    });
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
