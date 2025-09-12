import { db } from "@/db";
import { ticketMessage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return Response.json({ error: "ticket id required" }, { status: 400 });
    }
    
    const messages = await db.select().from(ticketMessage).where(eq(ticketMessage.ticketId, id));
    return Response.json({ messages });
  } catch (err) {
    console.error("GET /ticket/[id]/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}