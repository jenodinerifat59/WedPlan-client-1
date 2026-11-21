
"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

interface Overview {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  plan: string;
}

export default function VendorDashboard() {
  const [overview, setOverview] = useState<Overview>({
    totalServices: 0,
    activeServices: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    plan: "free",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        err instanceof Error
          ? err.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
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

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#18382D] text-white px-5 py-3 rounded-xl hover:bg-[#244A3B] transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
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

      {/* Statistics Cards */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${item.accent}`}
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {item.title}
                      </p>

                      <h2 className="text-4xl font-bold text-[#18382D] mt-4">
                        {item.value}
                      </h2>
                    </div>

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        size={26}
                        className={item.iconColor}
                      />
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
                  <p className="text-xs text-white/60">
                    Current Plan
                  </p>
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
                <div className="w-11 h-11 rounded-xl bg-[#E8EFE9] flex items-center justify-center">
                  <BriefcaseBusiness className="text-[#244A3B]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#18382D]">
                    Your Services
                  </h3>
                  <p className="text-sm text-gray-500">
                    {overview.totalServices} services created
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FBF0E3] flex items-center justify-center">
                  <CalendarCheck className="text-[#B68B62]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#18382D]">
                    Booking Activity
                  </h3>
                  <p className="text-sm text-gray-500">
                    {overview.pendingBookings + overview.acceptedBookings} active booking requests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
