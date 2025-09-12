import { db } from "@/db";
import { NextResponse } from "next/server";
import { user as userTable, verification } from "@/db/schema";
import { eq } from "drizzle-orm";
import { forgotPasswordSchema } from "@/schemas";
import { generateId } from "lucia";
import nodemailer from "nodemailer";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("👉 Received body in forgot-password API:", body);

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;
    console.log("👉 Validated email:", email);
    // Check if user exists
    const existingUser = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      })
      .from(userTable)
      .where(eq(userTable.email, email));

    if (!existingUser.length) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    const user = existingUser[0];

    // Generate reset token
    const resetToken = generateId(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await db.insert(verification).values({
      id: generateId(15),
      identifier: email,
      value: resetToken,
      expiresAt,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"KETROX" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
 <body style="font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #2e2a34; max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: #f59e0a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
    </div>

    <!-- Body -->
    <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${user.name},</p>
      <p style="font-size: 16px; margin-bottom: 20px;">
        We received a request to reset your password for your account. If you didn't make this request, you can safely ignore this email.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background: #f59e0a;
                  color: #fff;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  font-size: 16px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This link will expire in 1 hour for security reasons.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        If the button doesn't work, you can copy and paste this link into your browser:
        <br>
        <a href="${resetUrl}" style="color: #f59e0a; word-break: break-all;">${resetUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <!-- Security Reminder -->
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
        You’re receiving this email because a password reset was requested for your account.  
        If you didn’t request this, please <a href="mailto:ketrox083@gmail.com" style="color: #f59e0a;">contact our support team</a>.
      </p>

      <!-- Footer -->
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
        Need help? Contact us at <a href="mailto:ketrox083@gmail.com" style="color: #f59e0a;">ketrox083@gmail.com</a>
      </p>
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} KETROX. All rights reserved.
      </p>
    </div>
  </body>
  </html>
`,

    });

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
