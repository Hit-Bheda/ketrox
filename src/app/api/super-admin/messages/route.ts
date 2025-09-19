import { db } from "@/db";
import { ticket, ticketMessage, tenants, messageAttachment, notification, user } from "@/db/schema";
import { eq, inArray, InferInsertModel } from "drizzle-orm";
import { ticketReplySchema, ticketUpdateSchema } from "@/schemas";

export async function GET() {
  try {
    // Fetch all tickets for all tenants (super admin scope)
    const tickets = await db.select().from(ticket);

    if (tickets.length === 0) {
      return Response.json({ tickets: [] });
    }

    // Map tenant ids and build a lookup for tenant names
    const tenantIds = Array.from(new Set(tickets.map((t) => t.tenantId).filter(Boolean))) as string[];
    let tenantLookup: Record<string, string> = {};
    if (tenantIds.length > 0) {
      const tenantRows = await db.select().from(tenants).where(inArray(tenants.id, tenantIds));
      tenantLookup = tenantRows.reduce((acc, row) => {
        acc[row.id] = row.name;
        return acc;
      }, {} as Record<string, string>);
    }

    // Fetch last messages per ticket
    const ticketIds = tickets.map((t) => t.id);
    const allMessages = await db
      .select()
      .from(ticketMessage)
      .where(inArray(ticketMessage.ticketId, ticketIds));

    const lastByTicket: Record<string, { content: string; createdAt?: Date; senderRole?: string }> = {};
    for (const msg of allMessages) {
      const existing = lastByTicket[msg.ticketId];
      if (!existing || (existing.createdAt || 0) < (msg.createdAt || 0)) {
        lastByTicket[msg.ticketId] = {
          content: msg.content,
          createdAt: msg.createdAt || undefined,
          senderRole: msg.senderRole || undefined,
        };
      }
    }

    const enriched = tickets.map((t) => {
      const last = lastByTicket[t.id];
      const tenantName = (t.tenantId && tenantLookup[t.tenantId]) || "";
      return {
        ...t,
        tenantName,
        lastMessage: last?.content || "",
        lastMessageAt: last?.createdAt ? new Date(last.createdAt).toISOString() : null,
        lastMessageSenderRole: last?.senderRole || null,
      };
    });

    return Response.json({ tickets: enriched });
  } catch (err) {
    console.error("GET /super-admin/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = ticketUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { id, ...updates } = parsed.data;
    const updated = await db.update(ticket).set(updates).where(eq(ticket.id, id)).returning();
    return Response.json({ ticket: updated[0] });
  } catch (err) {
    console.error("PUT /super-admin/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = ticketReplySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const inserted = await db.insert(ticketMessage).values({
      id,
      ticketId: parsed.data.ticketId,
      senderId: null,
      senderRole: "super-admin",
      content: parsed.data.content || "",
      attachments: parsed.data.attachments?.map(att => att.fileUrl) || null,
    }).returning();

    // Insert attachments if any
    if (parsed.data.attachments && parsed.data.attachments.length > 0) {
      const attachmentInserts = parsed.data.attachments.map(att => ({
        id: crypto.randomUUID(),
        messageId: id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
      }));
      await db.insert(messageAttachment).values(attachmentInserts);
    }

    // Notify tenant admins about the super-admin reply
    try {
      // Resolve tenant for the ticket
      const tRows = await db.select().from(ticket).where(eq(ticket.id, parsed.data.ticketId));
      const t = tRows?.[0];
      const tenantIdForNotif = t?.tenantId;
      if (!tenantIdForNotif) {
        console.warn("PATCH /super-admin/messages could not resolve tenantId for notification; skipping insert");
      } else {
        // All admin users for that tenant
        const admins = await db.select().from(user).where(eq(user.tenant_id, tenantIdForNotif));
        const tenantAdmins = admins.filter((u) => u.role === "admin");
        if (tenantAdmins.length > 0) {
          const notifTitle = "New message from Super Admin";
          const notifMessage = (parsed.data.content && parsed.data.content.trim().length > 0)
            ? parsed.data.content
            : "📎 File attachment";
          type NotificationInsert = InferInsertModel<typeof notification>;
          const notifRows: NotificationInsert[] = tenantAdmins.map((adm) => ({
            id: crypto.randomUUID(),
            tenantId: tenantIdForNotif,
            userId: adm.id,
            type: "chat",
            title: notifTitle,
            message: notifMessage,
            ticketMessageId: id,
            metadata: { ticketId: parsed.data.ticketId },
            read: false,
          }));
          await db.insert(notification).values(notifRows);
        }
      }
    } catch (e) {
      console.error("PATCH /super-admin/messages notification insert failed", e);
      // ignore notification errors
    }

    return Response.json({ message: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error("PATCH /super-admin/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


