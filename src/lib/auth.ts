import { db } from "@/db";
import * as schema from "@/db/schema";
import {  APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/plugins";
import { eq } from "drizzle-orm";

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
      phone: {
        type: "string",
        required: false
      },
      active: { 
        type: "boolean",
        default: false,
        required: false
      }
    }
  },
 databaseHooks: {
  session: {
    create: {
      before: async (sessionData) => {
        const userRows = await db.select().from(schema.user).where(eq(schema.user.id, sessionData.userId));
        const user = userRows[0];
        if (!user) return;

        if (user.tenant_id) {
          const tenantRows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, user.tenant_id));
          const tenant = tenantRows[0];
          if (tenant?.status === "expired") {
            throw new APIError("FORBIDDEN", {
              message: "Your plan has expired. Please contact support to renew your subscription.",
            });
          }
        }
      },
    },
  },
},
  plugins: [nextCookies()],
 hooks: {
  before: createAuthMiddleware(async (ctx) => {
    if (ctx.path === "/api/auth/sign-in/email" && ctx.method === "POST") {
      const email = ctx.body?.email;
      if (!email) return;

      const userRows = await db.select().from(schema.user).where(eq(schema.user.email, email));
      const userRow = userRows[0];
      if (userRow?.tenant_id) {
        const tenantRows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, userRow.tenant_id));
        const tenantRow = tenantRows[0];
        if (tenantRow && tenantRow.status === "expired") {
          throw new APIError("FORBIDDEN", {
            message: "Your plan has expired. Please contact support to renew your subscription.",
          });
        }
      }
    }
  }),
},
});