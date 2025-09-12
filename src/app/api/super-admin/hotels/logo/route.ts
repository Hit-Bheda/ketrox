import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
  try {
    const { hotelId } = await request.json();
    
    if (!hotelId) {
      return Response.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    // Update hotel to remove logo URL (set to empty string)
    const updated = await db
      .update(tenants)
      .set({ logo_url: "" })
      .where(eq(tenants.id, hotelId))
      .returning();

    if (!updated.length) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    return Response.json({ 
      message: "Logo removed successfully",
      hotel: updated[0]
    });

  } catch (error) {
    console.error("Logo removal error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
