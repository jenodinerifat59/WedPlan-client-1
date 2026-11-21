
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F8F6F0] px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#18382D]">
            Customer Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your wedding bookings and account.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <CustomerSidebar />

          <section className="min-w-0 flex-1 bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
