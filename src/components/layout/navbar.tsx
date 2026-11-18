"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, X, PlusCircle, ShieldAlert, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification/notification-bell";

interface NavbarProps {
  user?: {
    name?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm group-hover:bg-red-700 transition-colors">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-gray-950">
              Blood<span className="text-red-600">Bridge</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Life-saving matching</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/find-blood" prefetch={true} className="hover:text-red-600 transition-colors">
            Find Blood
          </Link>
          <Link href="/become-donor" prefetch={true} className="hover:text-red-600 transition-colors">
            Become a Donor
          </Link>
          <Link href="/how-it-works" prefetch={true} className="hover:text-red-600 transition-colors">
            How It Works
          </Link>
          <Link href="/about" prefetch={true} className="hover:text-red-600 transition-colors">
            About
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard/requests/new">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-1.5 shadow-sm">
                  <PlusCircle className="w-4 h-4" /> Request Blood
                </Button>
              </Link>

              <Link href="/dashboard/donor">
                <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                  Donor Hub
                </Button>
              </Link>

              <Link href="/dashboard/requests">
                <Button variant="ghost" size="sm" className="text-gray-700">
                  My Requests
                </Button>
              </Link>

              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="gap-1 bg-amber-50 text-amber-900 border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Admin
                  </Button>
                </Link>
              )}

              <NotificationBell />

              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="icon" type="submit" title="Sign out" className="text-gray-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/find-blood"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              Find Blood
            </Link>
            <Link
              href="/become-donor"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              Become a Donor
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              About
            </Link>

            {user ? (
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <Link
                  href="/dashboard/requests/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2 bg-red-600 text-white rounded-md font-medium text-sm"
                >
                  Request Blood
                </Link>
                <Link
                  href="/dashboard/donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  Donor Dashboard
                </Link>
                <Link
                  href="/dashboard/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  My Requests
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md bg-amber-50 text-amber-800 font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-red-600 text-white rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
