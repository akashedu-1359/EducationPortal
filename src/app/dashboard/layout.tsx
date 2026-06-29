"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Award, BookOpen, CreditCard, GraduationCap, History, LayoutDashboard, User } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/components/common/FeatureGate";
import { FullPageSpinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const OVERVIEW_LINK = { label: "Overview", href: "/dashboard", icon: LayoutDashboard };
const MY_CONTENT_LINK = { label: "My Content", href: "/dashboard/my-content", icon: BookOpen };
const CERTIFICATES_LINK = { label: "Certificates", href: "/dashboard/certificates", icon: Award };
const TRANSACTIONS_LINK = { label: "Transactions", href: "/dashboard/transactions", icon: CreditCard };
const PROFILE_LINK = { label: "Profile", href: "/dashboard/profile", icon: User };
const EXAMS_BROWSE_LINK = { label: "Exams", href: "/dashboard/exams", icon: GraduationCap };
const EXAMS_ATTEMPTS_LINK = { label: "My Attempts", href: "/dashboard/exams/attempts", icon: History };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const pathname = usePathname();
  const examsEnabled = useFeatureFlag("enable_exams");
  const certificatesEnabled = useFeatureFlag("enable_certificates");
  const paymentsEnabled = useFeatureFlag("enable_payments");

  const sidebarLinks = useMemo(() => {
    const links = [OVERVIEW_LINK, MY_CONTENT_LINK];
    if (examsEnabled) {
      links.push(EXAMS_BROWSE_LINK, EXAMS_ATTEMPTS_LINK);
    }
    if (certificatesEnabled) {
      links.push(CERTIFICATES_LINK);
    }
    if (paymentsEnabled) {
      links.push(TRANSACTIONS_LINK);
    }
    links.push(PROFILE_LINK);
    return links;
  }, [examsEnabled, certificatesEnabled, paymentsEnabled]);

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
                const isActive =
                  href === "/dashboard/exams"
                    ? pathname === "/dashboard/exams"
                    : pathname === href ||
                      (href !== "/dashboard" && pathname.startsWith(href));
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
