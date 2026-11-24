
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CalendarDays,
  MapPin,
  UserRound,
  Store,
  Eye,
  X,
  Loader2,
  AlertCircle,
  ClipboardList,
  Save,
  CheckCircle2,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Booking = {
  _id: string;
  serviceId?: string;
  customerId?: string;
  vendorId?: string;
  eventDate?: string;
  eventLocation?: string;
  message?: string;
  status: string;
  createdAt?: string;
  service?: {
    serviceName?: string;
    category?: string;
    price?: number | string;
    image?: string;
  };
  customer?: {
    name?: string;
    email?: string;
  };
  vendor?: {
    name?: string;
    email?: string;
    businessName?: string;
  };
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  approved: "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const availableStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const statusOptions = [
  { label: "All Bookings", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
      }

      const params = new URLSearchParams();

      if (status !== "all") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("q", search.trim());
      }

      const response = await fetch(
        `${API_URL}/api/admin/bookings?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      const result = Array.isArray(data) ? data : [];

      setBookings(result);

      if (selectedBooking) {
        const updated = result.find(
          (item: Booking) => item._id === selectedBooking._id
        );

        if (updated) {
          setSelectedBooking(updated);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status, search, selectedBooking]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 350);

    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter(
        (b) => ["confirmed", "approved"].includes(b.status)
      ).length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusStyle = (value: string) => {
    return (
      statusStyles[value?.toLowerCase()] ||
      "bg-gray-100 text-gray-600 border-gray-200"
    );
  };

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setUpdateStatus(booking.status);
    setError("");
    setSuccessMessage("");
  };

  const closeDetails = () => {
    if (updating) return;

    setSelectedBooking(null);
    setSuccessMessage("");
    setError("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !updateStatus) return;

    if (!availableStatuses.includes(updateStatus)) {
      setError("Please select a valid booking status.");
      return;
    }

    if (updateStatus === selectedBooking.status) {
      setError("Please select a different status.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to change this booking to "${updateStatus}"?`
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/bookings/${selectedBooking._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: updateStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update booking status."
        );
      }

      const updatedBooking = {
        ...selectedBooking,
        status: updateStatus,
      };

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === selectedBooking._id
            ? updatedBooking
            : booking
        )
      );

      setSelectedBooking(updatedBooking);
      setSuccessMessage(
        data.message || "Booking status updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen space-y-7 bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex animate-[fadeUp_.5s_ease_both] flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#B68B62]">
            <ClipboardList size={17} />
            WEDPLAN ADMINISTRATION
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#18382D] sm:text-3xl">
            Manage Bookings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage all customer booking requests.
          </p>
        </div>

        <button
          onClick={() => fetchBookings(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#244A3B] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#244A3B] hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex animate-[fadeUp_.3s_ease_both] items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={19} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            title: "Total Bookings",
            value: stats.total,
            color: "text-[#244A3B]",
            bg: "bg-[#244A3B]/10",
            icon: ClipboardList,
          },
          {
            title: "Pending",
            value: stats.pending,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: Clock,
          },
          {
            title: "Confirmed",
            value: stats.confirmed,
            color: "text-blue-600",
            bg: "bg-blue-50",
            icon: CheckCircle,
          },
          {
            title: "Completed",
            value: stats.completed,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: CheckCircle2,
          },
        ].map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              style={{ animationDelay: `${index * 100}ms` }}
             className="group animate-[fadeUp_.5s_ease_both] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-xl [animation:fadeUp_.5s_ease_both,floatCard_5s_ease-in-out_1s_infinite]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} transition duration-300 group-hover:scale-110`}>
                  <Icon size={21} className={item.color} />
                </div>
              </div>

              <h2 className={`mt-4 text-3xl font-bold ${item.color}`}>
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="animate-[fadeUp_.6s_ease_both] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1 transition-all duration-500 hover:shadow-lg">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, vendor, service or booking ID..."
              className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition duration-300 focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={17} className="shrink-0 text-gray-400" />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#244A3B] sm:w-52"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Booking List */}
      <section className="animate-[fadeUp_.7s_ease_both] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-[#18382D]">
              All Booking Requests
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {bookings.length} booking(s) found
            </p>
          </div>

          <span className="rounded-full bg-[#244A3B]/10 px-3 py-1.5 text-xs font-semibold text-[#244A3B]">
            {status === "all" ? "All Statuses" : status}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#244A3B]" />
            Loading bookings...
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#FAF9F6] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Vendor</th>
                  <th className="px-5 py-4">Event Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking, index) => (
                  <tr
                    key={booking._id}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className="animate-[fadeUp_.4s_ease_both] transition duration-200 hover:bg-[#FAF9F6]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#18382D]">
                        {booking.service?.serviceName || "Unknown Service"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {booking.service?.category || "No category"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700">
                        {booking.customer?.name || "Unknown Customer"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {booking.customer?.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700">
                        {booking.vendor?.businessName ||
                          booking.vendor?.name ||
                          "Unknown Vendor"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {booking.vendor?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(booking.eventDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openDetails(booking)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#244A3B]/10 px-3 py-2 text-xs font-semibold text-[#244A3B] transition duration-300 hover:-translate-y-0.5 hover:bg-[#244A3B] hover:text-white"
                      >
                        <Eye size={15} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <ClipboardList className="h-11 w-11 text-gray-300" />
            <h3 className="mt-3 font-semibold text-gray-600">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </section>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex animate-[fadeIn_.2s_ease_both] items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl animate-[modalIn_.3s_ease_both] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5">
              <div>
                <p className="text-xs font-semibold text-[#B68B62]">
                  BOOKING DETAILS
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#18382D]">
                  Booking Information
                </h2>
              </div>

              <button
                onClick={closeDetails}
                disabled={updating}
                className="rounded-lg p-2 text-gray-500 transition hover:rotate-90 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">

              {/* Booking ID */}
              <div className="rounded-xl border border-gray-100 bg-[#FAF9F6] p-4">
                <p className="text-xs text-gray-500">Booking ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-[#18382D]">
                  {selectedBooking._id}
                </p>
              </div>

              {/* Booking Information */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400">Service</p>
                  <p className="mt-1 font-semibold text-[#18382D]">
                    {selectedBooking.service?.serviceName || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="mt-1 font-semibold text-gray-700">
                    {selectedBooking.service?.category || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="mt-1 font-semibold text-gray-700">
                    {selectedBooking.customer?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.customer?.email || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Vendor</p>
                  <p className="mt-1 font-semibold text-gray-700">
                    {selectedBooking.vendor?.businessName ||
                      selectedBooking.vendor?.name ||
                      "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.vendor?.email || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Event Date</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-gray-700">
                    <CalendarDays size={16} />
                    {formatDate(selectedBooking.eventDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Event Location</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-gray-700">
                    <MapPin size={16} />
                    {selectedBooking.eventLocation || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Current Status</p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Created At</p>
                  <p className="mt-1 font-semibold text-gray-700">
                    {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              {/* Customer Message */}
              <div>
                <p className="text-xs text-gray-400">Customer Message</p>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                  {selectedBooking.message || "No message provided."}
                </p>
              </div>

              {/* Status Update */}
              <div className="rounded-xl border border-gray-100 bg-[#FAF9F6] p-4">
                <h3 className="font-bold text-[#18382D]">
                  Update Booking Status
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Select a new status for this booking.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    disabled={updating}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#244A3B] disabled:opacity-60"
                  >
                    {!availableStatuses.includes(selectedBooking.status) && (
                      <option value={selectedBooking.status} disabled>
                        {selectedBooking.status} (Legacy status)
                      </option>
                    )}

                    {availableStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      updating ||
                      updateStatus === selectedBooking.status ||
                      !availableStatuses.includes(updateStatus)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </div>

                {successMessage && (
                  <p className="mt-3 flex animate-[fadeUp_.3s_ease_both] items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 size={16} />
                    {successMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                onClick={closeDetails}
                disabled={updating}
                className="rounded-xl bg-[#244A3B] px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#18382D] disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
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
