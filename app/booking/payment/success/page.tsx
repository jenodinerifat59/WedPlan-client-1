
"use client";

import { getAuthToken } from "@/lib/get-token";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

type PaymentStatus = "loading" | "paid" | "processing" | "error";

export default function BookingPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const token = await getAuthToken();

        if (!token) {
          if (active) setStatus("error");
          return;
        }

        for (let attempt = 0; attempt < 10; attempt++) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/customer/payments/session/${sessionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Payment verification failed");
          }

          if (data.status === "paid") {
            if (active) {
              setStatus("paid");
              setBookingId(data.bookingId || "");
            }
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (active) setStatus("processing");
      } catch {
        if (active) setStatus("error");
      }
    };

    verifyPayment();

    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#F8F6F0] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">

        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#244A3B]" />
            <h1 className="mt-6 text-2xl font-bold text-[#18382D]">
              Verifying Your Payment
            </h1>
            <p className="mt-3 text-gray-500">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
            <h1 className="mt-6 text-3xl font-bold text-[#18382D]">
              Payment Successful!
            </h1>
            <p className="mt-3 text-gray-500">
              Your full booking payment has been received successfully.
            </p>
            {bookingId && (
              <p className="mt-3 break-all text-sm text-gray-400">
                Booking ID: {bookingId}
              </p>
            )}
            <Link
              href="/customer/bookings"
              className="mt-8 inline-block rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white transition hover:bg-[#18382D]"
            >
              View My Bookings
            </Link>
          </>
        )}

        {status === "processing" && (
          <>
            <Clock className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-6 text-2xl font-bold text-[#18382D]">
              Payment Processing
            </h1>
            <p className="mt-3 text-gray-500">
              Your payment confirmation is taking longer than expected.
              Please check your bookings again shortly.
            </p>
            <Link
              href="/customer/bookings"
              className="mt-8 inline-block rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white"
            >
              View My Bookings
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-bold text-[#18382D]">
              Verification Failed
            </h1>
            <p className="mt-3 text-gray-500">
              We could not verify your payment. Please check your booking
              status or contact support.
            </p>
            <Link
              href="../my-bookings"
              className="mt-8 inline-block rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white"
            >
              View My Bookings
            </Link>
          </>
        )}

      </div>
    </main>
  );
}
