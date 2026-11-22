
"use client";

import { getAuthToken } from "@/lib/get-token";
import { useState } from "react";

interface BookingFormProps {
  serviceId: string;
}

export default function BookingForm({ serviceId }: BookingFormProps) {
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login to continue.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId,
            eventDate,
            eventLocation,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      if (!data.url) {
        throw new Error("Payment URL was not received.");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8E3D8] bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-[#244A3B]">
        Book Your Service
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Fill in your wedding event details and continue to secure payment.
      </p>

      <form onSubmit={handleBooking} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Event Date
          </label>

          <input
            type="date"
            value={eventDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#244A3B]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Event Location
          </label>

          <input
            type="text"
            placeholder="Enter your event location"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#244A3B]"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Additional Message
          </label>

          <textarea
            rows={4}
            placeholder="Tell us about your requirements..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#244A3B]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#244A3B] px-6 py-4 font-semibold text-white transition hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting to Payment..." : "Continue to Payment"}
        </button>

        <p className="text-center text-xs text-gray-500">
          You will be redirected to Stripe to complete your full payment.
        </p>
      </form>
    </div>
  );
}
