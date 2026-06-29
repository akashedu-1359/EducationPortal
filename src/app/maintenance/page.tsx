import Link from "next/link";
import { BookOpen, Clock, Shield, Sparkles, Wrench } from "lucide-react";
import { config } from "@/config";

export const metadata = {
  title: `Maintenance | ${config.appName}`,
  description: `${config.appName} is temporarily unavailable while we perform scheduled maintenance.`,
};

const UPDATES = [
  {
    icon: Sparkles,
    title: "Platform improvements",
    description: "We are refining the learning experience across courses and exams.",
  },
  {
    icon: Shield,
    title: "Security & reliability",
    description: "Routine updates to keep your data safe and the platform running smoothly.",
  },
  {
    icon: Clock,
    title: "Back online shortly",
    description: "Thank you for your patience — we will restore access as soon as work is complete.",
  },
];

export default function MaintenancePage() {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]"
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="container-pad flex h-16 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-900/40">
            <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-lg font-semibold tracking-tight">{config.appName}</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-primary-600/20 via-transparent to-indigo-500/10 px-8 py-10 text-center sm:px-10">
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/20" />
                <span className="absolute inset-2 rounded-full border border-primary-400/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-900/50">
                  <Wrench className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Scheduled maintenance
              </span>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                We&apos;ll be back soon
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-balance text-sm leading-relaxed text-slate-300 sm:text-base">
                {config.appName} is temporarily unavailable while we perform planned updates.
                Your progress and account data remain safe.
              </p>
            </div>

            <div className="space-y-4 px-8 py-8 sm:px-10">
              {UPDATES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 px-8 py-6 text-center sm:px-10">
              <p className="text-xs text-slate-500">
                Need to manage the platform during maintenance?
              </p>
              <Link
                href="/auth/login"
                className="mt-3 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Administrator sign in
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            &copy; {year} {config.appName}. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
