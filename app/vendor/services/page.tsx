
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  Pencil,
  MapPin,
  Tag,
  ArrowUpRight,
  ImageIcon,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import { getAuthToken } from "@/lib/get-token";
import { api } from "@/lib/api";

interface Service {
  _id: string;
  title: string;
  serviceName?: string;
  category: string;
  location: string;
  price: number;
  description: string;
  status: string;
  isActive: boolean;
  images?: string[];
}

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const result = await api(
        "/api/vendor/services",
        { method: "GET" },
        token
      );

      setServices(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const deleteService = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = await getAuthToken();

      await api(
        `/api/vendor/services/${id}`,
        { method: "DELETE" },
        token
      );

      setServices((previous) =>
        previous.filter((service) => service._id !== id)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete service"
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#18382D]">
            My Services
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your wedding services.
          </p>
        </div>

        <button
          onClick={fetchServices}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#18382D] px-4 py-2 text-[#18382D] transition hover:bg-[#18382D] hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-16 text-center text-gray-500">
          Loading your services...
        </p>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
          {error}

          <button
            onClick={fetchServices}
            className="ml-2 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && services.length === 0 && (
        <div className="mt-8 rounded-xl border bg-white p-10 text-center">
          <BriefcaseBusiness
            size={45}
            className="mx-auto text-[#B68B62]"
          />

          <h2 className="mt-4 text-xl font-semibold text-[#18382D]">
            No Services Found
          </h2>

          <p className="mt-2 text-gray-500">
            You have not added any services yet.
          </p>
        </div>
      )}

      {/* Services Grid */}
      {!loading && !error && services.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const serviceTitle =
              service.title || service.serviceName || "Untitled Service";

            const serviceImages = Array.isArray(service.images)
              ? service.images
              : [];

            return (
              <div
                key={service._id}
                className="group overflow-hidden rounded-2xl border border-[#EAE8E0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Service Image */}
                <div className="relative h-52 overflow-hidden bg-[#F1F0EA]">
                  {serviceImages[0] ? (
                    <img
                      src={serviceImages[0]}
                      alt={serviceTitle}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        size={45}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold capitalize backdrop-blur-md ${
                      service.status === "approved"
                        ? "bg-green-100/95 text-green-800"
                        : service.status === "pending"
                          ? "bg-amber-100/95 text-amber-800"
                          : "bg-red-100/95 text-red-700"
                    }`}
                  >
                    {service.status}
                  </span>

                  {/* Active Status */}
                  <span
                    className={`absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs font-medium ${
                      service.isActive
                        ? "bg-[#18382D]/90 text-white"
                        : "bg-gray-800/80 text-white"
                    }`}
                  >
                    {service.isActive ? "● Active" : "● Inactive"}
                  </span>
                </div>

                {/* Service Details */}
                <div className="p-5">
                  {/* Category */}
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#B68B62]">
                    <Tag size={14} />
                    <span>{service.category}</span>
                  </div>

                  {/* Title */}
                  <h2 className="line-clamp-1 text-xl font-bold text-[#18382D] transition-colors group-hover:text-[#B68B62]">
                    {serviceTitle}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500">
                    {service.description}
                  </p>

                  {/* Location */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin
                      size={16}
                      className="shrink-0 text-[#B68B62]"
                    />
                    <span className="truncate">
                      {service.location}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F8F6F0] p-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Service Price
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#18382D]">
                        ৳{Number(service.price || 0).toLocaleString("en-BD")}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EFE9]">
                      <ArrowUpRight
                        className="text-[#244A3B]"
                        size={20}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={`/vendor/services/edit/${service._id}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#18382D] py-2.5 text-sm font-medium text-white transition hover:bg-[#244A3B]"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteService(service._id)}
                      disabled={deletingId === service._id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />

                      {deletingId === service._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
