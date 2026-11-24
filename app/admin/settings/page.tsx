
"use client";

import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Camera,
  Trash2,
  Save,
  Settings,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

type Profile = {
  name: string;
  email: string;
  image: string;
  role: string;
};

type PlatformSettings = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function AdminProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    image: "",
    role: "admin",
  });

  const [settings, setSettings] = useState<PlatformSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile and platform settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/me`, { headers }),
          fetch(`${API_URL}/api/admin/settings`, { headers }),
        ]);

        const profileData = await profileRes.json();
        const settingsData = await settingsRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData.message || "Failed to load profile");
        }

        if (!settingsRes.ok) {
          throw new Error(
            settingsData.message || "Failed to load platform settings"
          );
        }

        const user = profileData.user || profileData;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          image: user.image || "",
          role: user.role || "admin",
        });

        const platform = settingsData.settings || settingsData;

        setSettings({
          name: platform.name || "",
          email: platform.email || "",
          phone: platform.phone || "",
          address: platform.address || "",
        });
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Upload image directly to ImageBB
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (!IMGBB_API_KEY) {
      setError("ImageBB API key is missing in frontend environment.");
      event.target.value = "";
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

      setProfile((prev) => ({
        ...prev,
        image: data.data.url,
      }));

      setMessage("Image uploaded successfully. Now save your profile.");
    } catch (err) {
      console.error("ImageBB upload error:", err);
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Save admin profile
  const handleProfileSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setMessage("");
      setError("");

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          image: profile.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setMessage("Admin profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Profile update failed."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Save platform settings
  const handleSettingsSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSavingSettings(true);
      setMessage("");
      setError("");

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      setMessage("Platform settings updated successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Settings update failed."
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const removeImage = () => {
    setProfile((prev) => ({
      ...prev,
      image: "",
    }));
    setMessage("Image removed. Save your profile to confirm.");
    setError("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your admin profile and WedPlan platform information.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Admin Profile */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update your personal information.
          </p>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-gray-100 dark:border-emerald-900 dark:bg-gray-800">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Admin profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Profile Picture
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload an image from your computer. Maximum size 5MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>

                {profile.image && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-11 pr-4 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Role
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={profile.role}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-11 pr-4 capitalize text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              type="submit"
              disabled={savingProfile || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </section>

      {/* Platform Settings */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
            <Settings className="h-5 w-5 text-emerald-600" />
            Platform Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage WedPlan platform information.
          </p>
        </div>

        <form onSubmit={handleSettingsSave} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Platform Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform Name
              </label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="WedPlan"
                />
              </div>
            </div>

            {/* Platform Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="contact@wedplan.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter platform address"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
