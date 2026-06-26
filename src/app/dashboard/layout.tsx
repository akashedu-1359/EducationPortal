"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Award, BookOpen, CreditCard, GraduationCap, LayoutDashboard, User } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { FullPageSpinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const BASE_SIDEBAR_LINKS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Content", href: "/dashboard/my-content", icon: BookOpen },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const EXAMS_LINK = { label: "My Exams", href: "/dashboard/exams", icon: GraduationCap };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const pathname = usePathname();
  const examsEnabled = useFeatureFlag("enable_exams");

  const sidebarLinks = useMemo(() => {
    if (!examsEnabled) return BASE_SIDEBAR_LINKS;
    return [
      BASE_SIDEBAR_LINKS[0],
      BASE_SIDEBAR_LINKS[1],
      EXAMS_LINK,
      ...BASE_SIDEBAR_LINKS.slice(2),
    ];
  }, [examsEnabled]);

  if (isLoading || !isAuthenticated) return <FullPageSpinner />;

  return (
    <>
      <Navbar />
      <div className="container-pad py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <nav className="space-y-1">
              {sidebarLinks.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
