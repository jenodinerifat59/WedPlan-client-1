
import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WedPlan | Your Dream Wedding, Beautifully Planned",
    template: "%s | WedPlan",
  },
  description:
    "Plan your dream wedding with WedPlan. Discover trusted wedding professionals, beautiful venues and personalized wedding planning services.",
  keywords: [
    "WedPlan",
    "Wedding Planner",
    "Wedding Services",
    "Wedding Venues",
    "Wedding Photography",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
       <Suspense fallback={<div className="h-20" />}>
  <Navbar />
</Suspense>
        <main className="flex-1">
          {children}
        </main>

        <Footer />

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
