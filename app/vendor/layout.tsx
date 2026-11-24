
import type { ReactNode } from "react";
import { Suspense } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";

export default function VendorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F6F0] md:flex">
      <Suspense
        fallback={
          <aside className="min-h-screen w-full bg-[#18382D] md:w-64" />
        }
      >
        <VendorSidebar />
      </Suspense>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        {children}
      </main>
    </div>
  );
}
