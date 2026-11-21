
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/get-token";

interface Overview {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

interface Booking {
  _id: string;
  eventDate: string;
  eventLocation: string;
  status: string;
  service?: {
    serviceName?: string;
    category?: string;
    price?: number;
  };
}

export default function CustomerDashboard() {
  const router = useRouter();

  const [overview, setOverview] = useState<Overview>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const [overviewData, bookingData] = await Promise.all([
          api("/api/customer/overview", {}, token),
          api("/api/customer/bookings", {}, token),
        ]);

        setOverview(overviewData);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
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

    loadDashboard();
  }, [router]);

  const stats = [
    {
      title: "Total Bookings",
      value: overview.total,
      icon: CalendarDays,
      color: "text-[#244A3B]",
      bg: "bg-[#EAF0EB]",
    },
    {
      title: "Pending",
      value: overview.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Accepted",
      value: overview.accepted,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Rejected",
      value: overview.rejected,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#244A3B]" size={35} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LayoutDashboard size={17} />
            Customer Dashboard
          </div>

          <h1 className="mt-3 text-3xl font-bold text-[#18382D]">
            Welcome Back!
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your wedding service bookings from here.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#18382D]">
                      {item.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-4 ${item.bg}`}>
                    <Icon size={25} className={item.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Bookings */}
        <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#18382D]">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest booking requests.
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays
                size={45}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-[#18382D]">
                No bookings yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You have not submitted any booking requests.
              </p>

              <Link
                href="/services"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#18382D]"
              >
                Explore Services
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-[#18382D]">
                      {booking.service?.serviceName || "Wedding Service"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking.service?.category || "Service Booking"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={15} />
                        {booking.eventDate
                          ? new Date(booking.eventDate).toLocaleDateString()
                          : "Date unavailable"}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin size={15} />
                        {booking.eventLocation}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold capitalize ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
