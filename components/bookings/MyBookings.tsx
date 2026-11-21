
"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await getAuthToken();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch bookings");
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

    fetchBookings();
  }, []);

  if (loading) return <p className="p-8">Loading bookings...</p>;

  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#244A3B]">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">You have no bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div
              key={booking._id}
              className="rounded-xl border p-5 shadow-sm"
            >
              <p>Event Date: {booking.eventDate}</p>
              <p>Location: {booking.eventLocation}</p>
              <p>Status: {booking.status || "Pending"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
