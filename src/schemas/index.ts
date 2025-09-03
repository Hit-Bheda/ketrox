import { id } from "date-fns/locale";
import { z } from "zod";

export const signinSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export const signupSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    tenantId: z.uuid("Invalid tenant ID").optional(),
    email: z.email("Provide valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().min(10, "Phone number is required"),
    role: z.enum(["super-admin", "admin", "manager", "waiter"], "Invalid role")
});

export const hotelSchema = z.object({
    name: z.string().min(1, "Hotel name is required!"),
    email: z.email("Provide valid email address"),
    password: z.string().min(9, "password must be 9 words"),
    logoUrl: z.string().min(1, "Logo is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    ownerPhone: z
        .string()
        .min(10, "Owner phone is required")
        .max(10, "Phone number must be 10 digits")
        .regex(/^[6-9]\d{9}$/, "Enter a valid Indian phone number"),
    address: z.string().min(1, "Hotel is required"),
    plan: z.enum(["free", "standard"]),
    status: z.enum(["active", "trial", "suspended", "expired"])
})

export const hotelUpdateSchema = z.object({
    id: z.string().min(1, "Invalid hotel ID"),
    name: z.string().min(1, "Hotel name is required!"),
    email: z.email("Provide valid email address"),
    password: z.string().min(9, "password must be 9 words").optional(),
    logoUrl: z.string().min(1, "Logo is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    ownerPhone: z
        .string()
        .min(10, "Owner phone is required")
        .max(10, "Phone number must be 10 digits")
        .regex(/^[6-9]\d{9}$/, "Enter a valid Indian phone number"),
    address: z.string().min(1, "Hotel is required"),
    plan: z.enum(["free", "standard"]),
    status: z.enum(["active", "trial", "suspended", "expired"])
})

export const
    staffSchema = z.object({
        name: z.string().min(1, "name is required!"),
        email: z.email("Provide valid email address"),
        phone: z.string().optional(),
        password: z.string().min(9, "password must be 9 words").optional(),
        role: z.enum(["manager", "waiter"]),
        tenantId: z.uuid("Invalid tenant ID").optional(),
        status: z.enum(["active", "inactive"]).optional(),
    })

export const tableSchema = z.object({
    number: z.string().min(1, "Table number is required!"),
    name: z.string().min(1, "Table name is required!"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    notes: z.string().optional(),
    tenantId: z.string().uuid("Invalid tenant ID"),
    available: z.boolean().optional().default(true),
    maintenance: z.boolean().optional().default(false),
    qrCodeUrl: z.string().url().optional(),
});

export const menuSchema = z.object({
    item_logo: z.array(z.string().url()).min(1, "At least one image is required!"),
    item_name: z.string().min(1, "Item name is required!"),
    category: z.string().min(1, "Category is required!"),
    description: z.string().min(1, "Description is required!"),
    price: z
        .string()
        .min(1, "Price is required")
        .transform((val) => Number(val))
        .refine((val) => !Number.isNaN(val), { message: "Price must be a number" })
        .refine((val) => val >= 0, { message: "Price must be non-negative or zero" }),
    prepTime: z
        .string()
        .min(1, "Prep time is required")
        .transform((val) => Number(val))
        .refine((val) => !Number.isNaN(val), { message: "Prep time must be a number" })
        .refine((val) => val >= 1, { message: "Prep time must be at least 1 minute" }),
    dietary: z.array(z.string()).optional(),
    tenantId: z.string().uuid("Invalid tenant ID"),
    isAvailable: z.boolean().optional(),
});

export const orderSchema = z.object({
     order_number: z.string().optional(),
    table_id: z.uuid("Invalid table ID").optional(),
    tenant_id: z.uuid("Invalid tenant ID").optional(),
    manager_id: z.string().min(1, "Invalid manager ID").optional(),
    customer_name: z.string().min(1, "Customer name is required"),
    items: z.array(z.string()).min(1, "At least one item is required"),
    quantity: z.array(z.string()).min(1, "At least one quantity is required"),
    status: z.enum(["pending", "preparing", "delivered", "cancelled"]).default("pending"),
    total_price: z.string().min(1, "Total price is required"),
});

// Ticketing schemas
export const ticketCreateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  message: z.string().min(1, "Initial message is required"),
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
});

export const ticketReplySchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  content: z.string().min(1, "Message content is required"),
});

export const ticketUpdateSchema = z.object({
  id: z.string().min(1, "Ticket ID is required"),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});