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
    password:z.string().min(9,"password must be 9 words"),
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
    id: z.string().min(1,"Invalid hotel ID"),
    name: z.string().min(1, "Hotel name is required!"),
    email: z.email("Provide valid email address"),
    password:z.string().min(9,"password must be 9 words").optional(),
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

export const staffSchema = z.object({
    name: z.string().min(1, "name is required!"),
    email: z.email("Provide valid email address"),
    phone: z.string().optional(),
    password:z.string().min(9,"password must be 9 words"),
    role: z.enum(["manager", "waiter"])
})