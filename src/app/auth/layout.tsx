import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary-600 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl">EduPortal</span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold leading-snug">
            Learn without
            <br />
            limits.
          </h1>
          <p className="mt-4 text-lg text-primary-100">
            Access premium courses, PDFs, and blog articles. Take exams and
            earn verifiable certificates.
          </p>

          {/* Testimonial */}
          <div className="mt-12 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <p className="text-base italic text-primary-50">
              &ldquo;EduPortal transformed how I learn. The content quality is
              outstanding, and the certificate I earned opened doors for me.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-sm font-semibold">
                AS
              </div>
              <div>
                <p className="font-semibold">Arjun Sharma</p>
                <p className="text-sm text-primary-200">Software Engineer</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-200">
          &copy; {new Date().getFullYear()} EduPortal. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 font-bold text-slate-900 lg:hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>EduPortal</span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
