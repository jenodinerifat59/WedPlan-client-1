
"use client";

import { useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import {
  UserRound,
  Mail,
  ShieldCheck,
  BriefcaseBusiness,
  CircleUserRound,
  CheckCircle2,
  Pencil,
  Camera,
  Save,
  X,
} from "lucide-react";

export default function VendorProfilePage() {
  const { data: session, isPending } = useSession();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  if (!session?.user) {
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

  const user = session.user;
  const initial = user.name?.charAt(0).toUpperCase() || "V";

  const startEditing = () => {
    setName(user.name || "");
    setImage(user.image || "");
    setMessage("");
    setError("");
    setEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
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
        throw new Error(result.error.message || "Profile update failed");
      }

      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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

            <p className="mt-2 text-sm text-white/70">{user.email}</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium">
              <BriefcaseBusiness className="h-4 w-4" />
              Vendor Account
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <form
          onSubmit={handleUpdate}
          className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#18382D]">
            Edit Your Information
          </h2>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
              placeholder="https://example.com/profile.jpg"
            />
            <p className="mt-2 text-xs text-gray-400">
              Enter a direct image URL.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#18382D] px-5 py-3 text-white hover:bg-[#244A3B] disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-gray-600 hover:bg-gray-50"
            >
              <X size={17} />
              Cancel
            </button>
          </div>
        </form>
      )}

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
