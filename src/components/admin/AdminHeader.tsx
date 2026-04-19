"use client";

import { Bell, LogOut, Menu, Settings, User } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import { Dropdown } from "@/components/ui/dropdown";

export function AdminHeader() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      onClick: () => (window.location.href = "/admin/profile"),
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => (window.location.href = "/admin/settings"),
    },
    { label: "", isDivider: true },
    {
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      isDanger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Mobile sidebar toggle (placeholder — wire with sidebar state) */}
      <button
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-slate-400 lg:block">
        Admin Panel
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          {/* Badge */}
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
          </span>
        </button>

        {/* View public site */}
        <Link
          href="/"
          target="_blank"
          className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors sm:block"
        >
          View Site ↗
        </Link>

        {/* User menu */}
        {user && (
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {getInitials(user.fullName)}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
              </button>
            }
            items={menuItems}
          />
        )}
      </div>
    </header>
  );
}
