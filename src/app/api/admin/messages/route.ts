import { db } from "@/db";
import { ticket, ticketMessage, tenants, messageAttachment, notification, user } from "@/db/schema";
import { eq, inArray, InferInsertModel } from "drizzle-orm";
import { ticketCreateSchema, ticketReplySchema, ticketUpdateSchema } from "@/schemas";

export async function GET(request: Request) {
  try {
    let tenantId = "";
    if (typeof request !== "undefined" && "headers" in request) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
      if (match) tenantId = decodeURIComponent(match[1]);
    }
    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tickets = await db.select().from(ticket).where(eq(ticket.tenantId, tenantId));
    if (tickets.length === 0) {
      return Response.json({ tickets, messages: {} });
    }

    const ticketIds = tickets.map((t) => t.id);
    const msgs = await db
      .select()
      .from(ticketMessage)
      .where(inArray(ticketMessage.ticketId, ticketIds));

    const lastByTicket: Record<string, { content: string; createdAt?: Date; senderRole?: string }> = {};
    for (const msg of msgs) {
      const existing = lastByTicket[msg.ticketId];
      if (!existing || (existing.createdAt || 0) < (msg.createdAt || 0)) {
        lastByTicket[msg.ticketId] = {
          content: msg.content,
          createdAt: msg.createdAt || undefined,
          senderRole: msg.senderRole || undefined,
        };
      }
    }

    const enriched = tickets.map((t) => ({
      ...t,
      lastMessage: lastByTicket[t.id]?.content || "",
      lastMessageAt: lastByTicket[t.id]?.createdAt ? new Date(lastByTicket[t.id]!.createdAt!).toISOString() : null,
      lastMessageSenderRole: lastByTicket[t.id]?.senderRole || null,
    }));

    return Response.json({ tickets: enriched, messages: {} });
  } catch (err) {
    console.error("GET /admin/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ticketCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    let tenantId = parsed.data.tenantId || "";
    if (!tenantId && typeof request !== "undefined" && "headers" in request) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
      if (match) tenantId = decodeURIComponent(match[1]);
    }
    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenantExists = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenantExists || tenantExists.length === 0) {
      return Response.json({ error: "Invalid tenantId" }, { status: 400 });
    }

    const now = new Date();

    const id = crypto.randomUUID();
    const created = await db.insert(ticket).values({
      id,
      tenantId,
      createdById: null,
      subject: parsed.data.subject,
      status: "open",
      priority: parsed.data.priority,
      createdAt: now,    // ✅ explicitly set
      updatedAt: now,
    }).returning();

    const msgId = crypto.randomUUID();
    await db.insert(ticketMessage).values({
      id: msgId,
      ticketId: id,
      senderId: null,
      senderRole: "admin",
      content: parsed.data.message,
      createdAt: now,    // ✅ explicitly set
      updatedAt: now,
    });

    // Create chat notifications for all super-admin users
    try {
      const superAdmins = await db.select().from(user).where(eq(user.role, "super-admin"));
      if (superAdmins && superAdmins.length > 0) {
        const notifTitle = `New ticket: ${parsed.data.subject}`;
        const notifMessage = parsed.data.message;
        type NotificationInsert = InferInsertModel<typeof notification>;
        const notifRows: NotificationInsert[] = superAdmins.map((sa) => ({
          id: crypto.randomUUID(),
          tenantId,
          userId: sa.id,
          type: "chat",
          title: notifTitle,
          message: notifMessage,
          ticketMessageId: msgId,
          metadata: { ticketId: id, priority: parsed.data.priority },
          read: false,
        }));
        await db.insert(notification).values(notifRows);
      }
    } catch (e) {
      console.error("POST /admin/messages notification insert failed", e);
      // do not fail the request because of notification errors
    }

    return Response.json({ ticket: created[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /admin/messages error", err);
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
    console.error("PUT /admin/messages error", err);
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
      senderRole: "admin",
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

    // Notify all super-admin users about the admin reply
    try {
      // Resolve tenantId via the ticket
      const tRows = await db.select().from(ticket).where(eq(ticket.id, parsed.data.ticketId));
      const t = tRows?.[0];
      const tenantIdForNotif = t?.tenantId;
      if (!tenantIdForNotif) {
        console.warn("PATCH /admin/messages could not resolve tenantId for notification; skipping insert");
      } else {
        const superAdmins = await db.select().from(user).where(eq(user.role, "super-admin"));
        if (superAdmins && superAdmins.length > 0) {
          const notifTitle = "New message from Admin";
          const notifMessage = (parsed.data.content && parsed.data.content.trim().length > 0)
            ? parsed.data.content
            : "📎 File attachment";
          type NotificationInsert = InferInsertModel<typeof notification>;
          const notifRows: NotificationInsert[] = superAdmins.map((sa) => ({
            id: crypto.randomUUID(),
            tenantId: tenantIdForNotif,
            userId: sa.id,
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
      console.error("PATCH /admin/messages notification insert failed", e);
      // do not fail the request because of notification errors
    }

    return Response.json({ message: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error("PATCH /admin/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


