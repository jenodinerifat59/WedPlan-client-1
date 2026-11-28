"use client";

import Link from "next/link";
import { Heart, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-5 py-16">
      <div className="w-full max-w-2xl text-center">

        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#244A3B]/10">
          <Heart className="h-9 w-9 text-[#244A3B]" />
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold tracking-tight text-[#244A3B] sm:text-9xl">
          404
        </h1>

        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#C5A46D]" />

        {/* Text */}
        <h2 className="mt-8 text-2xl font-bold text-[#244A3B] sm:text-3xl">
          Oops! Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
          Looks like this page has wandered off.
          Don't worry, your perfect wedding journey
          is still waiting for you!
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#244A3B] px-8 py-3.5 font-semibold text-white transition hover:bg-[#18382D] sm:w-auto"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#244A3B]/20 px-8 py-3.5 font-semibold text-[#244A3B] transition hover:bg-[#244A3B]/5 sm:w-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-16 text-xs tracking-wide text-gray-400">
          Made with <Heart className="inline h-3 w-3 fill-[#C5A46D] text-[#C5A46D]" /> for your special day · WedPlan
        </p>
      </div>
    </main>
  );
}
