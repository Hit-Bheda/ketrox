import { db } from "@/db";
import { tenants, user, accountPlainPassword } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";


export async function POST(request: Request) {
  const body = await request.json();
  const {
    name, email, logoUrl, ownerName, ownerPhone, address, plan, password, phone
  } = body;
  let status = body.status;

  // Set status according to plan
  let start_date: Date | undefined = undefined;
  let end_date: Date | undefined = undefined;

  if (plan === "free") {
    status = "trial";
    start_date = new Date();
    end_date = new Date();
    end_date.setMinutes(end_date.getMinutes() + 2); // 2-minute trial for testing
  } else if (plan === "monthly") {
    status = "active";
    start_date = new Date();
    end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 1);
  } else if (plan === "6-months") {
    status = "active";
    start_date = new Date();
    end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 6);
  } else if (plan === "yearly") {
    status = "active";
    start_date = new Date();
    end_date = new Date();
    end_date.setFullYear(end_date.getFullYear() + 1);
  }

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
      plan: plan as "free" | "monthly" | "6-months" | "yearly",
      status: status as "active" | "trial" | "suspended" | "expired",
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
    });

    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
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

    const userId = signupResult?.data?.user?.id ?? signupResult?.user?.id ?? null;

    // Ensure the email credential row has accountId set to the email
    if (userId && password) {
      await db.insert(accountPlainPassword).values({
        userId,
        plainPassword: password,
      });
    }
    return Response.json({
      message: "Tenant and admin user created successfully",
      tenantId,
      userId,
    });

  } catch {
    return Response.json({ error: "Failed to create tenant." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, name, email, logoUrl, ownerName, ownerPhone, address, plan } = body;

  // Fetch current hotel
  const [currentHotel] = await db.select().from(tenants).where(eq(tenants.id, id));

  if (!currentHotel) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  const now = new Date();

  // --- 🔹 Block expired free trial ---
  if (
    currentHotel.plan === "free" &&
    currentHotel.status === "trial" &&
    currentHotel.end_date &&
    now > new Date(currentHotel.end_date)
  ) {
    return Response.json({
      message: "Your free trial has ended. You cannot switch to a free trial again.",
    });
  }

  // --- 🔹 Prepare updated data ---
  let status: "active" | "trial" | "suspended" | "expired" = currentHotel.status;
  let start_date = currentHotel.start_date;
  let end_date = currentHotel.end_date;

  if (plan === "monthly") {
    status = "active";
    start_date = new Date();
    end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + 1);
  } else if (plan === "6-months") {
    status = "active";
    start_date = new Date();
    end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + 6);
  } else if (plan === "yearly") {
    status = "active";
    start_date = new Date();
    end_date = new Date(start_date);
    end_date.setFullYear(end_date.getFullYear() + 1);
  } else if (plan === "free") {
    // First-time free trial
    if (!currentHotel.start_date && !currentHotel.end_date) {
      status = "trial";
      start_date = new Date();
      end_date = new Date(start_date);
      end_date.setMinutes(end_date.getMinutes() + 2); // 2-minute trial
    } else {
      // Already had a trial, cannot update
      return Response.json({
        message: "Your free trial has already ended. You cannot use free trial again.",
      });
    }
  }

  const hotelData = {
    name,
    email,
    logo_url: logoUrl,
    owner_name: ownerName,
    owner_phone: ownerPhone,
    address,
    plan,
    status,
    start_date,
    end_date,
  };

  // --- 🔹 Update hotel ---
  await db.update(tenants).set(hotelData).where(eq(tenants.id, id));

  // --- 🔹 Update admin user ---
  await db.update(user)
    .set({ name: ownerName, email, phone: ownerPhone })
    .where(and(eq(user.tenant_id, id), eq(user.role, "admin")));

  return Response.json({ message: "Hotel updated successfully" });
}


export async function GET() {
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

  await db.delete(user).where(eq(user.tenant_id, id));

  const deletedHotel = await db.delete(tenants).where(eq(tenants.id, id));
  if (deletedHotel.count === 0) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  return Response.json({ message: "Hotel deleted successfully" });
}