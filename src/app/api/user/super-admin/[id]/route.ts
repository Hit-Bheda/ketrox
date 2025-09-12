import { NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();


    const { name, email, phone } = body;

    const updatedUser = await db
      .update(userTable)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        updatedAt: new Date()
      })
      .where(eq(userTable.id, id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
