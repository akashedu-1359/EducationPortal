"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Pencil, ExternalLink, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { FooterConfig, FooterLink, SocialLink } from "@/types";

const SOCIAL_PLATFORMS: SocialLink["platform"][] = [
  "Twitter", "Facebook", "Instagram", "LinkedIn", "YouTube",
];

function LinkFormModal({
  link,
  columnId,
  onClose,
}: {
  link: FooterLink | null;
  columnId: string; // eslint-disable-line @typescript-eslint/no-unused-vars
  onClose: (saved: boolean) => void;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      label: link?.label ?? "",
      url: link?.url ?? "",
      isExternal: link?.isExternal ?? false,
    },
  });

  function onSubmit(_data: { label: string; url: string; isExternal: boolean }) {
    onClose(true);
  }

  return (
    <Modal isOpen onClose={() => onClose(false)} title={link ? "Edit Link" : "Add Link"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Label *</label>
          <Input {...register("label", { required: true })} placeholder="e.g. Privacy Policy" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">URL *</label>
          <Input {...register("url", { required: true })} placeholder="/privacy or https://..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register("isExternal")} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
          <span className="text-sm text-slate-700">Open in new tab (external link)</span>
        </label>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit">Save Link</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCmsFooterPage() {
  const qc = useQueryClient();
  const [editingLink, setEditingLink] = useState<{ link: FooterLink | null; columnId: string } | null>(null);
  const [copyrightEdit, setCopyrightEdit] = useState(false);
  const [copyright, setCopyright] = useState("");

  const { data: footer, isLoading } = useQuery({
    queryKey: ["admin", "cms", "footer"],
    queryFn: cmsAdminApi.getFooter,
    onSuccess: (data) => setCopyright(data.copyrightText),
  } as any);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FooterConfig>) => cmsAdminApi.updateFooter(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "footer"] });
      toast.success("Footer updated");
      setCopyrightEdit(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function toggleSocial(platform: SocialLink["platform"], url: string, currentActive: boolean) {
    if (!footer) return;
    const updated = footer.socialLinks.map((s) =>
      s.platform === platform ? { ...s, isActive: !currentActive } : s
    );
    updateMutation.mutate({ socialLinks: updated });
  }

  function updateSocialUrl(platform: SocialLink["platform"], url: string) {
    if (!footer) return;
    const existing = footer.socialLinks.find((s) => s.platform === platform);
    const updated = existing
      ? footer.socialLinks.map((s) => (s.platform === platform ? { ...s, url } : s))
      : [...footer.socialLinks, { platform, url, isActive: true }];
    updateMutation.mutate({ socialLinks: updated });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Footer</h1>
        <p className="page-subtitle">Manage footer columns, links, social media, and copyright.</p>
      </div>

      {/* Copyright */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Copyright Text</h2>
          {!copyrightEdit && (
            <button
              onClick={() => setCopyrightEdit(true)}
              className="text-sm text-primary-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {copyrightEdit ? (
          <div className="flex items-center gap-3">
            <Input
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => updateMutation.mutate({ copyrightText: copyright })}
              isLoading={updateMutation.isPending}
            >
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCopyrightEdit(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-600">{footer?.copyrightText || "—"}</p>
        )}
      </div>

      {/* Footer columns */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Footer Columns & Links</h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0 md:divide-x">
          {footer?.columns.map((col) => (
            <div key={col.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-slate-900">{col.title}</p>
                <button
                  onClick={() => setEditingLink({ link: null, columnId: col.id })}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add link
                </button>
              </div>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      {link.isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {link.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingLink({ link, columnId: col.id })}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
                {col.links.length === 0 && (
                  <p className="text-xs text-slate-400">No links yet.</p>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 font-semibold text-slate-900">Social Media Links</h2>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const existing = footer?.socialLinks.find((s) => s.platform === platform);
            return (
              <div key={platform} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={existing?.isActive ?? false}
                      onChange={() => toggleSocial(platform, existing?.url ?? "", existing?.isActive ?? false)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600"
                    />
                    <span className="text-sm font-medium text-slate-700">{platform}</span>
                  </label>
                </div>
                <Input
                  placeholder={`https://${platform.toLowerCase()}.com/...`}
                  defaultValue={existing?.url ?? ""}
                  onBlur={(e) => updateSocialUrl(platform, e.target.value)}
                  className="flex-1"
                />
              </div>
            );
          })}
        </div>
      </div>

      {editingLink && (
        <LinkFormModal
          link={editingLink.link}
          columnId={editingLink.columnId}
          onClose={(saved) => {
            setEditingLink(null);
            if (saved) qc.invalidateQueries({ queryKey: ["admin", "cms", "footer"] });
          }}
        />
      )}
    </div>
  );
}
