import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { NavigationLoader } from "@/components/ui/navigation-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EduPortal — Learn Without Limits",
    template: "%s | EduPortal",
  },
  description:
    "Access premium educational content, take exams, and earn certificates on EduPortal.",
  keywords: ["education", "online learning", "courses", "certification"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EduPortal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white font-sans antialiased">
        {/* Skip to main content — keyboard/screen reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <NavigationLoader />
          <div id="main-content">{children}</div>
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#4ade80", secondary: "#1e293b" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1e293b" },
            },
          }}
        />
      </body>
    </html>
  );
}
