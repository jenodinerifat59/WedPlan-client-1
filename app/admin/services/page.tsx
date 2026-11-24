
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
  X,
  ChevronDown,
  Sparkles,
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
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

    if (!token) {
      throw new Error("Please login first.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch services
  const fetchServices = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("q", search.trim());
        }

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
          throw new Error(
            data.message || "Failed to load services."
          );
        }

        const result: Service[] = Array.isArray(data)
          ? data
          : data.services || [];

        setServices(result);

        // Keep previously discovered categories
        setAllCategories((prev) => [
          ...new Set([
            ...prev,
            ...result
              .map((service) => service.category)
              .filter(Boolean),
          ]),
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, categoryFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchServices]);

  // Categories
  const categories = allCategories;

  // Active / Inactive filtering
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

  // Statistics
  const stats = useMemo(() => {
    return {
      total: services.length,
      pending: services.filter(
        (s) => s.status === "pending"
      ).length,
      approved: services.filter(
        (s) => s.status === "approved"
      ).length,
      rejected: services.filter(
        (s) => s.status === "rejected"
      ).length,
    };
  }, [services]);

  // Update service approval status
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
        throw new Error(
          data.message || "Failed to update service."
        );
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? { ...item, status }
            : item
        )
      );

      setSelectedService((prev) =>
        prev?._id === service._id
          ? { ...prev, status }
          : prev
      );

      setSuccess(
        data.message ||
          `Service ${action}d successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Action failed."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Activate / Deactivate service
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
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update service."
        );
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      setSelectedService((prev) =>
        prev?._id === service._id
          ? { ...prev, isActive: nextStatus }
          : prev
      );

      setSuccess(
        data.message ||
          `Service ${
            nextStatus ? "activated" : "deactivated"
          } successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Action failed."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Date formatter
  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status style
  const statusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setActiveFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#B68B62]">
              <Sparkles size={17} />
              ADMIN PANEL
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#18382D] sm:text-3xl">
              Manage Services
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review, approve and manage all vendor services.
            </p>
          </div>

          <button
            onClick={() => fetchServices(true)}
            disabled={refreshing}
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18382D] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={`transition-transform duration-500 ${
                refreshing ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh Services"}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex animate-[fadeIn_0.25s_ease-out] items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={19} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex animate-[fadeIn_0.25s_ease-out] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="shrink-0" />
            <span className="flex-1">{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 transition hover:bg-emerald-100"
            >
              <X size={17} />
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
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "bg-red-50 text-red-600",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                style={{ animationDelay: `${index * 70}ms` }}
                className="group animate-[fadeIn_0.35s_ease-out_both] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B68B62]/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {item.label}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-[#18382D] transition-colors group-hover:text-[#B68B62]">
                      {item.value.toLocaleString()}
                    </h2>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${item.color}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="animate-[fadeIn_0.5s_ease-out_both] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Filter size={18} className="text-[#B68B62]" />
            <h2 className="font-bold text-[#18382D]">
              Search & Filters
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}
            <div className="group relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#244A3B]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service name..."
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-[#244A3B] focus:bg-white focus:ring-4 focus:ring-[#244A3B]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative lg:w-56">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 py-3 pr-10 text-sm outline-none transition-all duration-300 focus:border-[#244A3B] focus:bg-white focus:ring-4 focus:ring-[#244A3B]/10"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Approval Status
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All Services", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setStatusFilter(item.value as StatusFilter)
                  }
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    statusFilter === item.value
                      ? "bg-[#244A3B] text-white shadow-md shadow-[#244A3B]/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Availability
            </p>

            <div className="flex flex-wrap gap-2">
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
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    activeFilter === item.value
                      ? "bg-[#B68B62] text-white shadow-md shadow-[#B68B62]/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(search ||
            statusFilter !== "all" ||
            activeFilter !== "all" ||
            categoryFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-red-500 transition hover:text-red-700"
            >
              <X size={14} />
              Clear all filters
            </button>
          )}
        </div>

        {/* Service List */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="font-bold text-[#18382D]">
                All Vendor Services
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredServices.length} services found
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#244A3B]/10 px-3 py-1.5 text-xs font-semibold text-[#244A3B]">
              {filteredServices.length} Results
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <Loader2
                size={32}
                className="animate-spin text-[#244A3B]"
              />
              <p className="text-sm text-gray-500">
                Loading services...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Package size={30} />
              </div>

              <h3 className="mt-4 font-bold text-[#18382D]">
                No Services Found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-400">
                No services match your current search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[#244A3B] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#18382D] hover:shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredServices.map((service, index) => (
                <div
                  key={service._id}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="group flex animate-[fadeIn_0.3s_ease-out_both] flex-col gap-4 p-5 transition-colors duration-300 hover:bg-[#FAF9F6] lg:flex-row lg:items-center"
                >
                  {/* Image */}
                  <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-36">
                    {service.images?.[0] ? (
                      <img
                        src={service.images[0]}
                        alt={service.serviceName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon size={30} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#18382D] transition-colors group-hover:text-[#B68B62]">
                        {service.serviceName}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${statusStyle(service.status)}`}
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

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span className="rounded-md bg-gray-100 px-2 py-1">
                        {service.category}
                      </span>

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
                      <Store size={14} className="text-[#B68B62]" />
                      <span>
                        {service.vendor?.businessName ||
                          service.vendor?.name ||
                          "Unknown Vendor"}
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-[#244A3B]">
                      ৳
                      {Number(service.price || 0).toLocaleString(
                        "en-BD"
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:max-w-64 lg:justify-end">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#244A3B] hover:bg-[#244A3B] hover:text-white"
                    >
                      <Eye size={15} />
                      Details
                    </button>

                    {service.status === "pending" && (
                      <>
                        <button
                          disabled={actionLoading !== ""}
                          onClick={() =>
                            updateServiceStatus(service, "approved")
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading === service._id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          disabled={actionLoading !== ""}
                          onClick={() =>
                            updateServiceStatus(service, "rejected")
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      disabled={actionLoading !== ""}
                      onClick={() =>
                        toggleActiveStatus(service)
                      }
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
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
        </section>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl animate-[modalIn_0.25s_ease-out] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-[#B68B62]">
                  <Sparkles size={14} />
                  SERVICE DETAILS
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#18382D]">
                  {selectedService.serviceName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-all duration-200 hover:rotate-90 hover:bg-red-50 hover:text-red-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* Images */}
            {selectedService.images?.length ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedService.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-xl bg-gray-100"
                  >
                    <img
                      src={image}
                      alt={`${selectedService.serviceName} ${index + 1}`}
                      className="h-32 w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex h-32 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <ImageIcon size={30} />
              </div>
            )}

            {/* Information */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Category",
                  value: selectedService.category,
                },
                {
                  label: "Price",
                  value: `৳${Number(
                    selectedService.price || 0
                  ).toLocaleString("en-BD")}`,
                },
                {
                  label: "Vendor",
                  value:
                    selectedService.vendor?.businessName ||
                    selectedService.vendor?.name ||
                    "Unknown Vendor",
                },
                {
                  label: "Location",
                  value:
                    selectedService.location || "Not provided",
                },
                {
                  label: "Approval Status",
                  value: selectedService.status,
                },
                {
                  label: "Availability",
                  value: selectedService.isActive
                    ? "Active"
                    : "Inactive",
                },
                {
                  label: "Created At",
                  value: formatDate(selectedService.createdAt),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-100 bg-[#FAF9F6] p-4 transition-all duration-200 hover:border-[#B68B62]/40 hover:bg-white"
                >
                  <p className="text-xs text-gray-500">
                    {item.label}
                  </p>

                  <p className="mt-1 font-semibold capitalize text-[#18382D]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-4 rounded-xl border border-gray-100 bg-[#FAF9F6] p-4">
              <p className="text-xs font-semibold text-gray-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {selectedService.description ||
                  "No description provided."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedService.status === "pending" && (
                <>
                  <button
                    disabled={actionLoading !== ""}
                    onClick={() =>
                      updateServiceStatus(
                        selectedService,
                        "approved"
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedService._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Approve Service
                  </button>

                  <button
                    disabled={actionLoading !== ""}
                    onClick={() =>
                      updateServiceStatus(
                        selectedService,
                        "rejected"
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject Service
                  </button>
                </>
              )}

              <button
                disabled={actionLoading !== ""}
                onClick={() =>
                  toggleActiveStatus(selectedService)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#244A3B] transition-all duration-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <Power size={16} />
                {selectedService.isActive
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
