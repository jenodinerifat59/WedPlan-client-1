
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  Menu,
  LogOut,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const userRole = (
    session?.user as
      | (NonNullable<typeof session>["user"] & { role?: string })
      | undefined
  )?.role;

  const userName = session?.user?.name || "User";

  const dashboardHref =
    userRole === "admin"
      ? "/admin"
      : userRole === "vendor"
        ? "/vendor"
        : userRole === "customer"
          ? "/customer"
          : "/";

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `transition-colors duration-200 ${
      isActive(href)
        ? "font-semibold text-[#244A3B]"
        : "text-[#52675E] hover:text-[#B68B62]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#203C32]/10 bg-[#FAF9F6]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-10">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#244A3B] text-white">
            <Heart size={19} />
          </span>

          <span className="font-heading text-2xl font-semibold tracking-tight text-[#244A3B]">
            WedPlan<span className="text-[#B68B62]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-9 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-5 md:flex">
          {!isPending &&
            (session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 rounded-full bg-[#244A3B]/10 px-5 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-[#244A3B] hover:text-white"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <span className="max-w-[130px] truncate text-sm font-medium text-[#244A3B]">
                  Hi, {userName}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-[#244A3B]/20 px-5 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-[#244A3B] hover:text-white"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#244A3B] transition hover:text-[#B68B62]"
                >
                  Log In
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#18382C]"
                >
                  Get Started
                  <ArrowUpRight className="ml-1 inline" size={15} />
                </Link>
              </>
            ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg border border-[#203C32]/15 p-2 text-[#244A3B] transition hover:bg-[#244A3B]/5 md:hidden"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-[#203C32]/10 bg-[#FAF9F6] transition-all duration-300 md:hidden ${
          isOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="space-y-5 px-6 py-6">
          <div className="flex flex-col gap-5 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={linkClass(link.href)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {!isPending && (
            <div className="border-t border-[#203C32]/10 pt-5">
              {session ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[#244A3B]">
                    Hi, {userName}
                  </p>

                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#244A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18382C]"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#244A3B]/20 px-5 py-3 text-sm font-semibold text-[#244A3B] transition hover:bg-[#244A3B] hover:text-white"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-full border border-[#244A3B]/20 py-3 text-center text-sm font-semibold text-[#244A3B]"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-full bg-[#244A3B] py-3 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                    <ArrowUpRight className="ml-1 inline" size={15} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
