// app/api/notifications/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { eq } from "drizzle-orm";

// ---------------- PATCH: Mark all notifications as read for a user ----------------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action === "mark_all_read") {
      const updated = await db
        .update(notification)
        .set({ read: true, updatedAt: new Date() })
        .where(eq(notification.userId, userId))
        .returning();

      return NextResponse.json({ 
        message: `${updated.length} notifications marked as read`,
        count: updated.length 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

// ---------------- DELETE: Clear all notifications for a user ----------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(notification)
      .where(eq(notification.userId, userId))
      .returning();

    return NextResponse.json({ 
      message: `${deleted.length} notifications cleared`,
      count: deleted.length 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to clear notifications" }, { status: 500 });
  }
}
