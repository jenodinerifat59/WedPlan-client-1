
import Link from "next/link";
import {
 
  Heart,
  
} from "lucide-react";




export default function Footer() {
  return (
       <footer className="bg-[#18382C] px-5 pb-8 pt-16 text-white md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Heart size={19} />
              </span>
              <span className="font-heading text-2xl font-semibold">
                WedPlan<span className="text-[#D5B795]">.</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              Bringing beautiful love stories to life, one celebration
              at a time. Your dream day deserves the perfect plan.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/contact"
                aria-label="Contact WedPlan"
                className="rounded-full border border-white/20 p-3 transition hover:bg-white/10"
              >
                {/* <Instagram size={17} /> */}
              </Link>
              <Link
                href="/services"
                aria-label="Explore services"
                className="rounded-full border border-white/20 p-3 transition hover:bg-white/10"
              >
                <Heart size={17} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-semibold">Explore</h3>
            <div className="space-y-4 text-sm text-white/55">
              <Link href="/" className="block hover:text-white">Home</Link>
              <Link href="/services" className="block hover:text-white">Services</Link>
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/contact" className="block hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-semibold">Get started</h3>
            <div className="space-y-4 text-sm text-white/55">
              <Link href="/login" className="block hover:text-white">Login</Link>
              <Link href="/register" className="block hover:text-white">Create Account</Link>
              <Link href="/services" className="block hover:text-white">Find Services</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 pt-7 text-xs text-white/40 sm:flex-row">
          <p>© 2026 WedPlan. All rights reserved.</p>
          <p>Made with love for your forever.</p>
        </div>
      </footer>
  );
}
