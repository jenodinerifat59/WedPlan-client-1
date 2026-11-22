
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  UserRound,
  Package,
  Clock,
  CreditCard,
  Bell,
  RefreshCw,
  CalendarDays,
  DollarSign,
  ArrowUpRight,
  Activity,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type OverviewData = {
  totalUsers: number;
  vendors: number;
  customers: number;
  totalServices: number;
  pendingServices: number;
  transactions: number;
  totalBookings: number;
  totalRevenue: number;
};

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const statCards = [
  {
    key: "totalUsers",
    title: "Total Users",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "vendors",
    title: "Total Vendors",
    icon: Store,
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "customers",
    title: "Total Customers",
    icon: UserRound,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "totalServices",
    title: "Total Services",
    icon: Package,
    color: "bg-orange-50 text-orange-600",
  },
  {
    key: "pendingServices",
    title: "Pending Services",
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
    link: "/admin/services",
  },
  {
    key: "transactions",
    title: "Total Transactions",
    icon: CreditCard,
    color: "bg-pink-50 text-pink-600",
    link: "/admin/transactions",
  },
  {
    key: "totalBookings",
    title: "Total Bookings",
    icon: CalendarDays,
    color: "bg-blue-50 text-blue-600",
    link: "/admin/bookings",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
    link: "/admin/transactions",
  },
] as const;

const quickActions = [
  {
    title: "Manage Users",
    description: "View, search and manage platform users.",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Manage Services",
    description: "Review and approve vendor services.",
    href: "/admin/services",
    icon: Store,
  },
  {
    title: "Manage Bookings",
    description: "Review and manage customer bookings.",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Notifications",
    description: "Check recent platform activities.",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Transactions",
    description: "Monitor subscription transactions.",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Admin Settings",
    description: "Manage your profile and platform settings.",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const overviewRes = await fetch(`${API_URL}/api/admin/overview`, {
        headers,
        cache: "no-store",
      });

      const overviewData = await overviewRes.json();

      if (!overviewRes.ok) {
        throw new Error(
          overviewData.message || "Failed to load dashboard information."
        );
      }

      setOverview({
        totalUsers: Number(overviewData.totalUsers || 0),
        vendors: Number(overviewData.vendors || 0),
        customers: Number(overviewData.customers || 0),
        totalServices: Number(overviewData.totalServices || 0),
        pendingServices: Number(overviewData.pendingServices || 0),
        transactions: Number(overviewData.transactions || 0),
        totalBookings: Number(overviewData.totalBookings || 0),
        totalRevenue: Number(overviewData.totalRevenue || 0),
      });

      try {
        const notificationRes = await fetch(
          `${API_URL}/api/admin/notifications`,
          {
            headers,
            cache: "no-store",
          }
        );

        if (notificationRes.ok) {
          const notificationData = await notificationRes.json();

          setNotifications(
            Array.isArray(notificationData.notifications)
              ? notificationData.notifications.slice(0, 6)
              : []
          );
        } else {
          setNotifications([]);
        }
      } catch (notificationError) {
        console.error("Notifications loading error:", notificationError);
        setNotifications([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatDate = (date: string) => {
    if (!date) return "Unknown date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 text-blue-600";
      case "service":
        return "bg-amber-50 text-amber-600";
      case "user":
        return "bg-emerald-50 text-emerald-600";
      case "payment":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Clock size={18} />;
      case "service":
        return <Store size={18} />;
      case "payment":
        return <CreditCard size={18} />;
      case "user":
        return <UserRound size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#244A3B]" />
          <p className="mt-3 text-sm text-gray-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Dashboard Loading Failed
          </h2>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="mt-5 rounded-xl bg-[#244A3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-60"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#B68B62]">
            WEDPLAN ADMINISTRATION
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#18382D] sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor your platform and manage everything from one place.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#244A3B] shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={19} className="text-[#B68B62]" />

          <h2 className="text-lg font-bold text-[#18382D]">
            Platform Statistics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const rawValue = overview?.[card.key] ?? 0;

            const value =
              card.key === "totalRevenue"
                ? `$${Number(rawValue).toFixed(2)}`
                : Number(rawValue).toLocaleString();

            const content = (
              <div className="flex h-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h3 className="mt-2 break-words text-2xl font-bold text-[#18382D] sm:text-3xl">
                    {value}
                  </h3>

                  <p className="mt-2 text-xs text-gray-400">
                    Platform overview
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>
            );

            return "link" in card && card.link ?  (
              <Link href={card.link} key={card.key}>
                {content}
              </Link>
            ) : (
              <div key={card.key}>{content}</div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-[#18382D]">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                href={action.href}
                key={action.title}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#B68B62]/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F0E9] text-[#244A3B]">
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-gray-400 transition group-hover:text-[#244A3B]"
                  />
                </div>

                <h3 className="mt-4 font-bold text-[#18382D]">
                  {action.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-bold text-[#18382D]">
              Recent Activities
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Latest updates from your platform
            </p>
          </div>

          <Link
            href="/admin/notifications"
            className="flex items-center gap-1 text-sm font-semibold text-[#244A3B] transition hover:text-[#B68B62]"
          >
            View All <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="flex items-start gap-3 p-5 transition hover:bg-gray-50"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActivityColor(
                    notification.type
                  )}`}
                >
                  {renderActivityIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#18382D]">
                      {notification.title}
                    </h3>

                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#B68B62]" />
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center">
              <Bell className="mx-auto h-9 w-9 text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No recent activities found.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
