
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Building2,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Save,
  Loader2,
  ShieldCheck,
  Settings,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getAuthToken } from "@/lib/get-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    image: "",
    role: "admin",
  });

  const [platform, setPlatform] = useState<PlatformSettings>({
    name: "WedPlan",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Please login first.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileRes, platformRes] = await Promise.all([
          fetch(`${API_URL}/api/me`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/admin/settings`, {
            headers,
            cache: "no-store",
          }),
        ]);

        const profileData = await profileRes.json();
        const platformData = await platformRes.json();

        if (!profileRes.ok) {
          throw new Error(
            profileData.message || "Failed to load admin profile."
          );
        }

        if (!platformRes.ok) {
          throw new Error(
            platformData.message || "Failed to load platform settings."
          );
        }

        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          image: profileData.image || "",
          role: profileData.role || "admin",
        });

        setPlatform({
          name: platformData.name || "WedPlan",
          email: platformData.email || "",
          phone: platformData.phone || "",
          address: platformData.address || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const showError = (text: string) => {
    setError(text);
    setMessage("");
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (profile.name.trim().length < 2) {
      showError("Name must contain at least 2 characters.");
      return;
    }

    setProfileSaving(true);
    setError("");
    setMessage("");

    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      const res = await fetch(`${API_URL}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          image: profile.image.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setProfile((prev) => ({
        ...prev,
        name: data.user?.name || data.name || prev.name,
        image: data.user?.image || data.image || prev.image,
      }));

      showMessage("Admin profile updated successfully!");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePlatformSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (platform.name.trim().length < 2) {
      showError("Platform name must contain at least 2 characters.");
      return;
    }

    setPlatformSaving(true);
    setError("");
    setMessage("");

    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: platform.name.trim(),
          email: platform.email.trim(),
          phone: platform.phone.trim(),
          address: platform.address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update settings.");
      }

      if (data.settings) {
        setPlatform({
          name: data.settings.name || "",
          email: data.settings.email || "",
          phone: data.settings.phone || "",
          address: data.settings.address || "",
        });
      }

      showMessage("Platform settings saved successfully!");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save settings."
      );
    } finally {
      setPlatformSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#18382D] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100";

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 animate-[fadeIn_0.5s_ease-out_both]">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#B68B62]">
            <Settings size={16} />
            Admin Panel
          </div>

          <h1 className="text-2xl font-bold text-[#18382D] sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your admin profile and WedPlan platform information.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 animate-[fadeIn_0.3s_ease-out_both]">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-[fadeIn_0.3s_ease-out_both]">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div className="space-y-7">

          {/* Admin Profile */}
          <section className="animate-[fadeIn_0.5s_ease-out_both] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#244A3B]/10 text-[#244A3B] transition-transform duration-300 hover:rotate-6 hover:scale-110">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-[#18382D]">
                    Admin Profile
                  </h2>
                  <p className="text-xs text-gray-500">
                    Update your personal information.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="p-5 sm:p-7">

              {/* Profile Preview */}
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#F8F6F0] bg-[#244A3B]/10 transition-transform duration-500 hover:scale-105">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="Admin profile"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <UserRound size={32} className="text-[#244A3B]" />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#18382D]">
                    {profile.name || "Admin"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.email}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <ShieldCheck size={13} />
                    Administrator
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    className={inputClass}
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <ImageIcon size={15} />
                      Profile Image URL
                    </span>
                  </label>
                  <input
                    type="url"
                    value={profile.image}
                    onChange={(e) =>
                      setProfile({ ...profile, image: e.target.value })
                    }
                    placeholder="https://example.com/profile.jpg"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Provide a publicly accessible image URL.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className={buttonClass}
                >
                  {profileSaving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          {/* Platform Settings */}
          <section className="animate-[fadeIn_0.6s_ease-out_both] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B68B62]/10 text-[#B68B62] transition-transform duration-300 hover:rotate-6 hover:scale-110">
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-[#18382D]">
                    Platform Settings
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage your website contact information.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePlatformSave} className="p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={platform.name}
                    onChange={(e) =>
                      setPlatform({ ...platform, name: e.target.value })
                    }
                    placeholder="WedPlan"
                    className={inputClass}
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <Mail size={15} />
                      Contact Email
                    </span>
                  </label>
                  <input
                    type="email"
                    value={platform.email}
                    onChange={(e) =>
                      setPlatform({ ...platform, email: e.target.value })
                    }
                    placeholder="contact@wedplan.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <Phone size={15} />
                      Contact Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={platform.phone}
                    onChange={(e) =>
                      setPlatform({ ...platform, phone: e.target.value })
                    }
                    placeholder="+880 1XXXXXXXXX"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={15} />
                      Office Address
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={platform.address}
                    onChange={(e) =>
                      setPlatform({ ...platform, address: e.target.value })
                    }
                    placeholder="Enter your platform office address"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  disabled={platformSaving}
                  className={buttonClass}
                >
                  {platformSaving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {platformSaving ? "Saving..." : "Save Platform Settings"}
                </button>
              </div>
            </form>
          </section>

          {/* Security Note */}
          <div className="animate-[fadeIn_0.7s_ease-out_both] flex items-start gap-3 rounded-xl border border-[#E8DDCE] bg-[#F4EFE6] p-4 transition-all duration-300 hover:shadow-md">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#8B6949]" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-[#18382D]">
                Admin Security
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Only authorized administrators can access and update these
                settings. All changes are saved to the database.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
