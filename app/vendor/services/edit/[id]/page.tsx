
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken } from "@/lib/get-token";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
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

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
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

        setFormData({
          serviceName: data.serviceName || "",
          category: data.category || "",
          description: data.description || "",
          price: data.price || 0,
          location: data.location || "",
          images: data.images || [],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = await getAuthToken();

      const payload = {
        ...formData,
        images: formData.images
          .map((image) => image.trim())
          .filter(Boolean),
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

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#18382D]">
            <ImageIcon size={17} />
            Image URLs
          </label>

          <textarea
            value={formData.images.join("\n")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                images: e.target.value.split("\n"),
              }))
            }
            rows={4}
            placeholder="Enter one image URL per line"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#244A3B]"
          />

          <p className="mt-2 text-xs text-gray-400">
            Enter one image URL per line.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/vendor/services"
            className="rounded-full border border-gray-200 px-7 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
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
