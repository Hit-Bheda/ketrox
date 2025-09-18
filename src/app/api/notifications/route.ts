// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notification, order } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createNotificationSchema } from "@/schemas";


// ---------------- POST: create a new notification ----------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createNotificationSchema.parse(body);

    if (validated.orderId) {
      const existingOrder = await db
        .select()
        .from(order)
        .where(eq(order.id, validated.orderId));

      if (existingOrder.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    if (validated.invoiceId) {
      const existingInvoice = await db
        .select()
        .from(order)
        .where(eq(order.id, validated.invoiceId));
      if (existingInvoice.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
    }

    const id = crypto.randomUUID();

    const newNotification = await db
      .insert(notification)
      .values({
        id,
        ...validated,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ notification: newNotification[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// ---------------- GET: fetch notifications for a user ----------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const notifications = await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt));

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// ---------------- PATCH: mark notification as read ----------------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const updated = await db
      .update(notification)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notification.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ notification: updated[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// ---------------- DELETE: delete a notification ----------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("notificationId");

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(notification)
      .where(eq(notification.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification deleted", notification: deleted[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}


