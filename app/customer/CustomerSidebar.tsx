"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Heart,
  Home,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/customer",
    icon: LayoutDashboard,
  },
  {
    name: "My Bookings",
    href: "/customer/bookings",
    icon: CalendarDays,
  },
  {
    name: "My Profile",
    href: "/customer/profile",
    icon: UserRound,
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="mb-7">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#244A3B] font-bold text-xl"
        >
          <Heart size={24} />
          WedPlan
        </Link>

        <p className="text-sm text-gray-500 mt-1">
          Customer Dashboard
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/customer"
              ? pathname === "/customer"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                isActive
                  ? "bg-[#244A3B] text-white"
                  : "text-gray-600 hover:bg-[#F8F6F0] hover:text-[#244A3B]"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 mt-6 pt-5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-[#F8F6F0] transition"
        >
          <Home size={19} />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}