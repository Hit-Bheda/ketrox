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
    end_date.setDate(end_date.getDate() + 14);
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
  let status = body.status;

  // Fetch current hotel to compare plan
  const [currentHotel] = await db.select().from(tenants).where(eq(tenants.id, id));
  let start_date = currentHotel?.start_date;
  let end_date = currentHotel?.end_date;
  const planChanged = plan !== currentHotel?.plan;

  // If plan changed, update dates and status
  if (planChanged) {
    if (plan === "free") {
      status = "trial";
      start_date = null;
      end_date = null;
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
  }

  const hotelData = {
    name: name as string,
    email: email as string,
    logo_url: logoUrl as string,
    owner_name: ownerName as string,
    owner_phone: ownerPhone as string,
    address: address as string,
    plan: plan as "free" | "monthly" | "6-months" | "yearly",
    status: status as "active" | "trial" | "suspended" | "expired",
    start_date: start_date,
    end_date: end_date,
  }
  const updatedHotel = await db.update(tenants)
    .set(hotelData)
    .where(eq(tenants.id, id));
  if (updatedHotel.count === 0) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  await db
    .update(user)
    .set({
      name: ownerName as string,
      email: email as string,
      phone: ownerPhone as string,
    })
    .where(and(eq(user.tenant_id, id as string), eq(user.role, "admin")));
  return Response.json({
    message: "Super Admin API Endpoint",
  });
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