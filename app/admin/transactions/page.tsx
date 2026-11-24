
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CreditCard,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  CalendarDays,
  UserRound,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Transaction = {
  _id: string;
  vendorId?: string;
  vendor?: {
    _id?: string;
    name?: string;
    email?: string;
    businessName?: string;
  } | null;
  plan?: string;
  amount?: number;
  currency?: string;
  status?: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  createdAt?: string;
};

type FilterStatus = "all" | "paid" | "pending" | "failed";

function formatAmount(amount?: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount || 0));
}

function formatDate(date?: string) {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatus(status?: string) {
  const value = (status || "pending").toLowerCase();

  if (["paid", "success", "successful", "completed"].includes(value)) {
    return "paid";
  }

  if (["failed", "cancelled", "canceled"].includes(value)) {
    return "failed";
  }

  return "pending";
}

function getStatusLabel(status?: string) {
  const value = getStatus(status);

  if (value === "paid") return "Successful";
  if (value === "failed") return "Failed";

  return "Pending";
}

function getStatusStyle(status?: string) {
  const value = getStatus(status);

  if (value === "paid") {
    return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  }

  if (value === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
  }

  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
}

function getTransactionList(data: unknown): Transaction[] {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") return [];

  const result = data as {
    transactions?: unknown;
    data?: unknown;
    results?: unknown;
  };

  if (Array.isArray(result.transactions)) return result.transactions;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.results)) return result.results;

  return [];
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // Get Better Auth JWT
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          tokenError?.message || "Unable to get authentication token. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/transactions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const responseText = await response.text();

      let data: unknown;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        const errorData = data as {
          message?: string;
          error?: string;
        } | null;

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Request failed (${response.status})`
        );
      }

      const transactionList = getTransactionList(data);

      setTransactions(transactionList);
    } catch (err) {
      console.error("Transactions fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const stats = useMemo(() => {
    const successful = transactions.filter(
      (item) => getStatus(item.status) === "paid"
    );

    const failed = transactions.filter(
      (item) => getStatus(item.status) === "failed"
    );

    const pending = transactions.filter(
      (item) => getStatus(item.status) === "pending"
    );

    const revenue = successful.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

    return {
      total: transactions.length,
      revenue,
      successful: successful.length,
      failed: failed.length,
      pending: pending.length,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return transactions.filter((item) => {
      const matchesSearch =
        !keyword ||
        item._id?.toLowerCase().includes(keyword) ||
        item.vendor?.name?.toLowerCase().includes(keyword) ||
        item.vendor?.email?.toLowerCase().includes(keyword) ||
        item.vendor?.businessName?.toLowerCase().includes(keyword) ||
        item.plan?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" || getStatus(item.status) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage all payment transactions.
          </p>
        </div>

        <button
          onClick={() => fetchTransactions(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
              size={20}
            />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Unable to load transactions
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
            className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={stats.total.toString()}
          icon={<CreditCard size={22} />}
          color="blue"
        />

        <StatCard
          title="Total Revenue"
          value={formatAmount(stats.revenue)}
          icon={<DollarSign size={22} />}
          color="green"
        />

        <StatCard
          title="Successful Payments"
          value={stats.successful.toString()}
          icon={<CheckCircle2 size={22} />}
          color="emerald"
        />

        <StatCard
          title="Failed Payments"
          value={stats.failed.toString()}
          icon={<XCircle size={22} />}
          color="red"
        />
      </div>

      {/* Pending */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#15191A]">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={17} />
          Pending Payments:
          <span className="font-bold text-gray-900 dark:text-white">
            {stats.pending}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#15191A]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor, email, plan or ID..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-[#0D1110] dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["paid", "Successful"],
                ["pending", "Pending"],
                ["failed", "Failed"],
              ] as [FilterStatus, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  filter === value
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#15191A]">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              All Transactions
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
          <Receipt size={20} className="text-emerald-500" />
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
              <Receipt size={25} className="text-gray-400" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
              {transactions.length === 0
                ? "No transactions found"
                : "No matching transactions"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {transactions.length === 0
                ? "Transactions will appear here when payment records are available."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Transaction</th>
                    <th className="px-5 py-4 font-semibold">Vendor</th>
                    <th className="px-5 py-4 font-semibold">Plan</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredTransactions.map((item) => (
                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-[130px] truncate text-sm font-semibold text-gray-900 dark:text-white">
                          #{item._id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.vendor?.businessName ||
                            item.vendor?.name ||
                            "Unknown Vendor"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.vendor?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-gray-600 dark:text-gray-300">
                        {item.plan || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {formatAmount(item.amount, item.currency)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedTransaction(item)}
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-emerald-100 hover:text-emerald-700 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredTransactions.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {item.vendor?.businessName ||
                          item.vendor?.name ||
                          "Unknown Vendor"}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {item.vendor?.email || "No email"}
                      </p>
                    </div>

                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">
                        {formatAmount(item.amount, item.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Plan</p>
                      <p className="mt-1 text-sm capitalize text-gray-900 dark:text-white">
                        {item.plan || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                    <button
                      onClick={() => setSelectedTransaction(item)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      <Eye size={15} />
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#15191A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Payment information
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-5 text-center dark:bg-white/[0.04]">
              <p className="text-sm text-gray-500">Transaction Amount</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatAmount(
                  selectedTransaction.amount,
                  selectedTransaction.currency
                )}
              </h3>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedTransaction.status)}`}>
                {getStatusLabel(selectedTransaction.status)}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <DetailRow
                icon={<Receipt size={17} />}
                label="Transaction ID"
                value={selectedTransaction._id}
              />
              <DetailRow
                icon={<UserRound size={17} />}
                label="Vendor"
                value={
                  selectedTransaction.vendor?.businessName ||
                  selectedTransaction.vendor?.name ||
                  "Unknown Vendor"
                }
              />
              <DetailRow
                icon={<UserRound size={17} />}
                label="Vendor Email"
                value={selectedTransaction.vendor?.email || "N/A"}
              />
              <DetailRow
                icon={<CreditCard size={17} />}
                label="Plan"
                value={selectedTransaction.plan || "N/A"}
              />
              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Date"
                value={formatDate(selectedTransaction.createdAt)}
              />
              <DetailRow
                icon={<CreditCard size={17} />}
                label="Stripe Session ID"
                value={selectedTransaction.stripeSessionId || "N/A"}
              />
              <DetailRow
                icon={<CreditCard size={17} />}
                label="Subscription ID"
                value={selectedTransaction.stripeSubscriptionId || "N/A"}
              />
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "emerald" | "red";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#15191A]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <h3 className="mt-1 break-words text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 break-all text-sm font-medium text-gray-900 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );
}
