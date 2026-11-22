
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  Search,
  CalendarDays,
  UserRound,
  Hash,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Crown,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Transaction = {
  _id: string;
  vendorId: string;
  vendor?: {
    name?: string;
    email?: string;
  } | null;
  plan?: string;
  amount?: number;
  currency?: string;
  status?: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  createdAt?: string;
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/api/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load transactions.");
      }

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((transaction) => {
    const keyword = search.toLowerCase();

    return [
      transaction.vendor?.name,
      transaction.vendor?.email,
      transaction.plan,
      transaction.status,
      transaction.currency,
      transaction.stripeSessionId,
      transaction.stripeSubscriptionId,
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
  });

  const totalAmount = transactions.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );

  const successfulTransactions = transactions.filter(
    (transaction) => transaction.status === "active"
  ).length;

  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === "processing"
  ).length;

  const formatAmount = (amount?: number, currency?: string) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          label: "Active",
          className: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };

      case "processing":
        return {
          label: "Processing",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
        };

      default:
        return {
          label: status || "Unknown",
          className: "bg-gray-100 text-gray-600 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B68B62]">
              Financial Overview
            </p>

            <h1 className="text-2xl font-bold text-[#18382D] sm:text-3xl">
              Transactions
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor vendor subscription payments and transaction records.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#EAE5DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <h2 className="mt-2 text-3xl font-bold text-[#18382D]">
                  {transactions.length}
                </h2>
              </div>

              <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#244A3B]">
                <CreditCard size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EAE5DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recorded Amount</p>
                <h2 className="mt-2 text-2xl font-bold text-[#18382D]">
                  {formatAmount(totalAmount)}
                </h2>
              </div>

              <div className="rounded-xl bg-[#F6EFE7] p-3 text-[#B68B62]">
                <Crown size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EAE5DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active / Processing</p>
                <h2 className="mt-2 text-3xl font-bold text-[#18382D]">
                  {successfulTransactions} / {pendingTransactions}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CheckCircle2 size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-[#EAE5DA] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor, email, status or transaction ID..."
              className="w-full rounded-xl border border-gray-200 bg-[#FAFAF8] py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#244A3B] border-t-transparent" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-[#EAE5DA] bg-white px-5 py-16 text-center">
            <CreditCard className="mx-auto mb-4 text-gray-300" size={42} />

            <h3 className="text-lg font-bold text-[#18382D]">
              No transactions found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try searching with another keyword."
                : "Transaction records will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const status = getStatusStyle(transaction.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={transaction._id}
                  className="rounded-2xl border border-[#EAE5DA] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1EC] text-[#244A3B]">
                        <CreditCard size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-[#18382D]">
                          Premium Subscription
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Transaction #{transaction._id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>

                      <p className="text-xl font-bold text-[#244A3B]">
                        {formatAmount(
                          transaction.amount,
                          transaction.currency
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <UserRound
                        size={18}
                        className="mt-0.5 text-[#B68B62]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Vendor</p>
                        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
                          {transaction.vendor?.name || "Unknown Vendor"}
                        </p>
                        <p className="break-all text-xs text-gray-500">
                          {transaction.vendor?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 text-[#B68B62]"
                      />

                      <div>
                        <p className="text-xs text-gray-400">Payment Date</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Crown size={18} className="mt-0.5 text-[#B68B62]" />

                      <div>
                        <p className="text-xs text-gray-400">Plan</p>
                        <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                          {transaction.plan || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:col-span-2 xl:col-span-3">
                      <Hash size={18} className="mt-0.5 text-[#B68B62]" />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Stripe Session ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-gray-600">
                          {transaction.stripeSessionId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Showing {filteredTransactions.length} of {transactions.length} records
        </p>
      </div>
    </div>
  );
}
