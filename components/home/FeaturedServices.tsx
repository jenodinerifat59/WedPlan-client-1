
import { api } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default async function FeaturedServices() {
  const services = await api("/api/services/featured").catch(() => []);

  return (
    <div className="grid gap-7 md:grid-cols-3">
      {services.map((service: any) => (
        <Link
          href={`/services/${service._id}`}
          key={service._id}
          className="group block rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#244A3B]/10"
        >
          <div className="relative mb-6 h-[330px] overflow-hidden rounded-2xl">
            <Image
              src={service.images?.[0] || "/placeholder.jpg"}
              alt={service.serviceName}
              width={500}
              height={330}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs text-[#244A3B] transition-colors duration-300 group-hover:bg-[#244A3B] group-hover:text-white">
              {service.category}
            </span>
          </div>

          <div className="px-1 pb-3">
            <p className="text-xs text-[#B68B62]">
              {service.location}
            </p>

            <h3 className="mt-2 font-heading text-2xl font-semibold transition-colors duration-300 group-hover:text-[#B68B62]">
              {service.serviceName}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#829087]">
              {service.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <p className="font-semibold">৳{service.price}</p>
              <span className="flex items-center gap-2 text-sm font-semibold text-[#244A3B] transition-all duration-300 group-hover:gap-3 group-hover:text-[#B68B62]">
                Explore <span>→</span>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
