import VendorBookings from "@/components/vendor/VendorBookings";

export default function VendorBookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#18382D]">
        Booking Requests
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Manage your customer booking requests.
      </p>

      <VendorBookings />
    </div>
  );
}
