
"use client";

import { getAuthToken } from "@/lib/get-token";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  serviceId: string;
}

export default function BookingForm({ serviceId }: BookingFormProps) {
  const router = useRouter();

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Get Better Auth JWT
      const token = await getAuthToken();

      // 2. Send booking data to backend
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

      setSuccess("Your booking has been submitted successfully!");

      setEventDate("");
      setEventLocation("");
      setMessage("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-[#244A3B]">
        Book Your Service
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Fill in your wedding event details.
      </p>

      <form onSubmit={handleBooking} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Date
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#244A3B]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Location
          </label>
          <input
            type="text"
            placeholder="Enter your event location"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#244A3B]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Additional Message
          </label>
          <textarea
            rows={4}
            placeholder="Tell us about your requirements..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#244A3B] px-6 py-4 font-semibold text-white transition hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
