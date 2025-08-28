import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request) {
  try {
    const { userId, imageUrl } = await request.json();
    if (!userId || !imageUrl) {
      return Response.json({ error: "userId and imageUrl are required" }, { status: 400 });
    }
    const updated = await db.update(user).set({ image: imageUrl }).where(eq(user.id, userId)).returning();
    if (!updated.length) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({ message: "Profile photo updated", user: updated[0] });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    const updated = await db.update(user).set({ image: null }).where(eq(user.id, userId)).returning();
    if (!updated.length) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({ message: "Profile photo removed" });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}


