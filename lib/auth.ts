
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);
const db = mongoClient.db(process.env.DB_NAME || "wedplan");

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
export const auth = betterAuth({
  appName: "WedPlan",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client: mongoClient,
    usePlural: true,
  }),

trustedOrigins: [
  baseURL,
  "http://localhost:3000",
  "https://wed-plan-client-1.vercel.app",
],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "vendor" ? "vendor" : "customer",
            isBlocked: false,
            subscriptionPlan: "free",
          },
        }),

        after: async (user) => {
          try {
            await db.collection("notifications").insertOne({
              type: "user",
              title: "New User Registered",
              message: `${user.name || "A new user"} registered as ${user.role || "customer"}.`,
              relatedId: user.id || null,
              isRead: false,
              createdAt: new Date(),
            });
          } catch (error) {
            console.error("User registration notification error:", error);
          }
        },
      },

      update: {
        before: async (userData) => {
          const protectedFields = [
            "role",
            "isBlocked",
            "subscriptionPlan",
            "subscriptionExpiresAt",
          ];

          const safeData = Object.fromEntries(
            Object.entries(userData).filter(
              ([key]) => !protectedFields.includes(key)
            )
          );

          return { data: safeData };
        },
      },
    },
  },

  plugins: [jwt(), nextCookies()],
});
