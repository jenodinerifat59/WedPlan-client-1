
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ClipboardList,
  Settings,
  ShieldCheck,
  Menu,
  X,
  Home,
  CreditCard,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Manage Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Manage Services",
    href: "/admin/services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Manage Bookings",
    href: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-[#18382D] px-5 py-4 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <ShieldCheck size={23} />
          <span className="text-lg font-bold">WedPlan Admin</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#18382D] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="border-b border-white/10 px-7 py-7">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2.5">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold">WedPlan</h1>
                <p className="text-xs tracking-widest text-white/50">
                  ADMIN PANEL
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-7">
            <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Management
            </p>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-[#18382D] shadow-md"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={19} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Home size={19} />
              Back to Website
            </Link>

            <div className="mt-3 rounded-xl bg-white/10 p-4">
              <p className="text-sm font-semibold">WedPlan Admin</p>
              <p className="mt-1 text-xs text-white/50">
                Manage your platform
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] p-5 sm:p-7 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
