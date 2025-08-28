import { NextResponse } from "next/server";
import { orderSchema } from "@/schemas";
import { db } from "@/db";
import { menu, order, table, user } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Get last order to calculate sequence
    const lastOrder = await db
      .select()
      .from(order)
      .orderBy(desc(order.createdAt))
      .limit(1);

    let nextNumber = 1;
    if (lastOrder.length > 0 && lastOrder[0].orderNumber) {
      const lastNum = parseInt(lastOrder[0].orderNumber.replace("ORD-", ""), 10);
      nextNumber = lastNum + 1;
    }

    const orderNumber = `ORD-${String(nextNumber).padStart(3, "0")}`;

    const result = orderSchema.safeParse({
      ...body,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const insertedOrder = await db
      .insert(order)
      .values({
        id,
        tableId: body.table_id,
        tenantId: body.tenant_id,
        managerId: body.manager_id,
        customerName: body.customer_name,
        items: body.items,
        quantity: body.quantity,
        status: body.status,
        totalPrice: body.total_price,
        orderNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Mark the table as unavailable when an order is booked
    try {
      await db
        .update(table)
        .set({ available: false, maintenance: false, updatedAt: new Date() })
        .where(eq(table.id, body.table_id));
    } catch (e) {
      console.error("Failed to update table availability after booking order", e);
    }

    return NextResponse.json(
      { order: insertedOrder[0], message: "Order created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  let tenantId = "";
  let managerId = "";

  if (typeof request !== "undefined" && "headers" in request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
    if (match) tenantId = decodeURIComponent(match[1]);
  }

  const url = new URL(request.url);
  managerId = url.searchParams.get("managerId") || "";

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId is required for order fetch" },
      { status: 400 }
    );
  }

  try {
    let orders;

    if (managerId) {
      orders = await db
        .select({
          id: order.id,
          tableId: order.tableId,
          tenantId: order.tenantId,
          tableNumber: table.number,
          managerId: order.managerId,
          customerName: order.customerName,
          items: order.items,
          quantity: order.quantity,
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          managerName: user.name,
          orderNumber: order.orderNumber,
        })
        .from(order)
        .leftJoin(user, eq(order.managerId, user.id))
        .leftJoin(table, eq(order.tableId, table.id))
        .where(
          and(
            eq(order.tenantId, tenantId),
            eq(order.managerId, managerId)
          )
        );
    } else {
      orders = await db
        .select({
          id: order.id,
          tableId: order.tableId,
          tenantId: order.tenantId,
          managerId: order.managerId,
          tableNumber: table.number,
          customerName: order.customerName,
          items: order.items,
          quantity: order.quantity,
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          managerName: user.name,
          orderNumber: order.orderNumber,
        })
        .from(order)
        .leftJoin(user, eq(order.managerId, user.id))
        .leftJoin(table, eq(order.tableId, table.id))
        .where(eq(order.tenantId, tenantId));
    }

    const allItemIds = Array.from(new Set(orders.flatMap(order => order.items)));

    const menuItems = await db.select().from(menu).where(inArray(menu.id, allItemIds));

    const menuMap = Object.fromEntries(menuItems.map(item => [item.id, item.item_name]));

    const ordersWithItemNames = orders.map(order => ({
      ...order,
      itemNames: order.items.map(id => menuMap[id] || id)
    }));
    // console.log("API GET /api/manager/order", { tenantId, managerId });

    return NextResponse.json({
      message: "Orders fetched successfully",
      orders: ordersWithItemNames,
    });

  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const updatedOrder = await db
      .update(order)
      .set({
        ...updateFields,
        updatedAt: new Date(),
      })
      .where(eq(order.id, id))
      .returning();

    if (!updatedOrder.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder[0], message: "Order updated successfully" });
  } catch (err) {
    console.error("Order update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const deletedOrder = await db
      .delete(order)
      .where(eq(order.id, id))
      .returning();

    if (!deletedOrder.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Order delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}