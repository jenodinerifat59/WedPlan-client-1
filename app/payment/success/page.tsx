
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Crown,
  ArrowRight,
  CreditCard,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AUTH_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  "http://localhost:3000";

type PaymentState = "checking" | "success" | "failed" | "error";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<PaymentState>("checking");
  const [message, setMessage] = useState(
    "We are verifying your payment..."
  );
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verifyPayment = useCallback(async () => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("Payment session ID was not found.");
      return;
    }

    if (!API_URL) {
      setStatus("error");
      setMessage("Backend API URL is missing.");
      return;
    }

    try {
      setLoading(true);
      setStatus("checking");
      setMessage("Verifying your payment. Please wait...");

      const tokenResponse = await fetch(
        `${AUTH_URL}/api/auth/token`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!tokenResponse.ok) {
        throw new Error("Unable to authenticate your account.");
      }

      const tokenData = await tokenResponse.json();

      if (!tokenData.token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/payments/session/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from payment server.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Payment verification failed."
        );
      }

      console.log("Payment Verification Response:", data);

      setPaymentDetails(data);

      const paymentStatus = String(
        data.payment_status ||
        data.paymentStatus ||
        data.status ||
        ""
      ).toLowerCase();

      if (
        paymentStatus === "paid" ||
        paymentStatus === "succeeded" ||
        data.plan?.toLowerCase() === "premium"
      ) {
        setStatus("success");
        setMessage("Your payment was completed successfully!");
        attemptsRef.current = 0;
      } else if (
        paymentStatus === "unpaid" ||
        paymentStatus === "failed" ||
        paymentStatus === "canceled" ||
        paymentStatus === "cancelled" ||
        paymentStatus === "expired"
      ) {
        setStatus("failed");
        setMessage("Your payment has not been completed.");
        attemptsRef.current = 0;
      } else if (
        paymentStatus === "processing" ||
        paymentStatus === "pending"
      ) {
        attemptsRef.current += 1;

        if (attemptsRef.current < 6) {
          setStatus("checking");
          setMessage(
            `Your payment is being processed. Checking again (${attemptsRef.current}/6)...`
          );

          timerRef.current = setTimeout(() => {
            verifyPayment();
          }, 5000);
        } else {
          setStatus("error");
          setMessage(
            "Payment is still processing. Please check again in a moment. Do not make another payment."
          );
        }
      } else {
        setStatus("error");
        setMessage(
          `Unknown payment status: ${paymentStatus || "Not found"}`
        );
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);

      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    verifyPayment();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRetry = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    attemptsRef.current = 0;
    verifyPayment();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8F7F3] px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#18382D] to-[#315B47] px-6 py-9 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <Crown size={34} className="text-[#E4C49E]" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            WedPlan Premium
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Subscription Payment Verification
          </p>
        </div>

        {/* Payment Status */}
        <div className="px-7 py-10 text-center">

          {status === "checking" && (
            <>
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#244A3B]" />

              <h2 className="mt-5 text-2xl font-bold text-[#18382D]">
                Verifying Payment
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {message}
              </p>

              <p className="mt-3 text-xs text-gray-400">
                Please do not close this page.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

              <h2 className="mt-5 text-2xl font-bold text-green-700">
                Payment Successful!
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {message}
              </p>

              <div className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-5 text-left">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-green-600" />

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Payment Status
                    </p>

                    <p className="text-sm text-green-700">
                      {paymentDetails?.payment_status ||
                        paymentDetails?.paymentStatus ||
                        paymentDetails?.status ||
                        "Paid"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Crown className="text-green-600" />

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Subscription Plan
                    </p>

                    <p className="text-sm capitalize text-green-700">
                      {paymentDetails?.plan || "Premium"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/vendor/profile"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18382D] px-6 py-4 font-semibold text-white transition hover:bg-[#244A3B]"
              >
                Go to Vendor Profile
                <ArrowRight size={18} />
              </Link>
            </>
          )}

          {(status === "failed" || status === "error") && (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500" />

              <h2 className="mt-5 text-2xl font-bold text-red-700">
                {status === "failed"
                  ? "Payment Not Completed"
                  : "Verification Error"}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {message}
              </p>

              <button
                onClick={handleRetry}
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18382D] px-6 py-4 font-semibold text-white transition hover:bg-[#244A3B] disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Check Payment Again
              </button>

              <Link
                href="/vendor/profile"
                className="mt-4 block text-sm font-medium text-[#244A3B] hover:underline"
              >
                Back to Vendor Profile
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-5 text-center">
          <p className="text-xs text-gray-400">
            Secure payment processing powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
