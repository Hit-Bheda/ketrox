import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";


// type UserRole = "super-admin" | "admin" | "manager" | "waiter";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user,
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "admin",
        required: true,
        enum: ["super-admin", "admin", "manager", "waiter"],
      },
      tenant_id: {
        type: "string",
        required: false,
      },
    phone:{
      type:"string",
      required: false
    },
    active: { 
        type: "boolean",
        default: false,
        required: false
      }
    }
  },
  plugins: [nextCookies()],
});




