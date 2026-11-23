
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { api } from "@/lib/api";

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendor?: {
    name: string;
    businessName?: string;
  };
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0]">
      <p className="text-[#244A3B]">
        Loading service details...
      </p>
    </div>
  );
}

async function ServiceDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

  let service: Service | null = null;

  try {
    service = await api(`/api/services/${id}`);
  } catch (error) {
    console.error("Service fetch error:", error);
  }

  if (!service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F0]">
        <h1 className="text-2xl font-bold text-[#244A3B]">
          Service Not Found
        </h1>

        <Link
          href="/"
          className="mt-4 text-[#244A3B] underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-[#244A3B] transition hover:text-[#B68B62]"
        >
          ← Back to Home
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="relative min-h-[350px] overflow-hidden rounded-2xl bg-gray-100">
            {service.images?.length > 0 && (
              <Image
                src={service.images[0]}
                alt={service.serviceName}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-[#B68B62]">
              {service.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold text-[#244A3B]">
              {service.serviceName}
            </h1>

            <p className="mt-5 leading-7 text-gray-600">
              {service.description}
            </p>

            <p className="mt-6 text-gray-600">
              Location: {service.location}
            </p>

            <p className="mt-4 text-2xl font-bold text-[#244A3B]">
              ৳{service.price}
            </p>

            <p className="mt-6 text-sm text-gray-500">
              Vendor:{" "}
              {service.vendor?.businessName ||
                service.vendor?.name ||
                "Wedding Service Provider"}
            </p>

            <Link
              href={`/booking?serviceId=${service._id}`}
              className="mt-8 inline-flex rounded-full bg-[#244A3B] px-8 py-4 font-semibold text-white transition duration-300 hover:bg-[#18382D] hover:shadow-lg"
            >
              Book Now →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}
