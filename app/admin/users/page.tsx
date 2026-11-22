
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ShieldBan,
  UserRound,
  Store,
  Mail,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserItem = {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  isBlocked?: boolean;
  createdAt?: string;
  businessName?: string;
};

type RoleFilter = "all" | "customer" | "vendor" | "admin" | "blocked" | "active";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilter>("all");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getHeaders = async () => {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Please login first.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (user: UserItem) => {
    const userId = user._id || user.id;

    if (!userId) {
      setError("User ID not found.");
      return;
    }

    const action = user.isBlocked ? "unblock" : "block";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name || "this user"}?`
    );

    if (!confirmed) return;

    try {
      setActionId(userId);
      setError("");
      setMessage("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/block`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            isBlocked: !user.isBlocked,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user.");
      }

      setUsers((prev) =>
        prev.map((item) =>
          (item._id || item.id) === userId
            ? { ...item, isBlocked: !user.isBlocked }
            : item
        )
      );

      setMessage(
        user.isBlocked
          ? "User unblocked successfully."
          : "User blocked successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  };

 const filteredUsers = useMemo(() => {
  return users.filter((user) => {
    const matchesRole =
      activeRole === "all" ||
      (activeRole === "blocked" && user.isBlocked === true) ||
      (activeRole === "active" && !user.isBlocked) ||
      (activeRole !== "blocked" &&
        activeRole !== "active" &&
        (user.role || "customer") === activeRole);

    const searchText =
      `${user.name || ""} ${user.email || ""} ${user.businessName || ""}`.toLowerCase();

    return matchesRole && searchText.includes(search.toLowerCase());
  });
}, [users, activeRole, search]);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-[#244A3B]/10 text-[#244A3B]",
    },
    {
      label: "Customers",
      value: users.filter((user) => user.role === "customer").length,
      icon: UserRound,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Vendors",
      value: users.filter((user) => user.role === "vendor").length,
      icon: Store,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Blocked Users",
      value: users.filter((user) => user.isBlocked).length,
      icon: ShieldBan,
      color: "bg-red-50 text-red-600",
    },
  ];

  const getDate = (date?: string) => {
    if (!date) return "Unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Unavailable";

    return parsed.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B68B62]">
              <ShieldCheck size={17} />
              Admin Panel
            </div>

            <h1 className="text-2xl font-bold text-[#18382D] sm:text-3xl">
              Manage Users
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage customers, vendors and platform accounts.
            </p>
          </div>

          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Users
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X size={17} />
            </button>
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={19} />
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="ml-auto">
              <X size={17} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <h2 className="mt-2 text-3xl font-bold text-[#18382D]">
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Search and Filter */}
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-bold text-[#18382D]">
                  All Platform Users
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredUsers.length} users found
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
  <Filter size={16} className="mr-1 text-gray-400" />

  {[
    { label: "All Users", value: "all" },
    { label: "Customers", value: "customer" },
    { label: "Vendors", value: "vendor" },
    { label: "Admins", value: "admin" },
    { label: "Active Users", value: "active" },
    { label: "Blocked Users", value: "blocked" },
  ].map((filter) => (
    <button
      key={filter.value}
      onClick={() => setActiveRole(filter.value as RoleFilter)}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        activeRole === filter.value
          ? "bg-[#244A3B] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {filter.label}
    </button>
  ))}
</div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#FAFAF8] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const userId = user._id || user.id || "";
                    const isVendor = user.role === "vendor";

                    return (
                      <tr key={userId} className="transition hover:bg-[#FAFAF8]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="h-11 w-11 rounded-full border border-gray-100 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#244A3B]/10 font-bold text-[#244A3B]">
                                {(user.name || "U").charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-[#18382D]">
                                {user.name || "Unnamed User"}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail size={12} />
                                {user.email || "No email"}
                              </p>

                              {user.businessName && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {user.businessName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                              isVendor
                                ? "bg-amber-50 text-amber-700"
                                : user.role === "admin"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {isVendor ? (
                              <Store size={13} />
                            ) : user.role === "admin" ? (
                              <ShieldCheck size={13} />
                            ) : (
                              <UserRound size={13} />
                            )}
                            {user.role || "customer"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />
                            {getDate(user.createdAt)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              user.isBlocked
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleBlock(user)}
                            disabled={
                              !userId ||
                              user.role === "admin" ||
                              actionId !== null
                            }
                            title={
                              user.role === "admin"
                                ? "Admin account cannot be blocked here"
                                : user.isBlocked
                                ? "Unblock user"
                                : "Block user"
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              user.isBlocked
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {actionId === userId ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : user.isBlocked ? (
                              <ShieldCheck size={15} />
                            ) : (
                              <ShieldBan size={15} />
                            )}

                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Users className="mx-auto mb-3 text-gray-300" size={35} />
                      <p className="font-semibold text-[#18382D]">
                        No Users Found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </section>
      </div>
    </div>
  );
}
