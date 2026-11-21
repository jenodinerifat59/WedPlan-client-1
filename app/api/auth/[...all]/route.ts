
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth API handlers
export const { GET, POST } = toNextJsHandler(auth);
