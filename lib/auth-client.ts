
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import type { auth } from "./auth";

// Better Auth Client
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000",

  // Infer custom user fields from auth.ts
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

// Export authentication methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
