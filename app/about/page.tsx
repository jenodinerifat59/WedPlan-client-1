
import Link from "next/link";
import {
  Heart,
  CalendarDays,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Easy Wedding Planning",
    description:
      "Discover wedding services and organize your special day from one convenient platform.",
  },
  {
    icon: Users,
    title: "Trusted Vendors",
    description:
      "Connect with wedding service providers and find services that match your needs.",
  },
  {
    icon: ShieldCheck,
    title: "Simple Booking",
    description:
      "Book your preferred services through a simple and convenient booking process.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F0]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#18382D] px-6 py-24 text-center text-white">
        <div className="absolute -left-20 top-10 h-64 w-64 animate-pulse rounded-full bg-[#D6B878]/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 animate-pulse rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <Heart className="mx-auto mb-6 h-12 w-12 animate-bounce text-[#D6B878] [animation-duration:3s]" />

          <p className="mb-4 animate-[fadeInUp_0.8s_ease-out_both] text-sm font-semibold uppercase tracking-[0.3em] text-[#D6B878]">
            Welcome to WedPlan
          </p>

          <h1 className="animate-[fadeInUp_1s_ease-out_both] text-4xl font-bold md:text-6xl">
            Making Your Dream Wedding a Reality
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-[fadeInUp_1.2s_ease-out_both] leading-8 text-gray-200">
            Every love story deserves a beautiful celebration. WedPlan helps
            couples discover wedding services, connect with vendors, and
            organize their special day with confidence.
          </p>
        </div>
      </section>

      {/* About & Mission */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
        <div className="animate-[fadeInUp_0.9s_ease-out_both]">
          <p className="mb-3 font-semibold uppercase tracking-widest text-[#A17B3D]">
            Who We Are
          </p>

          <h2 className="text-3xl font-bold text-[#18382D] md:text-4xl">
            Your Wedding Planning Partner
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            WedPlan is a wedding service booking platform designed to make
            wedding planning easier and more organized. We bring couples and
            wedding professionals together in one place.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            From photography and decoration to catering and event management,
            our goal is to help you find the right services for your
            celebration.
          </p>
        </div>

        <div className="animate-[float_4s_ease-in-out_infinite] rounded-3xl bg-[#E9E5D9] p-8 shadow-sm transition-all duration-500 hover:shadow-xl md:p-12">
          <Heart className="h-12 w-12 text-[#244A3B] transition duration-500 hover:rotate-12 hover:scale-125" />

          <h3 className="mt-6 text-2xl font-bold text-[#18382D]">
            Our Mission
          </h3>

          <p className="mt-4 leading-8 text-gray-600">
            To make wedding planning more accessible, transparent, and
            stress-free by connecting customers with suitable wedding service
            providers.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl animate-[fadeInUp_0.8s_ease-out_both] text-center">
            <p className="font-semibold uppercase tracking-widest text-[#A17B3D]">
              Why Choose Us
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#18382D] md:text-4xl">
              Everything You Need in One Place
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  style={{ animationDelay: `${index * 180}ms` }}
                  className="group animate-[fadeInUp_0.8s_ease-out_both] rounded-2xl border border-gray-100 bg-[#F8F6F0] p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-[#D6B878] hover:shadow-xl"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E5D9] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#244A3B]">
                    <Icon className="h-10 w-10 text-[#244A3B] transition-colors duration-500 group-hover:text-white" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#18382D] transition-colors duration-300 group-hover:text-[#A17B3D]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl animate-[fadeInUp_0.9s_ease-out_both]">
          <Heart className="mx-auto mb-5 h-10 w-10 animate-pulse text-[#A17B3D]" />

          <h2 className="text-3xl font-bold text-[#18382D]">
            Let&apos;s Plan Something Beautiful
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Explore our wedding services and take the first step toward your
            dream celebration.
          </p>

          <Link
            href="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#18382D] hover:shadow-xl"
          >
            Explore Services
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
