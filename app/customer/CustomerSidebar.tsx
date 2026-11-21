
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Heart,
  Home,
  ChevronRight,
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
    <aside className="h-fit w-full shrink-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:w-[250px]">

      {/* Brand */}
      <Link
        href="/"
        className="group flex items-center gap-3 border-b border-gray-100 pb-6"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#244A3B] text-white transition group-hover:bg-[#18382D]">
          <Heart size={23} />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18382D]">
            WedPlan
          </h2>
          <p className="text-xs text-gray-500">
            Customer Portal
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="mt-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-gray-400">
          Menu
        </p>

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
                className={`group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-[#244A3B] text-white shadow-sm"
                    : "text-gray-600 hover:bg-[#F8F6F0] hover:text-[#244A3B]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-[#244A3B]"
                    }
                  />

                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </span>

                {isActive && (
                  <ChevronRight size={17} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-7 border-t border-gray-100 pt-5">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#F8F6F0] hover:text-[#244A3B]"
        >
          <Home
            size={19}
            className="text-gray-400 transition group-hover:text-[#244A3B]"
          />
          Back to Home
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-6 rounded-xl bg-[#F8F6F0] p-4">
        <div className="flex items-center gap-2 text-[#244A3B]">
          <Heart size={15} />
          <span className="text-xs font-semibold">
            Made for your special day
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Plan, manage and celebrate your perfect wedding with WedPlan.
        </p>
      </div>
    </aside>
  );
}
