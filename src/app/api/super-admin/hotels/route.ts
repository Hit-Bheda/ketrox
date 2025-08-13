import { db } from "@/db";
import { tenants, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: Request) {
  const {
    name, email, logoUrl, ownerName, ownerPhone, address, plan, status, password
  } = await request.json();

  if (!name || !email || !logoUrl || !ownerName || !ownerPhone || !address || !plan || !status || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const tenantId = crypto.randomUUID();

  try {
 
    await db.insert(tenants).values({
      id: tenantId,
      name,
      email,
      logo_url: logoUrl,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      address,
      plan: plan as "free" | "standard",
      status: status as "active" | "trial" | "suspended" | "expired",
    });
  
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: ownerName,
        role: "admin",
        tenant_id: tenantId,
      }),
    });

    const signupResult = (await signupResponse.json().catch(() => ({}))) as {
      data?: { user?: { id?: string } };
      user?: { id?: string };
      error?: { message?: string } | string;
    };
    if (!signupResponse.ok || signupResult?.error) {
      const rawError = signupResult?.error;
      const message = typeof rawError === "string" ? rawError : rawError?.message || "Signup failed";
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({
      message: "Tenant and admin user created successfully",
      tenantId,
      userId: signupResult?.data?.user?.id ?? signupResult?.user?.id ?? null,
    });

  } catch {
    return Response.json({ error: "Failed to create tenant." }, { status: 500 });
  }
}



export async function PUT(request: Request) {
    const { id, name, email, logoUrl, ownerName, ownerPhone, address, plan, status } = await request.json();

    if (!id || !name || !email || !logoUrl || !ownerName || !ownerPhone || !address || !plan || !status) {
        return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    const hotelData = {
        name: name as string,
        email: email as string,
        logo_url: logoUrl as string,
        owner_name: ownerName as string,
        owner_phone: ownerPhone as string,
        address: address as string,
        plan: plan as "free" | "standard",
        status: status as "active" | "trial" | "suspended" | "expired",
    }
    const updatedHotel = await db.update(tenants)
        .set(hotelData)
        .where(eq(tenants.id, id));
    if (updatedHotel.count === 0) {
        return Response.json({ error: "Hotel not found" }, { status: 404 });
    }
    return Response.json({
        message: "Super Admin API Endpoint",
    });
}

export async function GET() {
    console.log("Super Admin API Endpoint Hit");
    const hotels = await db.select().from(tenants);
    return Response.json({
        message: "Super Admin API Endpoint",
        hotels,
    });
}

export async function DELETE(request: Request) {
    console.log("Super Admin API Endpoint Hit");
    const { id } = await request.json();
    if (!id) {
        return Response.json({ error: "Hotel ID is required" }, { status: 400 });
    }

  // Delete users linked to this tenant first to satisfy FK constraints
  await db.delete(user).where(eq(user.tenant_id, id));

  const deletedHotel = await db.delete(tenants).where(eq(tenants.id, id));
    if (deletedHotel.count === 0) {
        return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    return Response.json({ message: "Hotel deleted successfully" });
}