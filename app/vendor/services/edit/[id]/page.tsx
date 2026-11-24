
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken } from "@/lib/get-token";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
  ImagePlus,
} from "lucide-react";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

interface Service {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
}

function EditServiceForm({ id }: { id: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Service>({
    serviceName: "",
    category: "",
    description: "",
    price: 0,
    location: "",
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing service
  useEffect(() => {
    let cancelled = false;

    const fetchService = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Please login first.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/services/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load service");
        }

        if (!cancelled) {
          setFormData({
            serviceName: data.serviceName || "",
            category: data.category || "",
            description: data.description || "",
            price: data.price || 0,
            location: data.location || "",
            images: Array.isArray(data.images) ? data.images : [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) fetchService();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle normal form fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  // Upload selected images directly to ImageBB
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");
    setSuccess("");

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Please select valid image files only.");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      setError("Each image must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (!apiKey) {
        throw new Error(
          "ImageBB API key is missing. Check your .env.local file."
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
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
            data.error?.message || `Failed to upload ${file.name}`
          );
        }

        uploadedUrls.push(data.data.url);
      }

      // Add uploaded URLs to existing images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      setSuccess(
        `${uploadedUrls.length} image(s) uploaded successfully!`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);

      // Allow selecting the same file again
      event.target.value = "";
    }
  };

  // Remove an image from preview and form data
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  // Update service
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Please login first.");
      }

      if (formData.images.length === 0) {
        throw new Error("Please upload at least one service image.");
      }

      const payload = {
        ...formData,
        images: formData.images.filter(Boolean),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/services/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update service");
      }

      setSuccess(data.message || "Service updated successfully!");

      setTimeout(() => {
        router.push("/vendor/services");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <Link
          href="/vendor/services"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#244A3B] hover:text-[#B68B62]"
        >
          <ArrowLeft size={17} />
          Back to My Services
        </Link>

        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#B68B62]">
          Vendor Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#18382D]">
          Edit Service
        </h1>

        <p className="mt-2 text-gray-500">
          Update your wedding service information.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
      >
        {/* Service Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#18382D]">
            Service Name
          </label>

          <input
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
            minLength={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#244A3B] focus:ring-2 focus:ring-[#244A3B]/10"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#18382D]">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#244A3B]"
          >
            <option value="">Select Category</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#18382D]">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={10}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        {/* Price and Location */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#18382D]">
              Price (BDT)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#18382D]">
              Location
            </label>

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
            />
          </div>
        </div>

        {/* Image Upload and Preview */}
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#18382D]">
            <ImageIcon size={17} />
            Service Images
          </label>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {formData.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={image}
                    alt={`Service image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-100 shadow transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-[#18382D]/90 px-2 py-1 text-xs font-medium text-white">
                      Main Image
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Box */}
          <div className="rounded-2xl border-2 border-dashed border-[#244A3B]/30 bg-[#F8F6F0] p-6 text-center transition hover:border-[#244A3B]">
            <ImagePlus
              size={35}
              className="mx-auto text-[#244A3B]"
            />

            <p className="mt-3 text-sm font-semibold text-[#18382D]">
              Upload service images
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Select images directly from your computer
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Uploading Images...
                </>
              ) : (
                <>
                  <Upload size={17} />
                  Choose Images
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-400">
              Maximum 5MB per image. Supported image formats only.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/vendor/services"
            className="rounded-full border border-gray-200 px-7 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center justify-center gap-2 rounded-full bg-[#244A3B] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#18382D] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={17} />
                Update Service
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-500">
        Note: Updating an approved service sends it for admin review again.
      </p>
    </div>
  );
}

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");

  useEffect(() => {
    params.then((value) => setId(value.id));
  }, [params]);

  if (!id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#244A3B]" />
      </div>
    );
  }

  return <EditServiceForm id={id} />;
}
