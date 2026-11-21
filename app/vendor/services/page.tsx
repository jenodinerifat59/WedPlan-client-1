
"use client";

import Link from "next/link";
import {
  Trash2,
  Pencil,
  MapPin,
  Tag,
  ArrowUpRight,
  ImageIcon,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token";
import { api } from "@/lib/api";
import {BriefcaseBusiness, RefreshCw } from "lucide-react";

interface Service {
  _id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  description: string;
  status: string;
  isActive: boolean;
}

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  


const fetchServices = async () => {
  try {
    setLoading(true);
    setError("");

    const token = await getAuthToken();

    const result = await api(
      "/api/vendor/services",
      { method: "GET" },
      token
    );

    // Backend সরাসরি Array return করে
    setServices(Array.isArray(result) ? result : []);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to load services"
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchServices();
  }, []);

  const deleteService = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = await getAuthToken();

      await api(
        `/api/vendor/services/${id}`,
        { method: "DELETE" },
        token
      );

      setServices((previous) =>
        previous.filter((service) => service._id !== id)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete service"
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#18382D]">
            My Services
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your wedding services.
          </p>
        </div>

        <button
          onClick={fetchServices}
          className="flex items-center gap-2 border border-[#18382D] text-[#18382D] px-4 py-2 rounded-lg hover:bg-[#18382D] hover:text-white"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {loading && (
        <p className="text-center py-16 text-gray-500">
          Loading your services...
        </p>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-8">
          {error}
          <button
            onClick={fetchServices}
            className="underline ml-2"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="bg-white border rounded-xl p-10 mt-8 text-center">
          <BriefcaseBusiness
            size={45}
            className="mx-auto text-[#B68B62]"
          />

          <h2 className="text-xl font-semibold text-[#18382D] mt-4">
            No Services Found
          </h2>

          <p className="text-gray-500 mt-2">
            You have not added any services yet.
          </p>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
       
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
  {services.map((service) => (
    <div
      key={service._id}
      className="group bg-white rounded-2xl overflow-hidden border border-[#EAE8E0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Service Image */}
      <div className="relative h-52 bg-[#F1F0EA] overflow-hidden">
        {service.images?.[0] ? (
          <img
            src={service.images[0]}
            alt={service.serviceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={45} className="text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold capitalize backdrop-blur-md ${
            service.status === "approved"
              ? "bg-green-100/95 text-green-800"
              : service.status === "pending"
                ? "bg-amber-100/95 text-amber-800"
                : "bg-red-100/95 text-red-700"
          }`}
        >
          {service.status}
        </span>

        {/* Active Status */}
        <span
          className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium ${
            service.isActive
              ? "bg-[#18382D]/90 text-white"
              : "bg-gray-800/80 text-white"
          }`}
        >
          {service.isActive ? "● Active" : "● Inactive"}
        </span>
      </div>

      {/* Service Details */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center gap-2 text-[#B68B62] text-xs font-semibold mb-3">
          <Tag size={14} />
          <span>{service.category}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#18382D] line-clamp-1 group-hover:text-[#B68B62] transition-colors">
          {service.serviceName}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-3 leading-6 line-clamp-2 min-h-12">
          {service.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <MapPin size={16} className="text-[#B68B62] shrink-0" />
          <span className="truncate">{service.location}</span>
        </div>

        {/* Price */}
        <div className="mt-5 bg-[#F8F6F0] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Service Price</p>
            <p className="text-2xl font-bold text-[#18382D] mt-1">
              ৳{service.price?.toLocaleString("en-BD")}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#E8EFE9] flex items-center justify-center">
            <ArrowUpRight className="text-[#244A3B]" size={20} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Link
            href={`/vendor/services/edit/${service._id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#18382D] text-white text-sm font-medium hover:bg-[#244A3B] transition"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <button
            onClick={() => deleteService(service._id)}
            disabled={deletingId === service._id}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deletingId === service._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

      )}
    </div>
  );
}
