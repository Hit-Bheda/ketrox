import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { accountPlainPassword, user as userTable, verification } from "@/db/schema";
import { eq } from "drizzle-orm";

const betterAuthResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("👉 Received body in reset-password API:", body);

    // Validate input for Better Auth format
    const validatedData = betterAuthResetSchema.parse(body);
    const { token, newPassword } = validatedData;
    console.log("👉 Validated token:", token);

    const existingNewFormat = await db
      .select({ id: verification.id })
      .from(verification)
      .where(eq(verification.identifier, `reset-password:${token}`));

    if (!existingNewFormat.length) {
      // Try to find old-format row where value == token
      const oldRow = await db
        .select({ id: verification.id, identifier: verification.identifier })
        .from(verification)
        .where(eq(verification.value, token));

      if (oldRow.length) {
        // identifier previously stored email
        const email = oldRow[0].identifier;
        const users = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.email, email));

        if (users.length) {
          // Update to Better Auth expected format
          await db
            .update(verification)
            .set({
              identifier: `reset-password:${token}`,
              value: users[0].id,
            })
            .where(eq(verification.id, oldRow[0].id));
        }
      }
    }
    const row = await db
    .select({ userId: verification.value })
    .from(verification)
    .where(eq(verification.identifier, `reset-password:${token}`))
    .limit(1);

    const userId = row.length ? row[0].userId : null;

    const result = await auth.api.resetPassword({
      body: { token, newPassword },
    });
    
    if (!result?.status) {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 400 });
    }
    
    // Update plain password table if we have userId
    if (userId) {
      await db
        .update(accountPlainPassword)
        .set({ plainPassword: newPassword })
        .where(eq(accountPlainPassword.userId, userId));
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}