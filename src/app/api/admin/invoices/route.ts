import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, order, table } from "@/db/schema";
import { invoiceSchema } from "@/schemas";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !["admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);

    // Generate sequential invoice number
    let nextInvoiceNumber = 1;
    const lastInvoice = await db.select({ invoiceNumber: invoice.invoiceNumber })
      .from(invoice)
      .where(eq(invoice.tenantId, session.user.tenant_id || validatedData.tenant_id!))
      .orderBy(desc(invoice.createdAt))
      .limit(1);
    if (lastInvoice.length > 0) {
      const lastInvoiceNum = lastInvoice[0].invoiceNumber;
      const match = lastInvoiceNum.match(/INV-(\d+)/);
      if (match) {
        nextInvoiceNumber = parseInt(match[1]) + 1;
      }
    }
    
    const invoiceNumber = `INV-${nextInvoiceNumber.toString().padStart(3, '0')}`;

    // Handle order-based vs form-based invoice creation
    let orderData = null;
    if (validatedData.order_id) {
      // Get order details for order-based invoices
      const orderDetails = await db.select()
        .from(order)
        .where(eq(order.id, validatedData.order_id))
        .limit(1);

      if (orderDetails.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      orderData = orderDetails[0];
    }

    // Extract table number from table_number field (which might be table ID)
    let finalTableNumber = validatedData.table_number;
    
    // If table_number looks like a UUID (table ID), fetch the actual table number
    if (validatedData.table_number && validatedData.table_number.length > 10) {
      try {
        const tableDetails = await db.select()
          .from(table)
          .where(eq(table.id, validatedData.table_number))
          .limit(1);
        
        if (tableDetails.length > 0) {
          finalTableNumber = tableDetails[0].number;
        }
      } catch (error) {
        // If fetching table fails, keep the original table_number
        console.error(error,"Could not fetch table details, using provided table_number");
      }
    }

    // Create invoice
    const newInvoice = await db.insert(invoice).values({
      id: nanoid(),
      invoiceNumber,
      orderId: validatedData.order_id || null,
      tenantId: session.user.tenant_id || validatedData.tenant_id!,
      adminId: session.user.id,
      customerName: validatedData.customer_name,
      customerPhone: validatedData.customer_phone,
      tableNumber: finalTableNumber,
      items: validatedData.items,
      quantities: validatedData.quantities,
      prices: validatedData.prices,
      subtotal: validatedData.subtotal,
      totalAmount: validatedData.total_amount,
      paymentMethod: validatedData.payment_method,
      paymentStatus: validatedData.payment_status,
      notes: validatedData.notes || null,
    }).returning({
      invoiceNumber: invoice.invoiceNumber 
    })

    // Update order status to paid (only if order_id exists)
    if (validatedData.order_id && orderData) {
      await db.update(order)
        .set({ 
          paymentStatus: "paid",
          status: "delivered",
          updatedAt: new Date() 
        })
        .where(eq(order.id, validatedData.order_id));

      // Update table status to available using order's tableId
      console.log("Updating table status for order-based invoice, tableId:", orderData.tableId);
      const tableUpdateResult = await db.update(table)
        .set({ available: true, updatedAt: new Date() })
        .where(eq(table.id, orderData.tableId));
      console.log("Table update result:", tableUpdateResult);
    } else {
      // If no order_id, find table by number and update
      console.log("Updating table status for form-based invoice, table_number:", validatedData.table_number);
      
      // First find the table by number
      const tableToUpdate = await db.select()
        .from(table)
        .where(eq(table.number, validatedData.table_number!))
        .limit(1);
      
      if (tableToUpdate.length > 0) {
        console.log("Found table to update:", tableToUpdate[0].id);
        const tableUpdateResult = await db.update(table)
          .set({ available: true, updatedAt: new Date() })
          .where(eq(table.id, tableToUpdate[0].id));
        console.log("Table update result:", tableUpdateResult);
      } else {
        console.error("Table not found with number:", validatedData.table_number);
      }
    }

    return NextResponse.json({
      message: "Invoice generated successfully",
      invoice: newInvoice[0]
    }, { status: 201 });

  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
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
    const tenantId = session.user.tenant_id;
    const status = searchParams.get("status");
    const payment_status = searchParams.get("payment_status");
    const tenant_id = searchParams.get("tenant_id");

    const whereConditions = [];

    if (status) whereConditions.push(eq(invoice.paymentStatus, status as "pending" | "paid" | "failed"));
    if (payment_status) whereConditions.push(eq(invoice.paymentStatus, payment_status as "pending" | "paid" | "failed"));
    if (tenant_id) whereConditions.push(eq(invoice.tenantId, tenant_id));
    else if (tenantId && typeof tenantId === 'string') whereConditions.push(eq(invoice.tenantId, tenantId));

    const invoices = await db.select()
      .from(invoice)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(invoice.createdAt);

    return NextResponse.json({ invoices }, { status: 200 });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !["admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invoice_id, customer_name, customer_phone, table_number, payment_status, payment_method, notes } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const updateData: { updatedAt: Date; customerName?: string; customerPhone?: string; tableNumber?: string; paymentStatus?: "pending" | "paid" | "failed" | "refunded"; paymentMethod?: "cash" | "card" | "upi" | "Bank Transfer"; notes?: string | null } = { updatedAt: new Date() };
    if (customer_name) updateData.customerName = customer_name;
    if(customer_phone) updateData.customerPhone = customer_phone;
    if (table_number) updateData.tableNumber = table_number;
    if (payment_status) updateData.paymentStatus = payment_status as "pending" | "paid" | "failed" | "refunded";
    if (payment_method) updateData.paymentMethod = payment_method as "cash" | "card" | "upi" | "Bank Transfer";
    if (notes !== undefined) updateData.notes = notes;

    const updatedInvoice = await db.update(invoice)
      .set(updateData)
      .where(eq(invoice.id, invoice_id))
      .returning();

    if (updatedInvoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice[0]
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !["admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoice_id } = await request.json();

    if (!invoice_id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const deletedInvoice = await db.delete(invoice)
      .where(eq(invoice.id, invoice_id))
      .returning();

    if (deletedInvoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
      invoice: deletedInvoice[0]
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
