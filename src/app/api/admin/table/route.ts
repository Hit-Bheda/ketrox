import { db } from "@/db";
import { table, tenants } from "@/db/schema";
import { tableSchema } from "@/schemas";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = tableSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { number, name, capacity, notes, tenantId } = parsed.data;
  try {

    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenant || tenant.length === 0) {
      return Response.json({ error: "Invalid tenantId: tenant not found" }, { status: 400 });
    }

    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const inserted = await db.insert(table).values({
      id,
      number,
      name,
      capacity: capacity.toString(),
      notes,
      tenantId
    }).returning();
    return Response.json({ message: "Table created successfully", table: inserted[0] });
  } catch (err) {
    console.error("Error creating table:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("id");

    if (tableId) {
      const result = await db
        .select()
        .from(table)
        .where(eq(table.id, tableId));

      if (!result || result.length === 0) {
        return Response.json({ error: "Table not found" }, { status: 404 });
      }

      return Response.json({ table: result[0] });
    }

    const result = await db.select().from(table);

    return Response.json({ tables: result });
  } catch (err) {
    console.error("Error fetching table(s):", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return Response.json({ error: "Table ID is required" }, { status: 400 });
    }


    const parsed = tableSchema.partial().safeParse(data);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

  
    const existing = await db.select().from(table).where(eq(table.id, id));
    if (!existing || existing.length === 0) {
      return Response.json({ error: "Table not found" }, { status: 404 });
    }

    const updated = await db
      .update(table)
      .set({
        ...parsed.data,
      })
      .where(eq(table.id, id))
      .returning();

    return Response.json({ message: "Table updated successfully", table: updated[0] });
  } catch (err) {
    console.error("Error updating table:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}