import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { qr_codes } from "@/db/schema";
import { qrCodeSchema } from "@/schemas";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { generateQrImage } from "@/lib/qr";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = qrCodeSchema.parse(body);
    const { tenantId, url: path } = parsed;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is missing" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL as string;
    // Always include tenantId as query param in QR code URL
    let urlPath = path.startsWith("/") ? path : `/${path}`;
    // Remove any existing tenantId param to avoid duplicates
    urlPath = urlPath.replace(/([?&])tenantId=[^&]*/g, "");
    // Add tenantId param
    const fullUrl = `${baseUrl}${urlPath}${urlPath.includes("?") ? "&" : "?"}tenantId=${tenantId}`;

    const qrPath = await generateQrImage(fullUrl);

    const now = new Date();
    const id = uuidv4();

    await db.insert(qr_codes).values({
      id,
      tenantId,
      url: fullUrl,
      qrPath,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "QR Code generated successfully",
      url: fullUrl,
      qrPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error creating QR code:", message);

    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL((req as Request).url);
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) throw new Error("Missing tenantId");
    const qr = await db.select().from(qr_codes).where(eq(qr_codes.tenantId, tenantId));
    if (!qr.length) return NextResponse.json({ success: false, error: "QR code not found" }, { status: 404 });
    return NextResponse.json({ success: true, qr: qr[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = qrCodeSchema.parse(body);
    const { tenantId, url: path } = parsed;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is missing" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL as string;

    // Ensure path starts with "/" and append tenantId query param
    let urlPath = path.startsWith("/") ? path : `/${path}`;
    urlPath = urlPath.replace(/([?&])tenantId=[^&]*/g, ""); // remove existing tenantId if any
    const fullUrl = `${baseUrl}${urlPath}${urlPath.includes("?") ? "&" : "?"}tenantId=${tenantId}`;

    const qrPath = await generateQrImage(fullUrl);
    const now = new Date();

    const updated = await db.update(qr_codes)
      .set({ url: fullUrl, qrPath, updatedAt: now }) // only update URL and qrPath
      .where(eq(qr_codes.tenantId, tenantId))
      .returning();

    if (updated && updated.length > 0) {
      return NextResponse.json({
        success: true,
        message: "QR code updated successfully",
        qrPath,
        url: fullUrl
      });
    } else {
      return NextResponse.json(
        { success: false, message: "No QR code found to update" },
        { status: 404 }
      );
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

// Delete QR code
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { tenantId } = body;

    if (!tenantId) throw new Error("Missing tenantId");

    const result = await db.delete(qr_codes).where(eq(qr_codes.tenantId, tenantId));

    return NextResponse.json({
      success: true,
      message: `QR Code deleted successfully.`,
      deletedCount: result, 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

