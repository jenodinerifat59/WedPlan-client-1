
"use client";

import { useSession } from "@/lib/auth-client";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CircleUserRound,
} from "lucide-react";

export default function CustomerProfilePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#244A3B]/20 border-t-[#244A3B]" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="py-20 text-center text-red-600">
        Please login to view your profile.
      </div>
    );
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#B68B62]">
          Customer Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#18382D]">
          My Profile
        </h1>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center border-b border-gray-100 pb-8">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E8EFE9]">
                <CircleUserRound size={48} className="text-[#244A3B]" />
              </div>
            )}

            <h2 className="mt-4 text-2xl font-bold text-[#18382D]">
              {user.name || "Customer"}
            </h2>

            <span className="mt-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium capitalize text-green-700">
              Customer Account
            </span>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[#E8EFE9] p-3">
                <UserRound className="text-[#244A3B]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-800">
                  {user.name || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[#E8EFE9] p-3">
                <Mail className="text-[#244A3B]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-800">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[#E8EFE9] p-3">
                <ShieldCheck className="text-[#244A3B]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-semibold text-green-700">
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
