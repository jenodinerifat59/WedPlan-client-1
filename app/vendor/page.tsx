
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthToken } from "@/lib/get-token";
import { api } from "@/lib/api";

import {
  BriefcaseBusiness,
  CalendarCheck,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowUpRight,
  Crown,
  Sparkles,
  Plus,
} from "lucide-react";

interface Overview {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  plan: string;
}

interface Booking {
  _id: string;
  eventDate: string;
  eventLocation: string;
  status: string;
  customer?: {
    name?: string;
    email?: string;
  };
  service?: {
    serviceName?: string;
  };
}

export default function VendorDashboard() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  const [overview, setOverview] = useState<Overview>({
    totalServices: 0,
    activeServices: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    plan: "free",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Fetch Dashboard Overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      const result = await api(
        "/api/vendor/overview",
        { method: "GET" },
        token
      );

      setOverview(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recent Bookings
  const fetchRecentBookings = async () => {
    try {
      const token = await getAuthToken();

      const result = await api(
        "/api/vendor/recent-bookings",
        { method: "GET" },
        token
      );

      setRecentBookings(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Recent bookings error:", err);
    }
  };

  // Accept / Reject Booking
  const handleBookingAction = async (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setActionLoading(id);

      const token = await getAuthToken();

      await api(
        `/api/vendor/bookings/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token
      );

      await Promise.all([
        fetchRecentBookings(),
        fetchOverview(),
      ]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading("");
    }
  };

  // Initial Load
  useEffect(() => {
    fetchOverview();
    fetchRecentBookings();
  }, []);

  const stats = [
    {
      title: "Total Services",
      value: overview.totalServices,
      icon: BriefcaseBusiness,
      description: "All your listed services",
      iconBg: "bg-[#E8EFE9]",
      iconColor: "text-[#244A3B]",
      accent: "bg-[#244A3B]",
    },
    {
      title: "Active Services",
      value: overview.activeServices,
      icon: CheckCircle,
      description: "Approved and available",
      iconBg: "bg-[#E9F5ED]",
      iconColor: "text-emerald-700",
      accent: "bg-emerald-600",
    },
    {
      title: "Pending Requests",
      value: overview.pendingBookings,
      icon: Clock,
      description: "Awaiting your response",
      iconBg: "bg-[#FBF0E3]",
      iconColor: "text-[#B68B62]",
      accent: "bg-[#B68B62]",
    },
    {
      title: "Accepted Bookings",
      value: overview.acceptedBookings,
      icon: CalendarCheck,
      description: "Confirmed bookings",
      iconBg: "bg-[#EDEAF5]",
      iconColor: "text-violet-700",
      accent: "bg-violet-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wider uppercase text-[#B68B62]">
            Vendor Workspace
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#18382D] mt-2">
            Dashboard Overview
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/vendor/services/add"
            className="flex items-center gap-2 bg-[#B68B62] text-white px-5 py-3 rounded-xl hover:bg-[#9F7652] transition"
          >
            <Plus size={18} />
            Add New Service
          </Link>

          <button
            onClick={() => {
              fetchOverview();
              fetchRecentBookings();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-[#18382D] text-white px-5 py-3 rounded-xl hover:bg-[#244A3B] transition disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-40 rounded-2xl bg-white animate-pulse border border-gray-100"
            />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${item.accent}`} />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {item.title}
                      </p>

                      <h2 className="text-4xl font-bold text-[#18382D] mt-4">
                        {item.value}
                      </h2>
                    </div>

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                      <Icon size={26} className={item.iconColor} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    <span className="w-2 h-2 rounded-full bg-[#B68B62]" />
                    <p className="text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-[#18382D] rounded-3xl p-7 md:p-10 text-white shadow-lg">
            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -bottom-36 w-72 h-72 rounded-full border border-white/10" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-[#D6B58D] mb-3">
                  <Sparkles size={18} />
                  <span className="text-sm font-medium">
                    Welcome to WedPlan
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold">
                  Grow Your Wedding Business
                </h2>

                <p className="text-white/70 mt-3 max-w-xl leading-relaxed">
                  Manage your services, handle booking requests,
                  and build meaningful connections with customers.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 min-w-fit">
                <div className="w-11 h-11 rounded-xl bg-[#B68B62] flex items-center justify-center">
                  <Crown size={23} />
                </div>

                <div>
                  <p className="text-xs text-white/60">Current Plan</p>
                  <p className="font-bold capitalize text-lg">
                    {overview.plan}
                  </p>
                </div>

                <ArrowUpRight size={18} className="text-white/60" />
              </div>
            </div>
          </div>

          {/* Bottom Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="text-[#244A3B]" />
                <div>
                  <h3 className="font-semibold text-[#18382D]">Your Services</h3>
                  <p className="text-sm text-gray-500">
                    {overview.totalServices} services created
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-[#B68B62]" />
                <div>
                  <h3 className="font-semibold text-[#18382D]">Booking Activity</h3>
                  <p className="text-sm text-gray-500">
                    {overview.pendingBookings + overview.acceptedBookings} active booking requests
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Booking Requests */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#18382D]">
                  Recent Booking Requests
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your latest customer booking requests
                </p>
              </div>

              <Link
                href="/vendor/bookings"
                className="text-sm font-semibold text-[#B68B62] hover:text-[#18382D]"
              >
                View All →
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-10 bg-[#FAF9F6] rounded-xl">
                <CalendarCheck size={35} className="mx-auto text-gray-400 mb-3" />
                <p className="font-semibold text-[#18382D]">
                  No Booking Requests Yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  New customer requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-[#FAF9F6] transition"
                  >
                    <div>
                      <h3 className="font-semibold text-[#18382D]">
                        {booking.service?.serviceName || "Wedding Service"}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {booking.customer?.name || "Customer"}
                        {booking.customer?.email
                          ? ` • ${booking.customer.email}`
                          : ""}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {booking.eventDate
                          ? new Date(booking.eventDate).toLocaleDateString()
                          : "Date not specified"}
                        {" • "}
                        {booking.eventLocation || "Location not specified"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-full text-xs font-semibold capitalize ${
                          booking.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.status}
                      </span>

                      {booking.status === "pending" && (
                        <>
                          <button
                            disabled={actionLoading === booking._id}
                            onClick={() =>
                              handleBookingAction(booking._id, "accepted")
                            }
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? "..." : "Accept"}
                          </button>

                          <button
                            disabled={actionLoading === booking._id}
                            onClick={() =>
                              handleBookingAction(booking._id, "rejected")
                            }
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
