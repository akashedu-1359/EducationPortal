"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  Award,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasRole } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Content",
    href: "/admin/resources",
    icon: BookOpen,
    children: [
      { label: "All Resources", href: "/admin/resources" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Upload", href: "/admin/resources/new" },
    ],
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: PanelLeft,
    children: [
      { label: "Banners", href: "/admin/cms/banners" },
      { label: "Pages", href: "/admin/cms/pages" },
      { label: "FAQs", href: "/admin/cms/faqs" },
      { label: "Footer", href: "/admin/cms/footer" },
      { label: "Sections", href: "/admin/cms/sections" },
      { label: "Settings", href: "/admin/cms/settings" },
      { label: "Feature Flags", href: "/admin/cms/feature-flags" },
    ],
  },
  {
    label: "Exams",
    href: "/admin/exams",
    icon: FileText,
    children: [
      { label: "All Exams", href: "/admin/exams" },
      { label: "Question Bank", href: "/admin/questions" },
      { label: "Attempts", href: "/admin/exam-attempts" },
    ],
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    label: "Payments",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["SuperAdmin", "Admin", "Analyst"],
  },
];

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    item.children?.some((c) => pathname.startsWith(c.href));

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary-600 text-white"
            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
          isActive ? "text-slate-900" : "text-slate-600"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </div>
      <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-200 pl-4">
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className={cn(
              "block rounded-md px-2 py-1.5 text-sm transition-colors",
              pathname === child.href || pathname.startsWith(child.href + "/")
                ? "font-medium text-primary-700 bg-primary-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            )}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const isSuperAdmin = useHasRole("SuperAdmin");

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">EduPortal</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            if (
              item.roles &&
              !item.roles.includes(
                isSuperAdmin ? "SuperAdmin" : "Admin"
              )
            ) {
              return null;
            }
            return <NavGroup key={item.href} item={item} />;
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
