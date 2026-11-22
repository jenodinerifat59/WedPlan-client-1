
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Loader2,
  X,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

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

type StatusFilter = "all" | "paid" | "failed";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const getHeaders = useCallback(async () => {
    const token = await getAuthToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const headers = await getHeaders();

      const response = await fetch(`${API_URL}/api/admin/transactions`, {
        headers,
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesStatus =
        activeStatus === "all" ||
        transaction.status?.toLowerCase() === activeStatus;

      const searchText = [
        transaction._id,
        transaction.vendor?.name,
        transaction.vendor?.email,
        transaction.vendor?.businessName,
        transaction.plan,
        transaction.stripeSessionId,
        transaction.stripeSubscriptionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchText.includes(search.toLowerCase());
    });
  }, [transactions, activeStatus, search]);

  const paidTransactions = transactions.filter(
    (transaction) => transaction.status?.toLowerCase() === "paid"
  );

  const failedTransactions = transactions.filter(
    (transaction) => transaction.status?.toLowerCase() === "failed"
  );

  const totalRevenue = paidTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );

  const currency = paidTransactions[0]?.currency?.toUpperCase() || "USD";

  const formatAmount = (amount?: number, currencyCode?: string) => {
    const value = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currencyCode || currency).toUpperCase(),
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currencyCode || currency}`;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle2 size={14} />;
      case "failed":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B68B62]">
              Financial Management
            </p>

            <h1 className="text-3xl font-bold text-[#18382D]">
              Transactions
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor vendor payments and subscription transactions.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={transactions.length.toLocaleString()}
            icon={<CreditCard size={21} />}
            color="green"
          />

          <StatCard
            title="Total Revenue"
            value={formatAmount(totalRevenue, currency)}
            icon={<Wallet size={21} />}
            color="gold"
          />

          <StatCard
            title="Successful Payments"
            value={paidTransactions.length.toLocaleString()}
            icon={<CheckCircle2 size={21} />}
            color="blue"
          />

          <StatCard
            title="Failed Payments"
            value={failedTransactions.length.toLocaleString()}
            icon={<XCircle size={21} />}
            color="red"
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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
                placeholder="Search vendor, transaction ID, plan..."
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#244A3B]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Paid", value: "paid" },
                { label: "Failed", value: "failed" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setActiveStatus(filter.value as StatusFilter)
                  }
                  className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${
                    activeStatus === filter.value
                      ? "bg-[#244A3B] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Transaction Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#18382D]">
                All Transactions
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Showing {filteredTransactions.length} transactions
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <TrendingUp size={15} />
              Latest transactions first
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="animate-spin text-[#244A3B]" size={30} />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <CreditCard size={40} className="mb-3 text-gray-300" />
              <h3 className="font-semibold text-gray-700">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF9F6] text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Vendor</th>
                      <th className="px-5 py-4">Plan</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="transition hover:bg-[#FAF9F6]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#18382D]">
                            {transaction.vendor?.businessName ||
                              transaction.vendor?.name ||
                              "Unknown Vendor"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {transaction.vendor?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#F4F0E8] px-3 py-1.5 text-xs font-semibold capitalize text-[#244A3B]">
                            {transaction.plan || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-bold text-[#18382D]">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={transaction.status}
                            getStatusStyle={getStatusStyle}
                            getStatusIcon={getStatusIcon}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedTransaction(transaction)
                            }
                            className="rounded-lg p-2 text-[#244A3B] transition hover:bg-green-50"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#18382D]">
                          {transaction.vendor?.businessName ||
                            transaction.vendor?.name ||
                            "Unknown Vendor"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {transaction.vendor?.email || "No email"}
                        </p>
                      </div>

                      <StatusBadge
                        status={transaction.status}
                        getStatusStyle={getStatusStyle}
                        getStatusIcon={getStatusIcon}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">
                          {transaction.plan || "N/A"} Plan
                        </p>
                        <p className="mt-1 font-bold text-[#244A3B]">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedTransaction(transaction)
                        }
                        className="flex items-center gap-2 rounded-lg bg-[#244A3B] px-3 py-2 text-xs font-semibold text-white"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-[#18382D]">
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Complete payment information
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-xl bg-[#F8F6F0] p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Transaction Amount
                </p>

                <h3 className="mt-2 text-3xl font-bold text-[#244A3B]">
                  {formatAmount(
                    selectedTransaction.amount,
                    selectedTransaction.currency
                  )}
                </h3>

                <div className="mt-3 flex justify-center">
                  <StatusBadge
                    status={selectedTransaction.status}
                    getStatusStyle={getStatusStyle}
                    getStatusIcon={getStatusIcon}
                  />
                </div>
              </div>

              <DetailRow
                label="Transaction ID"
                value={selectedTransaction._id}
              />

              <DetailRow
                label="Vendor"
                value={
                  selectedTransaction.vendor?.businessName ||
                  selectedTransaction.vendor?.name ||
                  "Unknown Vendor"
                }
              />

              <DetailRow
                label="Vendor Email"
                value={selectedTransaction.vendor?.email || "N/A"}
              />

              <DetailRow
                label="Vendor ID"
                value={String(selectedTransaction.vendorId || "N/A")}
              />

              <DetailRow
                label="Subscription Plan"
                value={selectedTransaction.plan || "N/A"}
              />

              <DetailRow
                label="Payment Status"
                value={selectedTransaction.status || "N/A"}
              />

              <DetailRow
                label="Currency"
                value={selectedTransaction.currency?.toUpperCase() || "USD"}
              />

              <DetailRow
                label="Created At"
                value={formatDate(selectedTransaction.createdAt)}
              />

              <DetailRow
                label="Stripe Session ID"
                value={selectedTransaction.stripeSessionId || "N/A"}
              />

              <DetailRow
                label="Stripe Subscription ID"
                value={selectedTransaction.stripeSubscriptionId || "N/A"}
              />
            </div>

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full rounded-xl bg-[#244A3B] py-3 text-sm font-bold text-white transition hover:bg-[#18382D]"
              >
                Close Details
              </button>
            </div>
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
  color: "green" | "gold" | "blue" | "red";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    gold: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
      </div>
      <h3 className="mt-4 break-words text-2xl font-bold text-[#18382D]">
        {value}
      </h3>
    </div>
  );
}

function StatusBadge({
  status,
  getStatusStyle,
  getStatusIcon,
}: {
  status?: string;
  getStatusStyle: (status?: string) => string;
  getStatusIcon: (status?: string) => React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${getStatusStyle(status)}`}
    >
      {getStatusIcon(status)}
      {status || "pending"}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className="break-all text-right text-sm font-medium text-[#18382D] sm:max-w-[65%]">
        {value}
      </span>
    </div>
  );
}
