
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Users,
  BriefcaseBusiness,
  CreditCard,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  MailOpen,
  Mail,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type NotificationType = "booking" | "service" | "user" | "payment";

type NotificationItem = {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string | null;
  isRead: boolean;
  createdAt: string;
};

type FilterType = "all" | NotificationType;

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [actionId, setActionId] = useState<string | null>(null);
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

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/notifications`,
        {
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
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
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      setActionId(id);
      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/notifications/${id}/read`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notification.");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionId("all");
      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/notifications/read-all`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notifications.");
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
      setMessage("All notifications marked as read.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteNotification = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/notifications/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification.");
      }

      const deleted = notifications.find((item) => item._id === id);

      setNotifications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setMessage("Notification deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.type === activeFilter;

      const searchText =
        `${item.title} ${item.message} ${item.type}`.toLowerCase();

      return (
        matchesFilter &&
        searchText.includes(search.toLowerCase())
      );
    });
  }, [notifications, activeFilter, search]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return CalendarDays;
      case "service":
        return BriefcaseBusiness;
      case "user":
        return Users;
      case "payment":
        return CreditCard;
      default:
        return Bell;
    }
  };

  const getIconStyle = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 text-blue-600";
      case "service":
        return "bg-amber-50 text-amber-600";
      case "user":
        return "bg-purple-50 text-purple-600";
      case "payment":
        return "bg-green-50 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTime = (date: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const stats = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: Bell,
      color: "bg-[#244A3B]/10 text-[#244A3B]",
    },
    {
      label: "Unread Notifications",
      value: unreadCount,
      icon: Mail,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Booking Requests",
      value: notifications.filter((n) => n.type === "booking").length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Service Submissions",
      value: notifications.filter((n) => n.type === "service").length,
      icon: BriefcaseBusiness,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Bookings", value: "booking" },
    { label: "Services", value: "service" },
    { label: "Users", value: "user" },
    { label: "Payments", value: "payment" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B68B62]">
              <Bell size={16} />
              Admin Panel
            </div>

            <h1 className="text-2xl font-bold text-[#18382D] sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage all platform notifications from one place.
            </p>

            <p className="mt-2 text-sm font-semibold text-[#244A3B]">
              {unreadCount} unread notifications
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || actionId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-gray-50 disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark All Read
            </button>

            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={19} />
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="ml-auto font-semibold"
            >
              ✕
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

        {/* Notification List */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Search and Filters */}
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-bold text-[#18382D]">
                  All Notifications
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredNotifications.length} notifications found
                </p>
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Filter size={16} className="mr-1 text-gray-400" />

              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-[#244A3B] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Items */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => {
                const Icon = getIcon(item.type);

                return (
                  <div
                    key={item._id}
                    className={`flex gap-4 p-5 transition hover:bg-[#FAFAF8] sm:px-6 ${
                      !item.isRead ? "bg-[#F8FAF7]" : ""
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconStyle(item.type)}`}>
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#18382D]">
                          {item.title}
                        </h3>

                        {!item.isRead && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                            New
                          </span>
                        )}

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-gray-600">
                          {item.type}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {item.message}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={13} />
                        {getTime(item.createdAt)}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-1">
                      <button
                        onClick={() => markAsRead(item._id)}
                        disabled={item.isRead || actionId !== null}
                        title={item.isRead ? "Already read" : "Mark as read"}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {actionId === item._id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : item.isRead ? (
                          <MailOpen size={17} />
                        ) : (
                          <Mail size={17} />
                        )}
                      </button>

                      <button
                        onClick={() => deleteNotification(item._id)}
                        disabled={actionId !== null}
                        title="Delete notification"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#244A3B]/10 text-[#244A3B]">
                  <Bell size={28} />
                </div>

                <h3 className="font-bold text-[#18382D]">
                  No Notifications Found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  New platform activities will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-gray-400">
          Notifications are stored and managed through the WedPlan backend.
        </p>
      </div>
    </div>
  );
}
