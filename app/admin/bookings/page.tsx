
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  BriefcaseBusiness,
  MapPin,
  Tag,
  DollarSign,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

type Service = {
  _id: string;
  serviceName?: string;
  name?: string;
  category?: string;
  price?: number | string;
  location?: string;
  description?: string;
  image?: string;
  images?: string[];
  status?: string;
  vendor?: {
    name?: string;
    email?: string;
  };
  vendorName?: string;
  vendorEmail?: string;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = await getAuthToken();
      const params = new URLSearchParams();

      if (search.trim()) params.set("q", search.trim());
      if (status !== "all") params.set("status", status);

      const response = await fetch(
        `${API_URL}/api/admin/services?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load services.");
      }

      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const updateStatus = async (
    serviceId: string,
    nextStatus: "approved" | "rejected"
  ) => {
    if (!window.confirm(`Are you sure you want to ${nextStatus} this service?`)) {
      return;
    }

    try {
      setUpdating(serviceId);
      setMessage("");

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/services/${serviceId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update service.");
      }

      setMessage(data.message || "Service updated successfully.");
      await fetchServices();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdating(null);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this service?")) {
      return;
    }

    try {
      setUpdating(serviceId);
      setMessage("");

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete service.");
      }

      setServices((previous) =>
        previous.filter((service) => service._id !== serviceId)
      );

      setMessage(data.message || "Service deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdating(null);
    }
  };

  const getImage = (service: Service) =>
    service.image || service.images?.[0] || "";

  const getServiceName = (service: Service) =>
    service.serviceName || service.name || "Untitled Service";

  const statusStyle = (value?: string) => {
    switch (value) {
      case "approved":
        return "bg-emerald-50 text-emerald-700";
      case "rejected":
        return "bg-red-50 text-red-600";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold tracking-wider text-[#B68B62]">
            PLATFORM MANAGEMENT
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#18382D]">
            Manage Services
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review, approve and manage vendor services.
          </p>
        </div>

        <button
          onClick={fetchServices}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#18382D] transition hover:bg-gray-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#244A3B]"
        >
          <option value="all">All Services</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {message && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-[#244A3B]">
          {message}
        </div>
      )}

      {/* Service List */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoaderCircle size={32} className="animate-spin text-[#244A3B]" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
          <BriefcaseBusiness size={42} className="mx-auto text-gray-300" />
          <h3 className="mt-4 font-semibold text-gray-700">
            No services found
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Try another search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {services.map((service) => {
            const image = getImage(service);
            const name = getServiceName(service);

            return (
              <div
                key={service._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="h-52 bg-[#F0F1EC] sm:h-auto sm:w-44 sm:shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-44 items-center justify-center text-gray-300">
                        <BriefcaseBusiness size={42} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Tag size={13} />
                        {service.category || "Uncategorized"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(service.status)}`}
                      >
                        {service.status || "pending"}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[#18382D]">
                      {name}
                    </h2>

                    {service.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {service.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {service.price ?? "Price not set"}
                      </span>

                      {service.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {service.location}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400">Service Vendor</p>
                      <p className="mt-1 text-sm font-semibold text-[#18382D]">
                        {service.vendor?.name ||
                          service.vendorName ||
                          "Vendor"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {service.vendor?.email || service.vendorEmail || ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.status !== "approved" && (
                        <button
                          onClick={() =>
                            updateStatus(service._id, "approved")
                          }
                          disabled={updating === service._id}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />
                          Approve
                        </button>
                      )}

                      {service.status !== "rejected" && (
                        <button
                          onClick={() =>
                            updateStatus(service._id, "rejected")
                          }
                          disabled={updating === service._id}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => deleteService(service._id)}
                        disabled={updating === service._id}
                        className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {updating === service._id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
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
