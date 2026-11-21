
"use client";

import { getAuthToken } from "@/lib/get-token";

import { useState } from "react";

interface BookingFormProps {
  serviceId: string;
}

export default function BookingForm({ serviceId }: BookingFormProps) {


    const testToken = async () => {
  try {
    const token = await getAuthToken();
    console.log("JWT Token:", token);
  } catch (error) {
    console.error(error);
  }
};

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-[#244A3B]">
        Book Your Service
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Fill in your wedding event details.
      </p>

      <form className="mt-8 space-y-6">
        <input type="hidden" value={serviceId} />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Date
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
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

        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-gray-400 px-6 py-4 font-semibold text-white"
        >
          Booking submission — coming next
        </button>

        <button type="button" onClick={testToken}>
  Test JWT
</button>
      </form>
    </div>
  );
}
