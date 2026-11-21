
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Camera,
  Building2,
  Flower2,
  Utensils,
  Sparkles,
  Shirt,
  RefreshCw,
  SearchX,
} from "lucide-react";

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images?: string[];
  vendor?: {
    name?: string;
    businessName?: string;
  };
}

interface ServicesResponse {
  items: Service[];
  total: number;
  page: number;
  pages: number;
}

const categories = [
  { name: "All Services", icon: Sparkles },
  { name: "Photography & Videography", icon: Camera },
  { name: "Wedding Venues", icon: Building2 },
  { name: "Decoration & Florist", icon: Flower2 },
  { name: "Catering Services", icon: Utensils },
  { name: "Makeup & Styling", icon: Sparkles },
  { name: "Wedding Fashion", icon: Shirt },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Services");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (category !== "All Services") {
        params.set("category", category);
      }

      if (sort === "low" || sort === "high") {
        params.set("sort", "price");
        params.set("order", sort === "low" ? "asc" : "desc");
      }

      const firstPage: ServicesResponse = await api(
        `/api/services?${params.toString()}`
      );

      let allServices = firstPage.items || [];

      // Load remaining pages
      for (let page = 2; page <= firstPage.pages; page++) {
        params.set("page", String(page));

        const result: ServicesResponse = await api(
          `/api/services?${params.toString()}`
        );

        allServices = [...allServices, ...(result.items || [])];
      }

      setServices(allServices);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchServices]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-9 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B68B62]">
            Find Your Perfect Match
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#18382D] sm:text-4xl">
            Explore Wedding Services
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Discover trusted professionals and everything you need
            to make your special day unforgettable.
          </p>
        </div>

        {/* Search and Sorting */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wedding services..."
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
              />
            </div>

            {/* Sorting */}
            <div className="relative md:w-60">
              <ArrowUpDown
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#244A3B]"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-[#FAF9F6] py-3.5 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#244A3B]"
              >
                <option value="newest">Newest First</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mb-9">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#244A3B]" />
            <h2 className="text-sm font-bold text-[#18382D]">
              Browse Categories
            </h2>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-3">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = category === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                    active
                      ? "border-[#244A3B] bg-[#244A3B] text-white shadow-md shadow-[#244A3B]/10"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#244A3B]/40 hover:bg-[#F3F5F1] hover:text-[#244A3B]"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Services Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#18382D]">
              {category === "All Services" ? "All Services" : category}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {loading
                ? "Finding services..."
                : `${services.length} services found`}
            </p>
          </div>

          {category !== "All Services" && (
            <button
              onClick={() => setCategory("All Services")}
              className="text-xs font-semibold text-[#244A3B] hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-[#244A3B]"
            />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white py-14 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchServices}
              className="mt-4 rounded-lg bg-[#244A3B] px-5 py-2 text-sm text-white transition hover:bg-[#18382D]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <SearchX
              size={38}
              className="mx-auto text-gray-300"
            />
            <h3 className="mt-4 text-lg font-bold text-[#18382D]">
              No Services Found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or choose a different category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All Services");
                setSort("newest");
              }}
              className="mt-5 text-sm font-semibold text-[#244A3B] hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && services.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service, index) => (
              <article
                key={service._id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DCE5DD] hover:shadow-xl animate-[fadeUp_.45s_ease-out_both]"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#F1F2ED]">
                  {service.images?.[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.serviceName}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Sparkles
                        size={40}
                        className="text-[#B68B62]"
                      />
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-[#244A3B] shadow-sm">
                    {service.category}
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-base font-bold text-[#18382D] transition-colors group-hover:text-[#B68B62]">
                      {service.serviceName}
                    </h3>

                    <Heart
                      size={17}
                      className="shrink-0 text-gray-300 transition-colors group-hover:text-[#B68B62]"
                    />
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={14} className="text-[#B68B62]" />
                    <span className="truncate">
                      {service.location}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-2 min-h-9 text-xs leading-5 text-gray-400">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400">
                        Starting from
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-[#244A3B]">
                        ৳{Number(service.price).toLocaleString("en-BD")}
                      </p>
                    </div>

                    <Link
                      href={`/services/${service._id}`}
                      className="rounded-lg bg-[#244A3B] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#18382D] active:scale-95"
                    >
                      View Details
                    </Link>
                  </div>

                  <p className="mt-3 truncate text-[11px] text-gray-400">
                    By{" "}
                    <span className="font-medium text-gray-600">
                      {service.vendor?.businessName ||
                        service.vendor?.name ||
                        "Wedding Professional"}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
