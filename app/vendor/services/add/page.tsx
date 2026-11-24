
"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken } from "@/lib/get-token";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export default function AddServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    serviceName: "",
    category: "",
    description: "",
    price: "",
    location: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Upload Multiple Images Directly To ImageBB
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setError("");
    setSuccess("");

    if (!IMGBB_API_KEY) {
      setError(
        "ImageBB API key is missing. Check NEXT_PUBLIC_IMGBB_API_KEY in .env.local."
      );
      e.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a valid image.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds the 5MB size limit.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    if (images.length + validFiles.length > 8) {
      setError("You can upload a maximum of 8 images.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
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
            data.error?.message || `Failed to upload ${file.name}.`
          );
        }

        uploadedUrls.push(data.data.url);
      }

      setImages((previous) => [...previous, ...uploadedUrls]);

      setSuccess(
        `${uploadedUrls.length} image(s) uploaded successfully!`
      );
    } catch (err) {
      console.error("ImageBB Upload Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove Image
  const removeImage = (index: number) => {
    setImages((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Submit Service
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (images.length === 0) {
      setError("Please upload at least one service image.");
      return;
    }

    try {
      setLoading(true);

      const token = await getAuthToken();

      await api(
        "/api/vendor/services",
        {
          method: "POST",
          body: JSON.stringify({
            serviceName: form.serviceName,
            category: form.category,
            description: form.description,
            price: Number(form.price),
            location: form.location,
            images,
          }),
        },
        token
      );

      setSuccess(
        "Service submitted successfully! Waiting for admin approval."
      );

      setTimeout(() => {
        router.push("/vendor/services");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add service."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Back Button */}
      <Link
        href="/vendor/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#244A3B] transition hover:gap-3"
      >
        <ArrowLeft size={17} />
        Back to My Services
      </Link>

      {/* Heading */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B68B62]">
          Vendor Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#18382D] md:text-4xl">
          Add New Service
        </h1>

        <p className="mt-2 text-gray-500">
          Showcase your wedding services and attract more customers.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
      >
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-[#18382D]">
            Service Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the basic details of your service.
          </p>
        </div>

        {/* Service Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Service Name *
          </label>

          <input
            name="serviceName"
            value={form.serviceName}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Example: Professional Wedding Photography"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Category *
          </label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
          >
            <option value="">Select a category</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Description *
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            minLength={10}
            rows={5}
            placeholder="Describe your service, experience and what you offer..."
            className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
          />
        </div>

        {/* Price & Location */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Price (BDT) *
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="1"
              placeholder="Example: 15000"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Location *
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="Example: Dhaka, Bangladesh"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="border-t border-gray-100 pt-7">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#18382D]">
              Service Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload up to 8 images. Each image must be under 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Upload Box */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 8}
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#244A3B]/30 bg-[#F8F7F3] px-5 py-10 text-center transition hover:border-[#244A3B] hover:bg-[#244A3B]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-[#244A3B]" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#244A3B]/10 text-[#244A3B]">
                <ImagePlus size={28} />
              </div>
            )}

            <span className="mt-4 font-semibold text-[#18382D]">
              {uploading ? "Uploading Images..." : "Click to Upload Images"}
            </span>

            <span className="mt-1 text-xs text-gray-500">
              PNG, JPG, JPEG or WEBP · Maximum 5MB each
            </span>
          </button>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#18382D]">
                  Uploaded Images
                </h3>

                <span className="rounded-full bg-[#244A3B]/10 px-3 py-1 text-xs font-semibold text-[#244A3B]">
                  {images.length}/8 Images
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={url}
                      alt={`Service image ${index + 1}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={uploading}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-100 shadow-md transition hover:bg-red-600 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 size={15} className="text-[#244A3B]" />
            Images are uploaded directly to ImageBB.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <X size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-gray-100 pt-6">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18382D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#244A3B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Camera size={18} />
            )}

            {uploading
              ? "Please wait..."
              : loading
                ? "Submitting..."
                : "Submit Service"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            Your service will be submitted for admin approval.
          </p>
        </div>
      </form>
    </div>
  );
}
