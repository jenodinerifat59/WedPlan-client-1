
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarCheck,
  UserRound,
} from "lucide-react";

const links = [
  {
    name: "Overview",
    href: "/vendor",
    icon: LayoutDashboard,
  },
  {
    name: "My Services",
    href: "/vendor/services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Booking Requests",
    href: "/vendor/bookings",
    icon: CalendarCheck,
  },
  {
    name: "My Profile",
    href: "/vendor/profile",
    icon: UserRound,
  },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 min-h-screen bg-[#18382D] text-white p-5">
      <Link href="/vendor" className="text-2xl font-bold">
        WedPlan
      </Link>

      <p className="text-sm text-gray-300 mt-2 mb-8">
        Vendor Dashboard
      </p>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            (link.href !== "/vendor" &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active
                  ? "bg-[#B68B62] text-white"
                  : "text-gray-200 hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
