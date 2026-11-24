
import { Suspense } from "react";
import BookingPaymentSuccessContent from "./BookingPaymentSuccessContent";

function PaymentLoading() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#F8F6F0] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#244A3B] border-t-transparent" />
        <h1 className="mt-6 text-2xl font-bold text-[#18382D]">
          Loading Payment Status
        </h1>
        <p className="mt-3 text-gray-500">
          Please wait...
        </p>
      </div>
    </main>
  );
}

export default function BookingPaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <BookingPaymentSuccessContent />
    </Suspense>
  );
}
