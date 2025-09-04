
import { db } from "@/db";
import {  tenants,  menu } from "@/db/schema";
import { menuSchema } from "@/schemas";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = menuSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { item_logo, item_name, category, description, price, prepTime, dietary, tenantId, isAvailable } = parsed.data;


  const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.length === 0) {
    return Response.json({ error: "Invalid tenantId: tenant not found" }, { status: 400 });
  }
  try {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const inserted = await db.insert(menu).values({
      id,
      item_logo: Array.isArray(item_logo) ? item_logo : [],
       item_name: item_name,
      category,

      description,
      price: price !== undefined ? price.toString() : "",
      prepTime: prepTime !== undefined ? prepTime.toString() : "",
      dietary: Array.isArray(dietary) ? dietary : [],
      tenantId: tenantId,
      isAvailable: isAvailable ?? true
    }).returning();
    // console.log("Inserted menu item:", inserted[0]);
    return Response.json({ message: "Menu item created successfully", menu: inserted[0] });
  } catch (err) {
    console.error("Error creating menu item:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  let tenantId = "";
  // Try to get tenantId from query string first
  try {
    const url = new URL(request.url);
    tenantId = url.searchParams.get("tenantId") || "";
  } catch {}

  // If not in query, try cookies
  if (!tenantId && typeof request !== "undefined" && "headers" in request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
    if (match) tenantId = decodeURIComponent(match[1]);
  }

  try {
    let menuItems;
    if (tenantId) {
      menuItems = await db.select().from(menu).where(eq(menu.tenantId, tenantId));
    } else {
      // If no tenantId, return all menu items (public access)
      menuItems = await db.select().from(menu);
    }
    return Response.json({ message: "Menu fetched successfully", menu: menuItems });
  } catch (err) {
    console.error("Error fetching menu items:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  const body = await request.json();
  const { id, isAvailable, ...rest } = body;

  // If only toggling availability
  if (id && typeof isAvailable === "boolean" && Object.keys(rest).length === 0) {
    // Only update isAvailable
    try {
      const updatedItem = await db.update(menu)
        .set({ isAvailable })
        .where(eq(menu.id, id))
        .returning();
      return Response.json({ message: "Availability updated", menu: updatedItem[0] });
    } catch (err) {
      console.error("Error updating availability:", err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // ...existing code for full update...
  const parsed = menuSchema.safeParse(rest);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { item_logo, item_name, category, description, price, prepTime, dietary, tenantId } = parsed.data;

  if (!id || !tenantId) {
    return Response.json({ error: "id and tenantId are required" }, { status: 400 });
  }

  const existingItem = await db.select().from(menu).where(eq(menu.id, id));
  if (!existingItem || existingItem.length === 0) {
    return Response.json({ error: "Menu item not found" }, { status: 404 });
  }

  try {
    const updatedItem = await db.update(menu)
      .set({
       item_logo: Array.isArray(item_logo) ? item_logo : existingItem[0].item_logo,
        item_name: item_name,
        category,
        description,
        price: price !== undefined ? price.toString() : existingItem[0].price,
        prepTime: prepTime !== undefined ? prepTime.toString() : existingItem[0].prepTime,
        dietary: Array.isArray(dietary) ? dietary : [],
        isAvailable: isAvailable ?? existingItem[0].isAvailable
      })
      .where(eq(menu.id, id))
      .returning();

    return Response.json({ message: "Menu item updated successfully", menu: updatedItem[0] });
  } catch (err) {
    console.error("Error updating menu item:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: "Menu item id is required" }, { status: 400 });
  }

  try {
    const deleted = await db.delete(menu).where(eq(menu.id, id)).returning();
    if (!deleted.length) {
      return Response.json({ error: "Menu item not found" }, { status: 404 });
    }
    return Response.json({ message: "Menu item deleted successfully", menu: deleted[0] });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}