
"use client";

import { useSession } from "@/lib/auth-client";

export default function VendorProfilePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (!session?.user) {
    return <p className="text-red-500">Please login first.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#18382D]">
        My Profile
      </h1>

      <p className="text-gray-500 mt-2">
        View your vendor account information.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mt-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#18382D] text-white flex items-center justify-center text-2xl font-bold">
            {session.user.name?.charAt(0).toUpperCase() || "V"}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#18382D]">
              {session.user.name}
            </h2>

            <p className="text-sm text-gray-500">
              Vendor Account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-[#18382D]">
              {session.user.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-medium text-[#18382D]">
              {session.user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
