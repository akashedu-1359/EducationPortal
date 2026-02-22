import Link from "next/link";
import { BookOpen, GraduationCap, Play, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { config } from "@/config";
import type { HomepageCmsData } from "@/types";

// ── Data fetching (server-side, ISR-cached) ──────────────────────────────────

async function getHomepageData(): Promise<HomepageCmsData | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/cms/homepage`, {
      next: { tags: ["cms-homepage"], revalidate: 3600 }, // ISR — revalidate every 1h
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as HomepageCmsData;
  } catch {
    return null;
  }
}

// ── Static fallback content (shown when API is unavailable) ──────────────────

const FEATURES = [
  {
    icon: Play,
    title: "Video Courses",
    description:
      "High-quality video lectures from industry experts, accessible anytime.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: FileText,
    title: "PDF Resources",
    description:
      "Downloadable study materials, guides, and reference documents.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: BookOpen,
    title: "Blog Articles",
    description:
      "In-depth articles keeping you up-to-date with industry trends.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: GraduationCap,
    title: "Certificates",
    description:
      "Earn verifiable certificates upon passing exams. Share on LinkedIn.",
    color: "bg-amber-100 text-amber-600",
  },
];

const STATS = [
  { value: "10,000+", label: "Students enrolled" },
  { value: "500+", label: "Resources available" },
  { value: "50+", label: "Expert instructors" },
  { value: "95%", label: "Pass rate" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse & Enroll",
    description: "Explore our library. Free content is available instantly.",
  },
  {
    step: "02",
    title: "Learn at Your Pace",
    description: "Watch videos, read PDFs, and study blog articles on your schedule.",
  },
  {
    step: "03",
    title: "Take the Exam",
    description: "Prove your knowledge with our timed, server-validated exams.",
  },
  {
    step: "04",
    title: "Earn Your Certificate",
    description: "Download and share your verifiable certificate upon passing.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const cms = await getHomepageData();
  const heroBanner = cms?.banners?.find((b) => b.type === "Hero");

  return (
    <>
      {/* Promo Banner */}
      {cms?.promoBanner?.isActive && (
        <div
          className="py-2.5 text-center text-sm font-medium"
          style={{
            backgroundColor: cms.promoBanner.backgroundColor || "#4f46e5",
            color: cms.promoBanner.textColor || "#ffffff",
          }}
        >
          {cms.promoBanner.message}
          {cms.promoBanner.linkText && cms.promoBanner.linkUrl && (
            <Link
              href={cms.promoBanner.linkUrl}
              className="ml-2 underline underline-offset-2"
            >
              {cms.promoBanner.linkText} →
            </Link>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 py-20 lg:py-28">
        <div className="container-pad relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
              Learn without limits
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heroBanner?.title || "Premium Education,\nAnywhere."}
            </h1>

            <p className="mt-5 text-lg text-slate-300">
              {heroBanner?.subtitle ||
                "Access video courses, PDFs, and articles. Take exams and earn verifiable certificates — all in one place."}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-500"
              >
                Browse Resources
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800/30 via-transparent to-transparent"
        />
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container-pad">
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-bold text-slate-900">{stat.value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="container-pad">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Everything you need to learn and grow
            </h2>
            <p className="mt-3 text-slate-500">
              One platform, multiple content formats, real certifications.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="container-pad">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-500">
              From sign-up to certified in four simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-8 top-5 hidden h-0.5 w-full bg-slate-200 lg:block"
                  />
                )}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container-pad text-center">
          <h2 className="text-3xl font-bold text-white">
            Start learning today — it&apos;s free
          </h2>
          <p className="mt-3 text-primary-100">
            Join thousands of learners already growing their skills on EduPortal.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-lg transition-colors hover:bg-primary-50"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse Resources
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-200">
            {["No credit card required", "Free content available", "Cancel anytime"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
