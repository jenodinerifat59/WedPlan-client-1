
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  Store,
  UserRound,
  Ban,
  CheckCircle2,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

type User = {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  role: "admin" | "vendor" | "customer";
  isBlocked?: boolean;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [message, setMessage] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = await getAuthToken();

      const params = new URLSearchParams();

      if (search.trim()) params.set("q", search.trim());
      if (role !== "all") params.set("role", role);

      const response = await fetch(
        `${API_URL}/api/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Admin permission required."
            : "Failed to load users."
        );
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlock = async (user: User) => {
    const nextStatus = !user.isBlocked;

    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus ? "block" : "unblock"} this user?`
    );

    if (!confirmed) return;

    try {
      setUpdating(user._id);
      setMessage("");

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isBlocked: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update user.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: nextStatus }
            : item
        )
      );

      setMessage(data.message || "User updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdating(null);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const vendorCount = users.filter((u) => u.role === "vendor").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  const roleStyle = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "bg-purple-50 text-purple-700";
      case "vendor":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-emerald-50 text-emerald-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#B68B62]">
            ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#18382D]">
            Manage Users
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and monitor all registered WedPlan users.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#18382D] transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Admins",
            value: adminCount,
            icon: ShieldCheck,
            color: "bg-purple-50 text-purple-700",
          },
          {
            title: "Total Vendors",
            value: vendorCount,
            icon: Store,
            color: "bg-blue-50 text-blue-700",
          },
          {
            title: "Total Customers",
            value: customerCount,
            icon: UserRound,
            color: "bg-emerald-50 text-emerald-700",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h2 className="mt-3 text-3xl font-bold text-[#18382D]">
                    {item.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#244A3B]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-[#244A3B]">
          {message}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-[#18382D]">All Users</h2>
            <p className="mt-1 text-xs text-gray-400">
              Showing up to 200 registered users
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={17} />
            {users.length} Users
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="animate-spin text-[#244A3B]" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <Users size={40} className="text-gray-300" />
            <h3 className="mt-4 font-semibold text-gray-700">
              No users found
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Try changing your search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-[#FAF9F6] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-[#FAF9F6]"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9EEE9] font-bold text-[#244A3B]">
                            {(user.name || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-[#18382D]">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${roleStyle(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {user.isBlocked ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                          <Ban size={14} />
                          Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-right">
                      {user.role === "admin" ? (
                        <span className="text-xs font-medium text-gray-400">
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBlock(user)}
                          disabled={updating === user._id}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            user.isBlocked
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {updating === user._id ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : user.isBlocked ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Ban size={14} />
                          )}

                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
