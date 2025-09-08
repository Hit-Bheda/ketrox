import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    // Use Better Auth's resetPassword method
    const result = await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 400 }
      );
    }

    console.log("👉 Password reset successfully using Better Auth");

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
