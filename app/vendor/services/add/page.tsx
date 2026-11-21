
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken } from "@/lib/get-token";
import { api } from "@/lib/api";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

export default function AddServicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    serviceName: "",
    category: "",
    description: "",
    price: "",
    location: "",
    images: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const images = form.images
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (images.length === 0) {
      setError("Please provide at least one image URL.");
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

      setSuccess("Service submitted successfully! Waiting for admin approval.");

      setTimeout(() => {
        router.push("/vendor/services");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add service"
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-3xl">
      <Link
        href="/vendor/services"
        className="text-[#244A3B] hover:underline text-sm"
      >
        ← Back to My Services
      </Link>

      <h1 className="text-3xl font-bold text-[#18382D] mt-5">
        Add New Service
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Provide your wedding service details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
      >
        <div>
          <label className="block font-medium mb-2">
            Service Name
          </label>
          <input
            name="serviceName"
            value={form.serviceName}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Example: Professional Wedding Photography"
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            minLength={10}
            rows={5}
            placeholder="Describe your service..."
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Price (BDT)
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="1"
            placeholder="Example: 15000"
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Location
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            minLength={2}
            placeholder="Example: Dhaka, Bangladesh"
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Image URLs
          </label>
          <textarea
            name="images"
            value={form.images}
            onChange={handleChange}
            required
            rows={4}
            placeholder={"Enter one image URL per line\nhttps://example.com/image1.jpg"}
            className="w-full border rounded-lg p-3 outline-none focus:border-[#244A3B]"
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter at least one image URL. Put each URL on a new line.
          </p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </p>
        )}

        {success && (
          <p className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#18382D] text-white py-3 rounded-lg hover:bg-[#244A3B] disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Service"}
        </button>
      </form>
    </div>
  );
}
