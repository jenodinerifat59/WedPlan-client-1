
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Menu,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";

const services = [
  {
    number: "01",
    title: "Wedding Planning",
    description:
      "From the first idea to the final dance, we take care of every little detail.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85",
    tag: "Full Planning",
  },
  {
    number: "02",
    title: "Venue Selection",
    description:
      "Discover beautiful spaces that perfectly match your dream wedding.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=85",
    tag: "Dream Venues",
  },
  {
    number: "03",
    title: "Photography",
    description:
      "Capture every beautiful moment and turn memories into forever.",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=85",
    tag: "Memories",
  },
];

const steps = [
  {
    number: "01",
    title: "Share your vision",
    description:
      "Tell us about your dream wedding, your style and your expectations.",
  },
  {
    number: "02",
    title: "Meet your planner",
    description:
      "We connect you with the right professionals for your celebration.",
  },
  {
    number: "03",
    title: "Celebrate your day",
    description:
      "Relax, enjoy every moment and let us handle the details.",
  },
];

const testimonials = [
  {
    name: "Sarah & James",
    location: "Dhaka, Bangladesh",
    review:
      "WedPlan made our wedding feel like a dream. Every detail was beautiful, and we could enjoy our special day without any stress.",
  },
  {
    name: "Nusrat & Fahim",
    location: "Chattogram, Bangladesh",
    review:
      "Finding the right vendors was so easy. The whole experience was organized, smooth and truly memorable.",
  },
  {
    name: "Maya & Arif",
    location: "Sylhet, Bangladesh",
    review:
      "From venue selection to the final moments, everything felt personal. We couldn't have asked for a better experience.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF9F6] text-[#203C32]">
      {/* Navbar */}
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

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#B68B62]/30 bg-[#B68B62]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#916B47]">
              <Sparkles size={14} />
              Your story, beautifully planned
            </div>

            <h1 className="max-w-2xl font-heading text-5xl leading-[1.12] tracking-tight text-[#203C32] sm:text-6xl lg:text-[76px]">
              Your dream day,
              <span className="mt-2 block font-normal italic text-[#B68B62]">
                our passion.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-[#718078] md:text-lg">
              Every love story deserves a beautiful celebration. Let us
              bring your wedding vision to life with thoughtful planning
              and the perfect team.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="rounded-full bg-[#244A3B] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#244A3B]/15 transition hover:-translate-y-1 hover:bg-[#18382C]"
              >
                Explore Services <ArrowRight className="ml-2 inline" size={16} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#244A3B] transition hover:text-[#B68B62]"
              >
                Discover our story <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-[#203C32]/10 pt-7">
              <div>
                <p className="font-heading text-3xl font-semibold">500+</p>
                <p className="mt-1 text-xs text-[#829087]">Happy couples</p>
              </div>
              <div className="h-10 w-px bg-[#203C32]/15" />
              <div>
                <p className="font-heading text-3xl font-semibold">120+</p>
                <p className="mt-1 text-xs text-[#829087]">Trusted vendors</p>
              </div>
              <div className="h-10 w-px bg-[#203C32]/15" />
              <div>
                <p className="font-heading text-3xl font-semibold">5.0</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#829087]">
                  <Star size={12} className="fill-[#B68B62] text-[#B68B62]" />
                  Couple rating
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="absolute -right-5 -top-5 h-40 w-40 rounded-full bg-[#E9D9C5]/60 blur-3xl" />
            <div className="relative overflow-hidden rounded-t-[48%] rounded-b-[18px] border-[8px] border-white shadow-2xl shadow-[#203C32]/10">
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=90"
                alt="Elegant outdoor wedding celebration"
                className="h-[430px] w-full object-cover sm:h-[560px]"
                width={1200}
                height={430}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#152C22]/35 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-2 max-w-[245px] rounded-2xl border border-white/70 bg-white/95 p-5 shadow-xl sm:-left-8">
              <div className="mb-3 flex -space-x-2">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1500648767791-00dcc994a43e",
                  "photo-1531123897727-8f129e1688ce",
                ].map((photo) => (
                  <Image
                    key={photo}
                    src={`https://images.unsplash.com/${photo}?w=80&h=80&fit=crop`}
                    alt="Happy WedPlan customer"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover"
                    width={80}
                    height={80}
                  />
                ))}
              </div>
              <p className="font-heading text-lg font-semibold">
                Made for your forever
              </p>
              <p className="mt-1 text-xs leading-5 text-[#829087]">
                Beautiful moments start with thoughtful planning.
              </p>
            </div>

            <div className="absolute -right-2 top-12 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold shadow-lg sm:-right-5">
              <Heart size={15} className="fill-[#B68B62] text-[#B68B62]" />
              Made with love
            </div>
          </div>
        </div>
      </section>

      {/* Intro strip */}
      <section className="border-y border-[#203C32]/10 bg-[#F1EFE8] py-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#78867D] md:justify-between md:px-10">
          <span>Thoughtful planning</span>
          <span className="hidden text-[#B68B62] md:block">✳</span>
          <span>Beautiful celebrations</span>
          <span className="hidden text-[#B68B62] md:block">✳</span>
          <span>Trusted professionals</span>
          <span className="hidden text-[#B68B62] md:block">✳</span>
          <span>Memories forever</span>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B68B62]">
              What we offer
            </p>
            <h2 className="font-heading text-4xl leading-tight sm:text-5xl">
              Everything you need,
              <span className="block font-normal italic text-[#B68B62]">
                all in one place.
              </span>
            </h2>
          </div>
          <Link
            href="/services"
            className="flex w-fit items-center gap-2 border-b border-[#244A3B] pb-2 text-sm font-semibold transition hover:gap-4"
          >
            View all services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.number} className="group">
              <div className="relative mb-6 h-[330px] overflow-hidden rounded-2xl bg-[#E9E5DC]">
                <Image
                 height={330}
                 width = {500}
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#244A3B]">
                  {service.tag}
                </span>
                <Link
                  href="/services"
                  aria-label={`Explore ${service.title}`}
                  className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#244A3B] transition group-hover:bg-[#244A3B] group-hover:text-white"
                >
                  <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#B68B62]">
                    {service.number}
                  </p>
                  <h3 className="font-heading text-2xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#829087]">
                    {service.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About / Feature */}
      <section className="bg-[#244A3B] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1000&q=85"
                alt="Wedding table decorated with flowers"
                className="h-[450px] w-full object-cover"
                width={1000}
                height={450}
              />
            </div>
            <div className="absolute -bottom-7 -right-3 rounded-2xl bg-[#F1E7D8] p-5 text-[#244A3B] shadow-xl sm:-right-7">
              <Heart size={22} className="mb-2 fill-[#B68B62] text-[#B68B62]" />
              <p className="font-heading text-2xl font-semibold">Your day.</p>
              <p className="font-heading text-2xl italic">Your story.</p>
            </div>
          </div>

          <div className="md:pl-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#D5B795]">
              A little about us
            </p>
            <h2 className="font-heading text-4xl leading-tight sm:text-5xl">
              More than planning,
              <span className="block font-normal italic text-[#D5B795]">
                we create memories.
              </span>
            </h2>
            <p className="mt-7 text-sm leading-8 text-white/65 md:text-base">
              Your wedding is one of life&apos;s most meaningful moments.
              We believe planning it should be just as special. WedPlan
              brings couples and trusted wedding professionals together
              to make every celebration personal, beautiful and effortless.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Personalized wedding planning",
                "Carefully selected professionals",
                "A smooth and stress-free experience",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#D5B795]">
                    <Check size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/30 px-7 py-4 text-sm font-semibold transition hover:bg-white hover:text-[#244A3B]"
            >
              Get to know us <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B68B62]">
            Simple & seamless
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl">
            Your journey to
            <span className="block italic text-[#B68B62]">
              forever starts here.
            </span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#829087]">
            Three simple steps to make your dream celebration a reality.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative border-t border-[#203C32]/15 pt-7">
              <span className="font-heading text-5xl font-light text-[#D7C6B1]">
                {step.number}
              </span>
              <h3 className="mt-6 font-heading text-2xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#829087]">
                {step.description}
              </p>
              {index !== 2 && (
                <ArrowUpRight className="absolute right-2 top-8 text-[#B68B62]" size={22} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F1EFE8] px-5 py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B68B62]">
              Love notes
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl">
              Words from our couples
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-[#203C32]/10 bg-[#FAF9F6] p-8"
              >
                <div className="mb-6 flex gap-1 text-[#B68B62]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} className="fill-current" />
                  ))}
                </div>
                <p className="font-heading text-lg italic leading-8 text-[#425A4F]">
                  &ldquo;{item.review}&rdquo;
                </p>
                <div className="mt-8 border-t border-[#203C32]/10 pt-5">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#829087]">
                    <MapPin size={12} /> {item.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-[#244A3B] px-7 py-16 text-center text-white md:px-16 md:py-20">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-white/10" />
          <CalendarDays className="mx-auto mb-6 text-[#D5B795]" size={30} />
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#D5B795]">
            Let&apos;s make it happen
          </p>
          <h2 className="relative mx-auto max-w-3xl font-heading text-4xl leading-tight sm:text-6xl">
            Ready to plan your
            <span className="block italic text-[#D5B795]">perfect day?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/65">
            Your beautiful beginning is just one step away. Let&apos;s
            create something unforgettable together.
          </p>
          <Link
            href="/register"
            className="relative mt-9 inline-flex items-center gap-3 rounded-full bg-[#F1E7D8] px-8 py-4 text-sm font-bold text-[#244A3B] transition hover:-translate-y-1 hover:bg-white"
          >
            Start Planning <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
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
    </main>
  );
}
