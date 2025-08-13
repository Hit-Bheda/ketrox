"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

export const findUserRoles = async (userId: string) => {
    const roles = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))

    console.log("Roles", roles)
    return roles
}