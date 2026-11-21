
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/get-token";
import {
  CalendarDays,
  MapPin,
  RefreshCw,
  XCircle,
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
        err instanceof Error ? err.message : "Failed to load bookings"
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

      await api(
        `/api/customer/bookings/${id}/cancel`,
        { method: "PATCH" },
        token
      );

      setSuccess("Booking cancelled successfully.");
      await fetchBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cancellation failed"
      );
    } finally {
      setCancelingId(null);
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <RefreshCw className="animate-spin text-[#244A3B]" size={30} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#B68B62]">
            Customer Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#18382D]">
            My Bookings
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage your wedding service requests.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </p>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <CalendarDays
              size={45}
              className="mx-auto mb-4 text-[#B68B62]"
            />
            <h2 className="text-xl font-bold text-[#18382D]">
              No Bookings Yet
            </h2>
            <p className="mt-2 text-gray-500">
              Your booking requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#18382D]">
                      {booking.service?.serviceName || "Service"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.service?.category}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <p>
                    <CalendarDays
                      size={17}
                      className="mr-2 inline text-[#B68B62]"
                    />
                    {new Date(booking.eventDate).toLocaleDateString()}
                  </p>

                  <p>
                    <MapPin
                      size={17}
                      className="mr-2 inline text-[#B68B62]"
                    />
                    {booking.eventLocation}
                  </p>

                  <p>
                    Vendor:{" "}
                    {booking.vendor?.businessName ||
                      booking.vendor?.name ||
                      "Not available"}
                  </p>

                  {booking.message && (
                    <p className="border-t border-gray-100 pt-3">
                      Message: {booking.message}
                    </p>
                  )}
                </div>

                {booking.status === "pending" && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    disabled={cancelingId === booking._id}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    {cancelingId === booking._id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
