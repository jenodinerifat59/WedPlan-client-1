
"use client";

import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CircleUserRound,
  Pencil,
  X,
  Camera,
  Loader2,
  Upload,
} from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";

export default function CustomerProfilePage() {
  const { data: session, isPending } = useSession();

  const user = session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleEdit = () => {
    setName(user?.name || "");
    setImage(user?.image || "");
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  // Upload profile image directly to ImageBB
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (!apiKey) {
        throw new Error(
          "ImageBB API key is missing. Check your .env.local file."
        );
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
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
      setSuccess("Profile image uploaded successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload profile image."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (isUploading) {
      setError("Please wait until image upload is complete.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });

      if (error) {
        throw new Error(error.message || "Profile update failed.");
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18382D]">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your account information.
          </p>
        </div>

        <button
          onClick={handleEdit}
          className="flex items-center gap-2 rounded-lg bg-[#244A3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18382D]"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </div>

      {success && !isEditing && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#18382D] to-[#527866]" />

        <div className="px-6 pb-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#F8F6F0] shadow-md">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Customer"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <CircleUserRound
                  size={65}
                  className="text-[#244A3B]"
                />
              )}
            </div>

            <span className="mb-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-[#244A3B]">
              Customer Account
            </span>
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-bold text-[#18382D]">
              {user.name || "Customer"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
              <div className="rounded-lg bg-[#F3F5F1] p-3">
                <UserRound className="text-[#244A3B]" size={21} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {user.name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
              <div className="rounded-lg bg-[#F3F5F1] p-3">
                <Mail className="text-[#244A3B]" size={21} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
              <div className="rounded-lg bg-[#F3F5F1] p-3">
                <ShieldCheck className="text-[#244A3B]" size={21} />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Email Verification
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#18382D]">
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your personal information.
                </p>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving || isUploading}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Profile Image Preview */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-[#F8F6F0]">
                  {image ? (
                    <img
                      src={image}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={35} className="text-[#244A3B]" />
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Profile Image Preview
                </p>

                {/* Hidden File Input */}
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
                  disabled={isUploading || isSaving}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-[#244A3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Choose Profile Image
                    </>
                  )}
                </button>

                <p className="mt-2 text-xs text-gray-400">
                  Maximum image size: 5MB
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving || isUploading}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#244A3B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
