
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import {
  UserRound,
  Mail,
  ShieldCheck,
  BriefcaseBusiness,
  CircleUserRound,
  CheckCircle2,
  Pencil,
  Save,
  X,
  Crown,
  CreditCard,
  RefreshCw,
  Sparkles,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export default function VendorProfilePage() {
  const { data: session, isPending } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [plan, setPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = session?.user;

  const getHeaders = async () => {
    const AUTH_URL =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    const response = await fetch(`${AUTH_URL}/api/auth/token`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to get authentication token");
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error("JWT token not found");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    };
  };

  // Load Vendor Subscription
  const loadPlan = useCallback(async () => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is missing from .env.local");
      setLoadingPlan(false);
      return;
    }

    try {
      setLoadingPlan(true);

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/vendor/overview`,
        {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      setPlan(data.plan || "free");
      setError("");
    } catch (err) {
      console.error("Subscription Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription status"
      );
    } finally {
      setLoadingPlan(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPlan();
    }
  }, [user, loadPlan]);

  // Stripe Payment Return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      setMessage("Payment received. Checking your Premium status...");

      const timer = setTimeout(() => {
        loadPlan();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [loadPlan]);

  // Open Edit Form
  const startEditing = () => {
    setName(user?.name || "");
    setImage(user?.image || "");
    setMessage("");
    setError("");
    setEditing(true);
  };

  // Direct ImageBB Upload
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    if (!IMGBB_API_KEY) {
      setError("ImageBB API key is missing from .env.local.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.data?.url) {
        throw new Error(
          data.error?.message || "Image upload failed."
        );
      }

      setImage(data.data.url);
      setMessage(
        "Image uploaded successfully. Click Save Changes to update your profile."
      );
    } catch (err) {
      console.error("ImageBB Upload Error:", err);

      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove Image
  const handleRemoveImage = () => {
    setImage("");
    setMessage("Image removed. Click Save Changes to confirm.");
    setError("");
  };

  // Update Profile
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Profile update failed."
        );
      }

      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Upgrade Premium
  const handleUpgrade = async () => {
    if (!API_URL) {
      setError("Backend URL is missing.");
      return;
    }

    try {
      setPaymentLoading(true);
      setError("");
      setMessage("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from payment server.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to start checkout.");
      }

      if (!data.url) {
        throw new Error("Stripe Checkout URL not received.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Payment Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Payment initialization failed."
      );

      setPaymentLoading(false);
    }
  };

  // Cancel Subscription
  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your Premium subscription? Your Premium access will remain active until the current billing period ends."
    );

    if (!confirmed) return;

    if (!API_URL) {
      setError("Backend URL is missing.");
      return;
    }

    try {
      setCancelLoading(true);
      setError("");
      setMessage("");

      const headers = await getHeaders();

      const response = await fetch(
        `${API_URL}/api/payments/cancel-subscription`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from payment server.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Subscription cancellation failed."
        );
      }

      setMessage(
        data.message ||
          "Subscription cancellation scheduled successfully."
      );

      await loadPlan();
    } catch (err) {
      console.error("Cancellation Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Cancellation failed."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // Loading
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#244A3B]/20 border-t-[#244A3B]" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Login Required
  if (!user) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <CircleUserRound className="mx-auto h-10 w-10 text-red-400" />
        <h2 className="mt-3 text-lg font-semibold text-red-700">
          Login Required
        </h2>
        <p className="mt-1 text-sm text-red-500">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  const initial = user.name?.charAt(0).toUpperCase() || "V";
  const isPremium = plan === "premium";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#B68B62]">
            Account Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#18382D] md:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your vendor account information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#18382D] px-5 py-3 text-white transition hover:bg-[#244A3B]"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Edit Form - Shows Immediately Below Heading */}
      {editing && (
        <form
          onSubmit={handleUpdate}
          className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#18382D]">
              Edit Your Information
            </h2>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
                setMessage("");
              }}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              aria-label="Close edit form"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Image */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Profile Picture
            </label>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#244A3B]/10 bg-gray-100">
                {image ? (
                  <img
                    src={image}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-10 w-10 text-gray-400" />
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Select an image from your computer. Maximum size 5MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-[#18382D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#244A3B] disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}

                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
              placeholder="Enter your name"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-xl bg-[#18382D] px-5 py-3 text-white transition hover:bg-[#244A3B] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(user.name || "");
                setImage(user.image || "");
                setError("");
                setMessage("");
              }}
              disabled={uploading || saving}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={17} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#18382D] p-7 text-white shadow-lg md:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          {user.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-white/20 object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-[#B68B62] text-4xl font-bold shadow-xl">
              {initial}
            </div>
          )}

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-2xl font-bold md:text-3xl">
                {user.name || "Vendor"}
              </h2>

              <CheckCircle2 className="h-5 w-5 text-[#D9B68F]" />
            </div>

            <p className="mt-2 text-sm text-white/70">
              {user.email}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium">
              <BriefcaseBusiness className="h-4 w-4" />
              Vendor Account
            </div>
          </div>
        </div>
      </div>

      {/* Premium Subscription */}
      <section className="overflow-hidden rounded-3xl border border-[#B68B62]/20 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#18382D] to-[#315B47] p-7 text-white md:p-9">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[25px] border-white/5" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-[#E4C49E]">
                <Crown size={22} />
                <span className="text-sm font-semibold uppercase tracking-widest">
                  Vendor Membership
                </span>
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                {isPremium ? "Premium Plan" : "Free Plan"}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75">
                {isPremium
                  ? "You are enjoying your Premium vendor membership."
                  : "Upgrade your account to Premium and grow your business with WedPlan."}
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              {isPremium ? (
                <Crown size={42} className="text-[#E4C49E]" />
              ) : (
                <Sparkles size={42} className="text-[#E4C49E]" />
              )}
            </div>
          </div>
        </div>

        <div className="p-7 md:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Your current subscription
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-bold capitalize text-[#18382D]">
                  {loadingPlan ? "Loading..." : plan}
                </span>

                {!loadingPlan && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isPremium
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isPremium ? "Active" : "Basic"}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={loadPlan}
              disabled={loadingPlan}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loadingPlan ? "animate-spin" : ""}
              />
              Refresh Status
            </button>
          </div>

          <div className="my-6 border-t border-gray-100" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F8F7F3] p-5">
              <CreditCard className="h-6 w-6 text-[#B68B62]" />
              <h3 className="mt-3 font-semibold text-[#18382D]">
                Premium Membership
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Monthly recurring subscription through Stripe.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8F7F3] p-5">
              <ShieldCheck className="h-6 w-6 text-[#B68B62]" />
              <h3 className="mt-3 font-semibold text-[#18382D]">
                Secure Payment
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your subscription is securely managed through Stripe.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {!isPremium ? (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={paymentLoading || loadingPlan}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#18382D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#244A3B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Crown size={18} />
                {paymentLoading
                  ? "Redirecting to Stripe..."
                  : "Upgrade to Premium"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-6 py-3.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {cancelLoading
                  ? "Cancelling..."
                  : "Cancel Subscription"}
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Subscription cancellation takes effect at the end of the current billing period.
          </p>
        </div>
      </section>

      {/* Account Information */}
      <div>
        <h2 className="text-xl font-bold text-[#18382D]">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your basic account details.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InfoCard
            icon={<UserRound />}
            title="Full Name"
            value={user.name || "Not provided"}
          />

          <InfoCard
            icon={<Mail />}
            title="Email Address"
            value={user.email}
          />

          <InfoCard
            icon={<BriefcaseBusiness />}
            title="Account Type"
            value="Vendor"
          />

          <InfoCard
            icon={<ShieldCheck />}
            title="Authentication"
            value="Better Auth"
          />
        </div>
      </div>

      {/* Security */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#B68B62]/20 bg-[#B68B62]/5 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#B68B62]" />

        <div>
          <h3 className="font-semibold text-[#18382D]">
            Your Account Security
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Your account information is securely managed through Better Auth.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#244A3B]/10 text-[#244A3B]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 truncate font-semibold text-[#18382D]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
