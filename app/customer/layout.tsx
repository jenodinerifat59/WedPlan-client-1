
import CustomerSidebar from "./CustomerSidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F8F6F0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard Header */}
        <header className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#18382D] sm:text-3xl">
            Customer Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your bookings and make your special day memorable.
          </p>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* Sidebar */}
          <CustomerSidebar />

          {/* Main Content */}
          <section className="min-h-[500px] min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}
