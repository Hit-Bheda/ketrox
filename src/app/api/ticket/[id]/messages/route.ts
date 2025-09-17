import { db } from "@/db";
import { ticketMessage, messageAttachment } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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
    
    // Get attachments for all messages
    const messageIds = messages.map(m => m.id);
    const attachments = messageIds.length > 0 
      ? await db.select().from(messageAttachment).where(inArray(messageAttachment.messageId, messageIds))
      : [];
    
    // Group attachments by message ID
    const attachmentsByMessage: Record<string, typeof attachments> = {};
    for (const attachment of attachments) {
      if (!attachmentsByMessage[attachment.messageId]) {
        attachmentsByMessage[attachment.messageId] = [];
      }
      attachmentsByMessage[attachment.messageId].push(attachment);
    }
    
    // Add attachments to messages
    const messagesWithAttachments = messages.map(message => ({
      ...message,
      messageAttachments: attachmentsByMessage[message.id] || []
    }));
    
    return Response.json({ messages: messagesWithAttachments });
  } catch (err) {
    console.error("GET /ticket/[id]/messages error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}