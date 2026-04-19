"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";

const NAV_LINKS = [
  { label: "Courses", href: "/resources?type=Video" },
  { label: "PDFs", href: "/resources?type=PDF" },
  { label: "Blog", href: "/resources?type=Blog" },
  { label: "Exams", href: "/exams" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();

  const userMenuItems = [
    {
      label: "My Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      onClick: () => (window.location.href = "/dashboard"),
    },
    {
      label: "My Content",
      icon: <BookOpen className="h-4 w-4" />,
      onClick: () => (window.location.href = "/dashboard/my-content"),
    },
    {
      label: "Certificates",
      icon: <GraduationCap className="h-4 w-4" />,
      onClick: () => (window.location.href = "/dashboard/certificates"),
    },
    { label: "", isDivider: true },
    {
      label: "Profile Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => (window.location.href = "/dashboard/profile"),
    },
    {
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      isDanger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container-pad flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg">EduPortal</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {getInitials(user.fullName)}
                  </span>
                  <span className="hidden sm:block">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              }
              items={userMenuItems}
            />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                <Button size="md" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
