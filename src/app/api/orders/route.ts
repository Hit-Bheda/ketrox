
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { order, table, user, menu } from "@/db/schema";
import { orderSchema } from "@/schemas";
import { eq, and, desc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Generate sequential order number
    const lastOrder = await db.select({ orderNumber: order.orderNumber })
      .from(order)
      .where(eq(order.tenantId, session.user.tenant_id || validatedData.tenant_id!))
      .orderBy(desc(order.createdAt))
      .limit(1);
    
    let nextNumber = 1;
    if (lastOrder.length > 0) {
      const lastOrderNum = lastOrder[0].orderNumber;
      const match = lastOrderNum.match(/ORD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    const orderNumber = `ORD-${nextNumber.toString().padStart(3, '0')}`;

    
    const subtotal = parseFloat(validatedData.subtotal);
    const tax = subtotal * 0.18; 
    const totalPrice = subtotal + tax;

    // Create order
    const newOrder = await db.insert(order).values({
      id: nanoid(),
      orderNumber,
      tableId: validatedData.table_id!,
      tenantId: session.user.tenant_id || validatedData.tenant_id!,
      managerId: session.user.id,
      customerName: validatedData.customer_name,
      customerPhone: validatedData.customer_phone,
      items: validatedData.items,
      quantity: validatedData.quantity,
      prices: validatedData.prices,
      status: validatedData.status,
      paymentStatus: validatedData.payment_status,
      subtotal: validatedData.subtotal,
      tax: tax.toString(),
      totalPrice: totalPrice.toString(),
    }).returning();

   
    await db.update(table)
      .set({ available: false, updatedAt: new Date() })
      .where(eq(table.id, validatedData.table_id!));

    return NextResponse.json({
      message: "Order created successfully",
      order: newOrder[0]
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const payment_status = searchParams.get("payment_status");
    const tenant_id = searchParams.get("tenant_id");
    const customer_name = searchParams.get("customer_name");
    const customer_phone = searchParams.get("customer_phone");
    const manager_id = searchParams.get("managerId");
    const table_id = searchParams.get("tableId");

    const whereConditions = [];
  
    // Always filter by tenant
    whereConditions.push(eq(order.tenantId, session.user.tenant_id || tenant_id || ""));
    
    // Role-based filtering
    if (session.user.role === "manager" && manager_id) {
      whereConditions.push(eq(order.managerId, manager_id));
    }
    
    if (status) whereConditions.push(eq(order.status, status as "pending" | "preparing" | "delivered" | "cancelled"));
    if (payment_status) whereConditions.push(eq(order.paymentStatus, payment_status as "unpaid" | "paid" | "refunded"));
    if (customer_name) whereConditions.push(eq(order.customerName, customer_name));
    if (customer_phone) whereConditions.push(eq(order.customerPhone, customer_phone));
    if (manager_id) whereConditions.push(eq(order.managerId, manager_id));
    if (table_id) whereConditions.push(eq(order.tableId, table_id));

    const orders = await db.select({
      id: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tenantId: order.tenantId,
      managerId: order.managerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      quantity: order.quantity,
      prices: order.prices,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      tableNumber: table.number,
      managerName: user.name,
    })
      .from(order)
      .leftJoin(table, eq(order.tableId, table.id))
      .leftJoin(user, eq(order.managerId, user.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(order.createdAt));

    // Get menu items for item names
    const allItemIds = Array.from(new Set(orders.flatMap(o => o.items)));
    let menuItems: { id: string; item_name: string }[] = [];
    
    if (allItemIds.length > 0) {
      menuItems = await db.select().from(menu).where(inArray(menu.id, allItemIds));
    }

    const menuMap = Object.fromEntries(menuItems.map(item => [item.id, item.item_name]));

    const ordersWithItemNames = orders.map(order => ({
      ...order,
      itemNames: order.items.map((id: string) => menuMap[id] || id)
    }));

    return NextResponse.json({ orders: ordersWithItemNames }, { status: 200 });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status: newStatus, payment_status, ...otherFields } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Check if order exists and get current order details
    const existingOrder = await db.select()
      .from(order)
      .where(eq(order.id, order_id))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control: Only order creator (manager) or admin can update
    const currentOrder = existingOrder[0];
    if (session.user.role === "manager" && currentOrder.managerId !== session.user.id) {
      return NextResponse.json({ error: "This order was booked by another manager and cannot be updated." }, { status: 403 });
    }

    const updateData: {
      updatedAt: Date;
      status?: "pending" | "preparing" | "delivered" | "cancelled";
      paymentStatus?: "unpaid" | "paid" | "refunded";
      paymentMethod?: "cash" | "card" | "upi" | "other";
      notes?: string;
      customerName?: string;
      customerPhone?: string;
      items?: string[];
      quantity?: string[];
      prices?: string[];
      subtotal?: string;
      tax?: string;
      totalPrice?: string;
    } = { updatedAt: new Date() };
    
    if (newStatus) {
      updateData.status = newStatus;
    }
    
    if (payment_status) {
      updateData.paymentStatus = payment_status;
    }

    // Handle full order update (from modal)
    if (otherFields.customer_name) updateData.customerName = otherFields.customer_name;
    if (otherFields.customer_phone) updateData.customerPhone = otherFields.customer_phone;
    if (otherFields.items) updateData.items = otherFields.items;
    if (otherFields.quantity) updateData.quantity = otherFields.quantity;
    if (otherFields.prices) updateData.prices = otherFields.prices;
    if (otherFields.subtotal) updateData.subtotal = otherFields.subtotal;
    if (otherFields.tax) updateData.tax = otherFields.tax;
    if (otherFields.total_price) updateData.totalPrice = otherFields.total_price;

    const updatedOrder = await db.update(order)
      .set(updateData)
      .where(eq(order.id, order_id))
      .returning();

    if (updatedOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order is cancelled or delivered, or payment is paid, make table available
    if (newStatus === "cancelled" || newStatus === "delivered" || payment_status === "paid") {
      await db.update(table)
        .set({ available: true, updatedAt: new Date() })
        .where(eq(table.id, updatedOrder[0].tableId));
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder[0]
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order_id } = body;
    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await db.select().from(order).where(eq(order.id, order_id)).limit(1);
    if (existingOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control: Only order creator (manager) or admin can delete
    const currentOrder = existingOrder[0];
    if (session.user.role === "manager" && currentOrder.managerId !== session.user.id) {
      return NextResponse.json({ error: "This order was booked by another manager and cannot be deleted." }, { status: 403 });
    }

    // Delete order
    await db.delete(order).where(eq(order.id, order_id));

    // Make table available again
    await db.update(table)
      .set({ available: true, updatedAt: new Date() })
      .where(eq(table.id, currentOrder.tableId));

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
