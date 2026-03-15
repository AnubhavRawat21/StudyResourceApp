"use client";

import Link from "next/link";
import { BookOpen, Search, Download, ShieldCheck, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-[#1A5276]" />
              <span className="ml-2 font-bold text-2xl text-[#1A5276] tracking-tight">
                StudyRes
              </span>
            </div>
            <div>
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="font-medium text-[#1A5276] hover:text-[#143d59] transition-colors"
                >
                  Go to Dashboard &rarr;
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#1A5276] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#143d59] shadow-sm transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-24 flex items-center justify-center">
          <div className="text-center space-y-8 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              All your study materials in <span className="text-[#1A5276]">one organized place</span>.
            </h1>
            <p className="text-xl sm:text-2xl text-gray-500 font-light max-w-2xl mx-auto">
              Access curated lecture notes, presentations, and resources. Filter by subject, instantly download, and stay on top of your coursework.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href={status === "authenticated" ? "/dashboard" : "/register"}
                className="group relative inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-[#1A5276] hover:bg-[#143d59] shadow-lg hover:shadow-xl transition-all w-full sm:w-auto overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center items-center px-8 py-4 border-2 border-[#1A5276] text-lg font-medium rounded-xl text-[#1A5276] hover:bg-blue-50 transition-colors w-full sm:w-auto"
              >
                Login to Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24 sm:py-32 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-6 text-[#1A5276]">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Discovery</h3>
                <p className="text-gray-500">
                  Easily search keywords or filter by subject to find exactly what you need in seconds.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-6 text-[#1A5276]">
                  <Download className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Downloads</h3>
                <p className="text-gray-500">
                  Download materials with one click and keeping track of your entire download history automatically.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-6 text-[#1A5276]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Verified</h3>
                <p className="text-gray-500">
                  All resources are uploaded by verified administrators, ensuring quality and safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-0">
            <BookOpen className="h-6 w-6 text-gray-400" />
            <span className="ml-2 font-semibold text-lg text-gray-300">
              StudyRes
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Student Study Resources Software. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
