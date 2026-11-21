
"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token";
import {
  CalendarDays,
  MapPin,
  Mail,
  UserRound,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface Booking {
  _id: string;
  eventDate: string;
  eventLocation: string;
  status: string;
  message?: string;
  service?: {
    serviceName?: string;
  };
  customer?: {
    name?: string;
    email?: string;
  };
}

export default function VendorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      // Backend returns a direct array
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (
    bookingId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      setSuccess("");

      const token = await getAuthToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking");
      }

      setSuccess(data.message || `Booking ${status} successfully`);

      await fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#244A3B]/20 border-t-[#244A3B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">

      {/* Messages */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Booking Summary */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Requests</p>
          <h2 className="mt-2 text-3xl font-bold text-[#18382D]">
            {bookings.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {bookings.filter((b) => b.status === "pending").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Accepted Bookings</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {bookings.filter((b) => b.status === "accepted").length}
          </h2>
        </div>

      </div>

      {/* Section Heading */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#18382D]">
            Customer Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage your booking requests.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#244A3B] transition hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />

          <h3 className="mt-4 text-lg font-semibold text-[#18382D]">
            No Booking Requests Yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Customer booking requests will appear here.
          </p>
        </div>
      ) : (

        /* Booking Cards */
        <div className="grid gap-5 lg:grid-cols-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#B68B62]">
                    Booking Request
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-[#18382D]">
                    {booking.service?.serviceName || "Service"}
                  </h3>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    booking.status === "accepted"
                      ? "bg-green-50 text-green-700"
                      : booking.status === "rejected"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="space-y-4 p-5">

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#244A3B]/10 p-2.5 text-[#244A3B]">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-semibold text-[#18382D]">
                      {booking.customer?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#B68B62]/10 p-2.5 text-[#B68B62]">
                    <Mail size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="break-all text-sm font-medium text-gray-700">
                      {booking.customer?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Event Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {booking.eventDate
                        ? new Date(booking.eventDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Event Location</p>
                    <p className="text-sm font-medium text-gray-700">
                      {booking.eventLocation || "Not specified"}
                    </p>
                  </div>
                </div>

                {booking.message && (
                  <div className="rounded-xl bg-[#F8F6F0] p-4">
                    <div className="mb-2 flex items-center gap-2 text-[#244A3B]">
                      <MessageSquare size={16} />
                      <p className="text-sm font-semibold">
                        Customer Message
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {booking.message}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {booking.status === "pending" && (
                  <div className="flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() =>
                        updateStatus(booking._id, "accepted")
                      }
                      disabled={updatingId === booking._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#244A3B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-50"
                    >
                      <CheckCircle2 size={17} />
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Accept"}
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(booking._id, "rejected")
                      }
                      disabled={updatingId === booking._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>
                  </div>
                )}

                {booking.status !== "pending" && (
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    {booking.status === "accepted" ? (
                      <CheckCircle2 size={17} className="text-green-600" />
                    ) : (
                      <XCircle size={17} className="text-red-500" />
                    )}

                    This request has been {booking.status}.
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
