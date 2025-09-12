import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { table } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Use the proper Next.js types for route context
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params promise
    const params = await context.params;
    const tableId = params.id;
    
    const tableData = await db
      .select()
      .from(table)
      .where(eq(table.id, tableId))
      .limit(1);

    if (tableData.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ table: tableData[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching table:", error);
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params promise
    const params = await context.params;
    const body = await request.json();
    const { available } = body;
    const tableId = params.id;

    if (typeof available !== "boolean") {
      return NextResponse.json(
        { error: "Available status is required" },
        { status: 400 }
      );
    }

    const updatedTable = await db
      .update(table)
      .set({
        available,
        updatedAt: new Date(),
      })
      .where(eq(table.id, tableId))
      .returning();

    if (updatedTable.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Table status updated successfully",
        table: updatedTable[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating table status:", error);
    return NextResponse.json(
      { error: "Failed to update table status" },
      { status: 500 }
    );
  }
}