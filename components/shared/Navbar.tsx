
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  Menu,
} from "lucide-react";



export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#203C32]/10 bg-[#FAF9F6]/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#244A3B] text-white">
              <Heart size={19} />
            </span>
            <span className="font-heading text-2xl font-semibold tracking-tight">
              WedPlan<span className="text-[#B68B62]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-[#52675E] lg:flex">
            <Link href="/" className="text-[#244A3B]">
              Home
            </Link>
            <Link href="/services" className="transition hover:text-[#B68B62]">
              Services
            </Link>
            <Link href="/about" className="transition hover:text-[#B68B62]">
              About Us
            </Link>
            <Link href="/contact" className="transition hover:text-[#B68B62]">
              Contact
            </Link>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/login"
              className="text-sm font-semibold transition hover:text-[#B68B62]"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#244A3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#18382C]"
            >
              Get Started <ArrowUpRight className="ml-1 inline" size={15} />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            className="rounded-lg border border-[#203C32]/15 p-2 md:hidden"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>
  );
}
