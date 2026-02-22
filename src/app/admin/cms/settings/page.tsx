"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/admin/FileUpload";
import type { SiteSettings } from "@/types";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  supportEmail: z.string().email("Must be a valid email"),
  supportPhone: z.string().optional(),
  address: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminCmsSettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "cms", "settings"],
    queryFn: cmsAdminApi.getSettings,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } =
    useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: SettingsFormData) => cmsAdminApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "settings"] });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Site Settings</h1>
          <p className="page-subtitle">Global configuration for the platform.</p>
        </div>
        <Button
          onClick={handleSubmit((d) => saveMutation.mutate(d))}
          isLoading={saveMutation.isPending}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="section-title mb-4">Branding</h2>
          <div className="space-y-4">
            <Input label="Site Name" error={errors.siteName?.message} required {...register("siteName")} />
            <FileUpload
              purpose="cms-image"
              label="Logo"
              currentUrl={settings?.logoUrl}
              onUploadComplete={(url) => setValue("logoUrl", url, { shouldDirty: true })}
            />
            <FileUpload
              purpose="cms-image"
              label="Favicon (32×32 PNG)"
              currentUrl={settings?.faviconUrl}
              onUploadComplete={(url) => setValue("faviconUrl", url, { shouldDirty: true })}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="section-title mb-4">Contact Details</h2>
          <div className="space-y-4">
            <Input label="Support Email" type="email" error={errors.supportEmail?.message} required {...register("supportEmail")} />
            <Input label="Support Phone" {...register("supportPhone")} />
            <Input label="Address" {...register("address")} />
          </div>
        </div>

        {/* Analytics */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="section-title mb-4">Analytics & Tracking</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Google Analytics ID" placeholder="G-XXXXXXXXXX" {...register("googleAnalyticsId")} />
            <Input label="Facebook Pixel ID" placeholder="1234567890" {...register("facebookPixelId")} />
          </div>
        </div>
      </div>
    </div>
  );
}
