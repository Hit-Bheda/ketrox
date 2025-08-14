import { tableSchema } from "@/schemas";
import { db } from "@/db";
import { user, tenants, table } from "@/db/schema";
import { staffSchema } from "@/schemas";
import { eq, or } from "drizzle-orm";
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
  
    const { name, email, password, role,phone } = parsed.data;
  
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
      const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          password,
          name,
          role,
        })
      });
  
      const result = await signupResponse.json();
  
      if (!signupResponse.ok) {
        return Response.json(
          { error: result?.error || "Failed to create staff" },
          { status: 400 }
        );
      }
  
      return Response.json({
        message: "Staff created successfully",
        userId:
          result?.data?.user?.id ?? result?.user?.id ?? null
      });
    } catch (err) {
      console.error("Error creating staff:", err);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }


  export async function GET() {
    const staff = await db
      .select()
      .from(user)
      .where(or(eq(user.role, "waiter"), eq(user.role, "manager")));
  
    return Response.json({
      message: "Staff fetched successfully",
      staff,
    });
  }


//   export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
//     const { id, name, email, phone, role } = body;

//     if (!id) {
//       return Response.json({ error: "ID is required" }, { status: 400 });
//     }

//     // Only update fields that are provided
//     const updateData: Partial<typeof user> = {};
//     if (name !== undefined) updateData.name = name;
//     if (email !== undefined) updateData.email = email;
//     if (phone !== undefined) updateData.phone = phone;
//     if (role !== undefined) updateData.role = role;

//     const updated = await db
//       .update(user)
//       .set(updateData)
//       .where(eq(user.id, id))
//       .returning();

//     if (!updated || updated.length === 0) {
//       return Response.json({ error: "Staff not found or not updated" }, { status: 404 });
//     }

//     return Response.json({ message: "Staff updated successfully", staff: updated[0] });
//   } catch (err) {
//     console.error("Error updating staff:", err);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

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


export async function POST_TABLE(request: Request) {
  const body = await request.json();
  const parsed = tableSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { number, name, capacity, notes, tenantId } = parsed.data;
  try {
   
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenant || tenant.length === 0) {
      return Response.json({ error: "Invalid tenantId: tenant not found" }, { status: 400 });
    }
 
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const inserted = await db.insert(table).values({
      id,
      number,
      name,
      capacity: capacity.toString(),
      notes,
      tenantId
    }).returning();
    return Response.json({ message: "Table created successfully", table: inserted[0] });
  } catch (err) {
    console.error("Error creating table:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}