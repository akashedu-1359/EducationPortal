"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { BookLoader } from "@/components/ui/book-loader";

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const currentPath = useRef(pathname);

  // Detect link clicks to start the loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash-only links, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("#") ||
        href === currentPath.current
      ) return;

      setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Hide loader when the new page has rendered
  useEffect(() => {
    currentPath.current = pathname;
    setLoading(false);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(248, 250, 252, 0.88)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      aria-live="polite"
      aria-label="Navigating…"
    >
      <BookLoader text="Loading…" />
    </div>
  );
}

export function NavigationLoader() {
  return (
    <Suspense>
      <NavigationLoaderInner />
    </Suspense>
  );
}
