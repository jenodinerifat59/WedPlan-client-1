
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  ArrowRight,
  CalendarCheck,
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

const initialOverview: Overview = {
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function CustomerDashboard() {
  const router = useRouter();

  const [overview, setOverview] = useState(initialOverview);
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
            : "Unable to load dashboard."
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
      iconColor: "text-[#244A3B]",
      iconBg: "bg-[#EAF0EB]",
    },
    {
      title: "Pending",
      value: overview.pending,
      icon: Clock3,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      title: "Accepted",
      value: overview.accepted,
      icon: CheckCircle2,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      title: "Rejected",
      value: overview.rejected,
      icon: XCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <Loader2
          size={36}
          className="animate-spin text-[#244A3B]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#B68B62]">
            YOUR WEDDING JOURNEY
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#18382D]">
            Welcome Back!
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Keep track of your bookings and plan your special day.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D]"
        >
          Explore Services
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-[#18382D]">
                    {item.value}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${item.iconBg}`}>
                  <Icon size={25} className={item.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#18382D]">
              Recent Bookings
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Overview of your latest booking requests.
            </p>
          </div>

          <Link
            href="/customer/bookings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#244A3B] transition hover:text-[#B68B62]"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-[#F8F6F0] p-5">
              <CalendarCheck
                size={35}
                className="text-[#244A3B]"
              />
            </div>

            <h4 className="mt-4 font-semibold text-[#18382D]">
              No bookings yet
            </h4>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              You haven't made any booking requests yet.
              Start exploring services for your special day.
            </p>

            <Link
              href="/services"
              className="mt-5 rounded-full bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D]"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-[#DCE5DD] sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-[#18382D]">
                    {booking.service?.serviceName || "Wedding Service"}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    {booking.service?.category || "Service Booking"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {booking.eventDate
                        ? new Date(booking.eventDate).toLocaleDateString()
                        : "Date unavailable"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {booking.eventLocation || "Location unavailable"}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                    statusStyles[booking.status] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {booking.status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
