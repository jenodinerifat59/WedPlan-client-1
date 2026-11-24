
import Link from "next/link";
import {
  Heart,
  Mail,
  ArrowUpRight,
  Phone,
  MapPin,
} from "lucide-react";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const accountLinks = [
  { name: "Login", href: "/login" },
  { name: "Create Account", href: "/register" },
  { name: "Find Services", href: "/services" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#18382C] px-6 pt-16 pb-7 text-white">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-green-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Main Footer */}
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition-all duration-300 group-hover:rotate-12 group-hover:bg-white/20">
                <Heart
                  size={23}
                  className="fill-emerald-300 text-emerald-300"
                />
              </span>

              <span className="text-2xl font-bold tracking-tight">
                Wed<span className="text-emerald-300">Plan</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
              Bringing beautiful love stories to life, one celebration at
              a time. Your dream day deserves the perfect plan.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/contact"
                aria-label="Contact WedPlan"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-300 hover:text-[#18382C]"
              >
                <Mail size={17} />
              </Link>

              <Link
                href="/services"
                aria-label="Explore services"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-300 hover:text-[#18382C]"
              >
                <Heart size={17} />
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold">Explore</h3>

            <div className="mt-6 flex flex-col gap-4">
              {exploreLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors hover:text-emerald-300"
                >
                  <span>{item.name}</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold">Get Started</h3>

            <div className="mt-6 flex flex-col gap-4">
              {accountLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors hover:text-emerald-300"
                >
                  <span>{item.name}</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold">Get in Touch</h3>

            <div className="mt-6 space-y-5">
              <Link
                href="mailto:support@wedplan.com"
                className="group flex items-start gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300 transition-colors group-hover:bg-emerald-300 group-hover:text-[#18382C]">
                  <Mail size={16} />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    Email us
                  </span>
                  <span className="mt-1 block text-sm text-white/75 transition-colors group-hover:text-emerald-300">
                    support@wedplan.com
                  </span>
                </span>
              </Link>

              <Link
                href="/contact"
                className="group flex items-start gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300 transition-colors group-hover:bg-emerald-300 group-hover:text-[#18382C]">
                  <Phone size={16} />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    Contact
                  </span>
                  <span className="mt-1 block text-sm text-white/75 transition-colors group-hover:text-emerald-300">
                    Get in touch with us
                  </span>
                </span>
              </Link>

              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                  <MapPin size={16} />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    Location
                  </span>
                  <span className="mt-1 block text-sm text-white/75">
                    Dhaka, Bangladesh
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            © 2025 WedPlan. All rights reserved.
          </p>

          <p className="flex items-center gap-2 text-xs text-white/55">
            Made with
            <Heart
              size={14}
              className="fill-emerald-300 text-emerald-300"
            />
            for your forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
