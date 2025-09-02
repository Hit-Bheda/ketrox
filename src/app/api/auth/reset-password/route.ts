import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { user as userTable, account as accountTable } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "email and newPassword required" }, { status: 400 });
    }

    const users = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, email));
    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date();

    const updated = await db
      .update(accountTable)
      .set({ password: hashedPassword, updatedAt: now })
      .where(and(eq(accountTable.providerId, "email"), eq(accountTable.userId, userId)));

    if (updated.count === 0) {
      return NextResponse.json({ error: "Email credential not found for user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
