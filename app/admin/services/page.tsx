
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Power,
  Package,
  Filter,
  Store,
  MapPin,
  CalendarDays,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description?: string;
  price: number;
  location?: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt?: string;
  vendor?: {
    _id?: string;
    name?: string;
    businessName?: string;
    image?: string;
  };
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type ActiveFilter = "all" | "active" | "inactive";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getHeaders = async () => {
    const token = await getAuthToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/services?${params.toString()}`,
        {
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load services");
      }

      setServices(Array.isArray(data) ? data : data.services || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchServices]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (
        activeFilter === "active" &&
        service.isActive !== true
      ) {
        return false;
      }

      if (
        activeFilter === "inactive" &&
        service.isActive !== false
      ) {
        return false;
      }

      return true;
    });
  }, [services, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: services.length,
      pending: services.filter((s) => s.status === "pending").length,
      approved: services.filter((s) => s.status === "approved").length,
      rejected: services.filter((s) => s.status === "rejected").length,
    };
  }, [services]);

  const updateServiceStatus = async (
    service: Service,
    status: "approved" | "rejected"
  ) => {
    const action = status === "approved" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${service.serviceName}"?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(service._id);
      setError("");
      setSuccess("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/services/${service._id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update service");
      }

      setSuccess(data.message || "Service status updated");
      await fetchServices();

      if (selectedService?._id === service._id) {
        setSelectedService({
          ...service,
          status,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Action failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  const toggleActiveStatus = async (service: Service) => {
    const nextStatus = !service.isActive;

    if (
      !window.confirm(
        `Are you sure you want to ${
          nextStatus ? "activate" : "deactivate"
        } "${service.serviceName}"?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(service._id);
      setError("");
      setSuccess("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/admin/services/${service._id}/active`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update service");
      }

      setSuccess(data.message || "Service updated");
      await fetchServices();

      if (selectedService?._id === service._id) {
        setSelectedService({
          ...service,
          isActive: nextStatus,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Action failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#B68B62]">
              ADMIN PANEL
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#18382D] sm:text-3xl">
              Manage Services
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Review, approve and manage vendor services.
            </p>
          </div>

          <button
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {success}
            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            {
              label: "Total Services",
              value: stats.total,
              icon: Package,
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Clock,
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: CheckCircle2,
              color: "bg-green-50 text-green-600",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "bg-red-50 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {item.label}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[#18382D]">
                      {item.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service name..."
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#244A3B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={17} className="text-gray-400" />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#244A3B] sm:min-w-40"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approval filter */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setStatusFilter(item.value as StatusFilter)
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === item.value
                    ? "bg-[#244A3B] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Active filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "All Availability", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setActiveFilter(item.value as ActiveFilter)
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === item.value
                    ? "bg-[#B68B62] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Service list */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-[#18382D]">
                All Vendor Services
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredServices.length} services
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
              <Loader2 size={22} className="animate-spin" />
              Loading services...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <Package size={40} className="text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-700">
                No services found
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-[#FAF9F6]/70 lg:flex-row lg:items-center"
                >
                  {/* Image */}
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-32">
                    {service.images?.[0] ? (
                      <img
                        src={service.images[0]}
                        alt={service.serviceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon size={26} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#18382D]">
                        {service.serviceName}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${statusStyle(service.status)}`}
                      >
                        {service.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span>{service.category}</span>

                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {service.location || "Location not provided"}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {formatDate(service.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Store size={14} />
                      <span>
                        {service.vendor?.businessName ||
                          service.vendor?.name ||
                          "Unknown Vendor"}
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-[#244A3B]">
                      ৳{Number(service.price || 0).toLocaleString("en-BD")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                      <Eye size={15} />
                      Details
                    </button>

                    {service.status === "pending" && (
                      <>
                        <button
                          disabled={actionLoading === service._id}
                          onClick={() =>
                            updateServiceStatus(service, "approved")
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === service._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          disabled={actionLoading === service._id}
                          onClick={() =>
                            updateServiceStatus(service, "rejected")
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      disabled={actionLoading === service._id}
                      onClick={() => toggleActiveStatus(service)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                        service.isActive
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <Power size={14} />
                      {service.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#B68B62]">
                  SERVICE DETAILS
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#18382D]">
                  {selectedService.serviceName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {selectedService.images?.length ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedService.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${selectedService.serviceName} ${index + 1}`}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Category</p>
                <p className="mt-1 font-semibold text-[#18382D]">
                  {selectedService.category}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Price</p>
                <p className="mt-1 font-semibold text-[#18382D]">
                  ৳{Number(selectedService.price || 0).toLocaleString("en-BD")}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Vendor</p>
                <p className="mt-1 font-semibold text-[#18382D]">
                  {selectedService.vendor?.businessName ||
                    selectedService.vendor?.name ||
                    "Unknown Vendor"}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Location</p>
                <p className="mt-1 font-semibold text-[#18382D]">
                  {selectedService.location || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Approval Status</p>
                <p className="mt-1 font-semibold capitalize text-[#18382D]">
                  {selectedService.status}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Availability</p>
                <p className="mt-1 font-semibold text-[#18382D]">
                  {selectedService.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#FAF9F6] p-4">
              <p className="text-xs text-gray-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {selectedService.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
