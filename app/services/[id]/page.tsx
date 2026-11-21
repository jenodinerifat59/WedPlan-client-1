
import Image from "next/image";
import { api } from "@/lib/api";
import Link from "next/link";

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

export default async function ServiceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let service: Service | null = null;

  try {
    service = await api(`/api/services/${id}`);
  } catch {
    service = null;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Service Not Found</h1>
        <Link href="/" className="mt-4 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-[#244A3B]">
          ← Back to Home
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="relative min-h-[350px] overflow-hidden rounded-2xl">
            {service.images?.[0] && (
              <Image
                src={service.images[0]}
                alt={service.serviceName}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          <div>
            <p className="text-sm text-[#B68B62]">
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
              Vendor: {service.vendor?.businessName || service.vendor?.name || "Wedding Service Provider"}
            </p>

            <Link
  href={`/booking?serviceId=${service._id}`}
  className="mt-8 inline-flex rounded-full bg-[#244A3B] px-8 py-4 font-semibold text-white transition hover:bg-[#18382D]"
>
  Book Now →
</Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}
