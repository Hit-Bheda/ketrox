import { db } from "@/db";
import { NextResponse } from "next/server";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const existing = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, email));

    if (!existing.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // In a secure flow: create a resetToken & expiry in DB here
    // await db.insert(passwordResetToken).values(...)

    return NextResponse.json({ success: true, message: "User verified. Continue to reset password." });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
