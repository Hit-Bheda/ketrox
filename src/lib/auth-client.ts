import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/lib/auth";
import { customSession } from "better-auth/plugins";
import { findUserRoles } from "@/lib/db/user";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [ inferAdditionalFields<typeof auth>(),
    customSession(async ({ user, session }) => {
      const roles = findUserRoles(session.userId);
      return {
        roles,
        user: {
          ...user,
          newField: "newField",
        },
        session
      };
    }),
  ]
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession
} = authClient