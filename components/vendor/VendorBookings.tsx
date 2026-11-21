
"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token";

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
      const token = await getAuthToken();

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

      setBookings(data.bookings || []);
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`,
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
    return <p className="p-8">Loading bookings...</p>;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#244A3B]">
        Vendor Bookings
      </h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          {success}
        </p>
      )}

      {bookings.length === 0 ? (
        <p>No booking requests yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#244A3B]">
                {booking.service?.serviceName || "Service"}
              </h2>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p>
                  Customer: {booking.customer?.name || "Unknown"}
                </p>

                <p>
                  Email: {booking.customer?.email || "N/A"}
                </p>

                <p>
                  Event Date:{" "}
                  {new Date(booking.eventDate).toLocaleDateString()}
                </p>

                <p>Location: {booking.eventLocation}</p>

                {booking.message && (
                  <p>Message: {booking.message}</p>
                )}

                <p>
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {booking.status}
                  </span>
                </p>
              </div>

              {booking.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      updateStatus(booking._id, "accepted")
                    }
                    disabled={updatingId === booking._id}
                    className="rounded-full bg-[#244A3B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#18382D] disabled:opacity-50"
                  >
                    {updatingId === booking._id
                      ? "Updating..."
                      : "Accept"}
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(booking._id, "rejected")
                    }
                    disabled={updatingId === booking._id}
                    className="rounded-full bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
