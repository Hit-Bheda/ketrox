import { db } from "@/db";
import { ticketMessage } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return Response.json({ error: "ticket id required" }, { status: 400 });
    const messages = await db.select().from(ticketMessage).where(eq(ticketMessage.ticketId, id));
    return Response.json({ messages });
  } catch (err) {
    console.error("GET /ticket/[id]/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


