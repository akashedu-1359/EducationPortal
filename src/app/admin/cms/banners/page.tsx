"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Image, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/admin/FileUpload";
import type { Banner } from "@/types";

const bannerSchema = z.object({
  type: z.enum(["Hero", "Promotional", "Announcement"]),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});
type BannerFormData = z.infer<typeof bannerSchema>;

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [editing, setEditing] = useState<Banner | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin", "cms", "banners"],
    queryFn: cmsAdminApi.getBanners,
  });

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<BannerFormData>({
      resolver: zodResolver(bannerSchema),
      defaultValues: { type: "Hero", isActive: true },
    });

  const saveMutation = useMutation({
    mutationFn: (data: BannerFormData) =>
      editing
        ? cmsAdminApi.updateBanner(editing.id, data)
        : cmsAdminApi.createBanner(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
      toast.success(editing ? "Banner updated" : "Banner created");
      closeModal();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsAdminApi.deleteBanner(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
      toast.success("Banner deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      cmsAdminApi.updateBanner(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cms", "banners"] }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ type: "Hero", isActive: true, title: "", subtitle: "", ctaText: "", ctaUrl: "", imageUrl: "" });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    reset({
      type: banner.type,
      title: banner.title,
      subtitle: banner.subtitle || "",
      ctaText: banner.ctaText || "",
      ctaUrl: banner.ctaUrl || "",
      imageUrl: banner.imageUrl || "",
      isActive: banner.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Manage hero and promotional banners.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Image className="mb-3 h-12 w-12 text-slate-200" />
          <p className="font-medium text-slate-700">No banners yet</p>
          <Button className="mt-4" onClick={openCreate}>Add Banner</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card"
            >
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-16 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100">
                  <Image className="h-6 w-6 text-slate-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{banner.title}</p>
                  <Badge variant="primary">{banner.type}</Badge>
                  <Badge variant={banner.isActive ? "success" : "default"} dot>
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {banner.subtitle && (
                  <p className="mt-0.5 truncate text-sm text-slate-500">{banner.subtitle}</p>
                )}
                {banner.ctaText && (
                  <p className="mt-0.5 text-xs text-primary-600">CTA: {banner.ctaText}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                  className="text-slate-400 hover:text-primary-600 transition-colors"
                  title={banner.isActive ? "Deactivate" : "Activate"}
                >
                  {banner.isActive ? (
                    <ToggleRight className="h-6 w-6 text-primary-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(banner)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Banner" : "New Banner"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit((d) => saveMutation.mutate(d))} isLoading={saveMutation.isPending}>
              {editing ? "Save Changes" : "Create Banner"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Banner Type"
                options={[
                  { value: "Hero", label: "Hero" },
                  { value: "Promotional", label: "Promotional" },
                  { value: "Announcement", label: "Announcement" },
                ]}
                required
                {...field}
              />
            )}
          />
          <Input label="Title" error={errors.title?.message} required {...register("title")} />
          <Input label="Subtitle" {...register("subtitle")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="CTA Button Text" placeholder="e.g. Browse Courses" {...register("ctaText")} />
            <Input label="CTA URL" placeholder="https://…" error={errors.ctaUrl?.message} {...register("ctaUrl")} />
          </div>
          <FileUpload
            purpose="cms-image"
            label="Banner Image"
            currentUrl={editing?.imageUrl}
            onUploadComplete={(url) => setValue("imageUrl", url)}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Banner"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
