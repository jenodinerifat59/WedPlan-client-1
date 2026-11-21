
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/get-token";
import {
  CalendarDays,
  MapPin,
  RefreshCw,
  XCircle,
  ClipboardList,
} from "lucide-react";

interface Booking {
  _id: string;
  eventDate: string;
  eventLocation: string;
  message?: string;
  status: string;
  service?: {
    serviceName?: string;
    price?: number;
    category?: string;
  };
  vendor?: {
    name?: string;
    businessName?: string;
    email?: string;
  };
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setError("");

      const token = await getAuthToken();
      if (!token) throw new Error("Please login first.");

      const result = await api(
        "/api/customer/bookings",
        { method: "GET" },
        token
      );

      setBookings(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancelingId(id);
      setError("");
      setSuccess("");

      const token = await getAuthToken();
      if (!token) throw new Error("Please login first.");

      await api(
        `/api/customer/bookings/${id}/cancel`,
        { method: "PATCH" },
        token
      );

      setSuccess("Booking cancelled successfully.");
      await fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cancellation failed."
      );
    } finally {
      setCancelingId(null);
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700";
      case "rejected":
        return "bg-red-50 text-red-600";
      case "cancelled":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <RefreshCw
          size={28}
          className="animate-spin text-[#244A3B]"
        />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-[fadeIn_.4s_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B68B62]">
          Customer Workspace
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#18382D] sm:text-3xl">
              My Bookings
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your wedding service bookings.
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F5F1] px-4 py-3">
            <p className="text-xs text-gray-500">Total Bookings</p>
            <p className="text-xl font-bold text-[#244A3B]">
              {bookings.length}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm transition duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F5F1]">
            <ClipboardList size={30} className="text-[#244A3B]" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#18382D]">
            No Bookings Yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your booking requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {bookings.map((booking, index) => (
            <article
              key={booking._id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DCE5DD] hover:shadow-lg sm:p-6 animate-[fadeIn_.4s_ease-out_both]"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-[#18382D] transition-colors group-hover:text-[#B68B62]">
                    {booking.service?.serviceName || "Wedding Service"}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {booking.service?.category || "Service"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${statusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-gray-100" />

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#F5F6F2] p-2.5">
                    <CalendarDays size={17} className="text-[#244A3B]" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Event Date</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700">
                      {new Date(booking.eventDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#F5F6F2] p-2.5">
                    <MapPin size={17} className="text-[#244A3B]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Event Location</p>
                    <p className="mt-0.5 break-words text-sm font-medium text-gray-700">
                      {booking.eventLocation}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAFAF8] p-3">
                  <p className="text-xs text-gray-400">Service Vendor</p>
                  <p className="mt-1 text-sm font-semibold text-[#244A3B]">
                    {booking.vendor?.businessName ||
                      booking.vendor?.name ||
                      "Not available"}
                  </p>
                </div>

                {booking.message && (
                  <div>
                    <p className="text-xs text-gray-400">Your Message</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {booking.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {booking.status === "pending" && (
                <button
                  onClick={() => cancelBooking(booking._id)}
                  disabled={cancelingId === booking._id}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-3 text-sm font-semibold text-red-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelingId === booking._id ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <XCircle size={17} />
                  )}

                  {cancelingId === booking._id
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
