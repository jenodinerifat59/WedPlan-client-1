
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ArrowRight,
  Heart,
} from "lucide-react";

const contactItems = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Have questions? Send us an email.",
    value: "your-email@example.com",
    href: "mailto:your-email@example.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "We are happy to help you.",
    value: "+880 1XXXXXXXXX",
    href: "tel:+8801XXXXXXXXX",
  },
  {
    icon: MapPin,
    title: "Our Location",
    description: "Serving wedding planning needs.",
    value: "Bangladesh",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F0]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#18382D] px-6 py-24 text-center text-white">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#D6B878]/10 blur-3xl animate-pulse" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl animate-pulse" />

        <div className="relative mx-auto max-w-3xl">
          <Heart className="mx-auto mb-6 h-12 w-12 animate-pulse text-[#D6B878]" />

          <p className="mb-4 animate-[fadeInUp_0.8s_ease-out_both] text-sm font-semibold uppercase tracking-[0.3em] text-[#D6B878]">
            Get In Touch
          </p>

          <h1 className="animate-[fadeInUp_1s_ease-out_both] text-4xl font-bold md:text-6xl">
            Let&apos;s Talk About Your Dream Wedding
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-[fadeInUp_1.2s_ease-out_both] leading-8 text-gray-200">
            Have questions or need help planning your special day? We are here
            to help you find the right wedding services and make your
            celebration unforgettable.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl animate-[fadeInUp_0.8s_ease-out_both] text-center">
          <p className="font-semibold uppercase tracking-widest text-[#A17B3D]">
            Contact Information
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#18382D] md:text-4xl">
            We&apos;d Love to Hear From You
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Choose your preferred way to connect with our team.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {contactItems.map((item, index) => {
            const Icon = item.icon;

            const content = (
              <div
                style={{ animationDelay: `${index * 180}ms` }}
                className="group animate-[fadeInUp_0.8s_ease-out_both] h-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-[#D6B878] hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9E5D9] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#244A3B]">
                  <Icon className="h-8 w-8 text-[#244A3B] transition-colors duration-500 group-hover:text-white" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#18382D] transition-colors duration-300 group-hover:text-[#A17B3D]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {item.description}
                </p>

                <p className="mt-5 break-words font-semibold text-[#244A3B]">
                  {item.value}
                </p>
              </div>
            );

            return item.href ? (
              <a
                key={item.title}
                href={item.href}
                className="block h-full"
              >
                {content}
              </a>
            ) : (
              <div key={item.title} className="h-full">
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
          <div className="animate-[fadeInUp_0.9s_ease-out_both]">
            <p className="font-semibold uppercase tracking-widest text-[#A17B3D]">
              How Can We Help?
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#18382D] md:text-4xl">
              Your Special Day Matters to Us
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Whether you are looking for photographers, decorators, caterers,
              or event planners, WedPlan makes it easier to discover wedding
              services and connect with vendors.
            </p>

            <Link
              href="/services"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#18382D] hover:shadow-xl"
            >
              Explore Services
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="animate-[float_4s_ease-in-out_infinite] rounded-3xl bg-[#E9E5D9] p-8 transition-all duration-500 hover:shadow-xl md:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#244A3B]">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#18382D]">
              Let&apos;s Make It Special
            </h3>

            <p className="mt-4 leading-8 text-gray-600">
              Every wedding is unique. We want to help you discover the
              services that make your celebration truly yours.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl animate-[fadeInUp_0.9s_ease-out_both]">
          <Heart className="mx-auto mb-5 h-10 w-10 animate-pulse text-[#A17B3D]" />

          <h2 className="text-3xl font-bold text-[#18382D]">
            Ready to Plan Your Wedding?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
            Start exploring our services and bring your dream wedding one step
            closer.
          </p>

          <Link
            href="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#244A3B] px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#18382D] hover:shadow-xl"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
