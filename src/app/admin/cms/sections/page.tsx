"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomepageSection, SectionType } from "@/types";

const SECTION_LABELS: Record<SectionType, string> = {
  Features: "Features Grid",
  Testimonials: "Testimonials",
  Stats: "Platform Stats",
  HowItWorks: "How It Works Steps",
  CallToAction: "Call to Action Banner",
};

const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  Features: "Highlight key platform features with icons",
  Testimonials: "Display student reviews and testimonials",
  Stats: "Show platform metrics (users, resources, etc.)",
  HowItWorks: "Step-by-step guide for new users",
  CallToAction: "Promotional banner with CTA button",
};

export default function AdminCmsSectionsPage() {
  const qc = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ["admin", "cms", "sections"],
    queryFn: cmsAdminApi.getSections,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HomepageSection> }) =>
      cmsAdminApi.updateSection(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "sections"] });
      toast.success("Section updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function toggleActive(section: HomepageSection) {
    updateMutation.mutate({ id: section.id, data: { isActive: !section.isActive } });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const sorted = [...(sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Homepage Sections</h1>
        <p className="page-subtitle">
          Show or hide homepage sections. Section order matches the sequence below.
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((section, idx) => (
          <div
            key={section.id}
            className={`flex items-start gap-4 rounded-xl border bg-white p-5 shadow-card transition-opacity ${
              section.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            {/* Drag handle placeholder */}
            <div className="mt-0.5 cursor-grab text-slate-300">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Order badge */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
              {idx + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {SECTION_LABELS[section.type as SectionType] ?? section.type}
                </p>
                <Badge variant={section.isActive ? "success" : "default"} dot>
                  {section.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {SECTION_DESCRIPTIONS[section.type as SectionType]}
              </p>
              {section.title && (
                <p className="mt-1 text-xs text-slate-400">
                  Title: <span className="text-slate-600">{section.title}</span>
                </p>
              )}
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggleActive(section)}
              disabled={updateMutation.isPending}
              className={`rounded-lg p-2 transition-colors ${
                section.isActive
                  ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                  : "text-slate-400 hover:bg-green-50 hover:text-green-600"
              }`}
              title={section.isActive ? "Hide section" : "Show section"}
            >
              {section.isActive ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Changes apply immediately. ISR pages revalidate within the configured interval.
      </p>
    </div>
  );
}
