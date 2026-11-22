
"use client";

import { useEffect, useMemo, useState } from "react";
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
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type NotificationType = "booking" | "service" | "user" | "payment";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  status: string;
};

type FilterType = "all" | NotificationType;

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usersRes, servicesRes, bookingsRes, transactionsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/users`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/admin/services`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/admin/bookings`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/admin/transactions`, {
            headers,
            cache: "no-store",
          }),
        ]);

      const responses = [
        usersRes,
        servicesRes,
        bookingsRes,
        transactionsRes,
      ];

      if (responses.some((res) => !res.ok)) {
        throw new Error("Failed to load notifications.");
      }

      const [users, services, bookings, transactions] =
        await Promise.all(responses.map((res) => res.json()));

      const items: NotificationItem[] = [];

      // User Registration Notifications
      if (Array.isArray(users)) {
        users.forEach((user: any) => {
          items.push({
            id: `user-${user._id}`,
            type: "user",
            title: "New User Registered",
            description: `${user.name || "A new user"} joined WedPlan.`,
            date: user.createdAt || user.updatedAt || "",
            status: user.role || "customer",
          });
        });
      }

      // Service Notifications
      if (Array.isArray(services)) {
        services.forEach((service: any) => {
          if (service.status === "pending") {
            items.push({
              id: `service-${service._id}`,
              type: "service",
              title: "New Service Submission",
              description: `${service.serviceName || "A service"} is waiting for admin approval.`,
              date: service.createdAt || "",
              status: "pending",
            });
          }
        });
      }

      // Booking Notifications
      if (Array.isArray(bookings)) {
        bookings.forEach((booking: any) => {
          if (booking.status === "pending") {
            items.push({
              id: `booking-${booking._id}`,
              type: "booking",
              title: "New Booking Request",
              description: `${booking.customer?.name || "A customer"} requested ${booking.service?.serviceName || "a service"}.`,
              date: booking.createdAt || "",
              status: "pending",
            });
          }
        });
      }

      // Transaction Notifications
      if (Array.isArray(transactions)) {
        transactions.forEach((transaction: any) => {
          items.push({
            id: `payment-${transaction._id}`,
            type: "payment",
            title: "Transaction Activity",
            description: `${transaction.vendor?.name || "A vendor"} made a ${transaction.plan || "subscription"} transaction.`,
            date: transaction.createdAt || "",
            status: transaction.status || "unknown",
          });
        });
      }

      items.sort((a, b) => {
        return (
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      setNotifications(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.type === activeFilter;

      const searchText =
        `${item.title} ${item.description} ${item.status}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
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
      label: "Total Activities",
      value: notifications.length,
      icon: Bell,
      color: "bg-[#244A3B]/10 text-[#244A3B]",
    },
    {
      label: "Booking Requests",
      value: notifications.filter((n) => n.type === "booking").length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending Services",
      value: notifications.filter((n) => n.type === "service").length,
      icon: BriefcaseBusiness,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "New Users",
      value: notifications.filter((n) => n.type === "user").length,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const filters: { label: string; value: FilterType }[] = [
    { label: "All Activities", value: "all" },
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
              Monitor recent activities across your platform.
            </p>
          </div>

          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#244A3B] shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button
              onClick={() => fetchNotifications()}
              className="ml-auto font-semibold underline"
            >
              Retry
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
                    <p className="text-sm text-gray-500">
                      {stat.label}
                    </p>
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

          {/* Search and Filter */}
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>
                <h2 className="font-bold text-[#18382D]">
                  Recent Activities
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredNotifications.length} activities found
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
                  placeholder="Search activities..."
                  className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
                />
              </div>
            </div>

            {/* Filters */}
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

          {/* Items */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => {
                const Icon = getIcon(item.type);

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-5 transition hover:bg-[#FAFAF8] sm:px-6"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconStyle(item.type)}`}>
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#18382D]">
                          {item.title}
                        </h3>

                        {item.status && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-gray-600">
                            {item.status}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={13} />
                        {getTime(item.date)}
                      </div>
                    </div>

                    <ArrowUpRight
                      size={17}
                      className="mt-1 shrink-0 text-gray-300"
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#244A3B]/10 text-[#244A3B]">
                  <Bell size={28} />
                </div>

                <h3 className="font-bold text-[#18382D]">
                  No Activities Found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  No activities match your current search or filter.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-gray-400">
          Activity information is collected from existing WedPlan records.
        </p>
      </div>
    </div>
  );
}
