
import { db } from "@/db";
import { user, tenants, accountPlainPassword} from "@/db/schema";
import { staffSchema } from "@/schemas";
import { eq, or, and } from "drizzle-orm";
import z from "zod";


export async function POST(request: Request) {
  const body = await request.json();
  const parsed = staffSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, phone, role, password, tenantId } = parsed.data;

  // Duplicate check
  let existingUser: typeof user.$inferSelect[] = [];
  if (email && phone) {
    existingUser = await db
      .select()
      .from(user)
      .where(or(eq(user.email, email), eq(user.phone, phone)));
  } else if (email) {
    existingUser = await db.select().from(user).where(eq(user.email, email));
  } else if (phone) {
    existingUser = await db.select().from(user).where(eq(user.phone, phone));
  }

  if (existingUser.length > 0) {
    const duplicateFields = [];
    if (email && existingUser.some(u => u.email === email)) duplicateFields.push("email");
    if (phone && existingUser.some(u => u.phone === phone)) duplicateFields.push("phone");
    return Response.json(
      { error: `Staff with this ${duplicateFields.join(" and ")} already exists.` },
      { status: 409 }
    );
  }

  // Tenant check
  if (!tenantId) {
    return Response.json({ error: "tenantId is required" }, { status: 400 });
  }
  const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId ?? ""));
  if (!tenant || tenant.length === 0) {
    return Response.json({ error: "Invalid tenantId: tenant not found" }, { status: 400 });
  }

  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Call signup API to create user in auth system
    const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
        password,
        name,
        role,
      }),
    });

    const result = await signupResponse.json();

    if (!signupResponse.ok) {
      return Response.json(
        { error: result?.error || "Failed to create staff" },
        { status: 400 }
      );
    }

    // Get userId from auth result
    const userId = result?.data?.user?.id ?? result?.user?.id ?? null;

    // Link tenantId in your own DB
    await db.update(user).set({ tenant_id: tenantId }).where(eq(user.id, userId));

    // Store plain password in accountPlainPassword table
    if (userId && password) {
      await db.insert(accountPlainPassword).values({
        userId,
        plainPassword: password,
      });
    }
    return Response.json({
      message: "Staff created successfully",
      userId,
    });
  } catch (err) {
    console.error("Error creating staff:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(request: Request) {
  let tenantId = "";

  if (typeof request !== "undefined" && "headers" in request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )tenantId=([^;]*)/);
    if (match) tenantId = decodeURIComponent(match[1]);
  }
  if (!tenantId) {
    return Response.json({ error: "tenantId is required for staff fetch" }, { status: 400 });
  }
  const staff = await db
    .select()
    .from(user)
    .where(
      and(
        or(eq(user.role, "waiter"), eq(user.role, "manager")),
        eq(user.tenant_id, tenantId)
      )
    );
  return Response.json({
    message: "Staff fetched successfully",
    staff,
  });
}



const updateStaffSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["manager", "waiter"]).optional(),
  active: z.boolean().optional(),
  status: z.string().optional(),
});


export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, name, email, phone, role, status } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = new Date();

    const updatableFields = ["name", "email", "phone", "role", "status"];
    const hasUpdate = updatableFields.some((field) => field in updateData);
    if (!hasUpdate) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return Response.json(
        { error: "Staff not found or not updated" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Staff updated successfully",
      staff: updated[0],
    });
  } catch (err) {
    console.error("Error updating staff:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(user).where(eq(user.id, id));

    return Response.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


