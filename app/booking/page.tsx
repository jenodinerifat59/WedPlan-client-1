
import { Suspense } from "react";
import BookingForm from "./BookingForm";

function BookingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0]">
      <p className="text-[#244A3B]">Loading booking page...</p>
    </div>
  );
}

async function BookingContent({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;

  if (!serviceId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#244A3B]">
            Service ID is missing!
          </h1>

          <p className="mt-3 text-gray-500">
            Please select a service before booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-6 py-16">
      <BookingForm serviceId={serviceId} />
    </main>
  );
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingContent searchParams={searchParams} />
    </Suspense>
  );
}
