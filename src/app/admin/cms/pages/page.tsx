"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, FileText, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { StaticPage } from "@/types";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(["Draft", "Published"]),
});
type PageFormData = z.infer<typeof pageSchema>;

export default function AdminCmsPagesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
  const [editing, setEditing] = useState<StaticPage | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin", "cms", "pages"],
    queryFn: cmsAdminApi.getPages,
  });

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<PageFormData>({
      resolver: zodResolver(pageSchema),
      defaultValues: { status: "Draft", content: "" },
    });

  const watchTitle = watch("title");

  const saveMutation = useMutation({
    mutationFn: (data: PageFormData) =>
      editing ? cmsAdminApi.updatePage(editing.id, data) : cmsAdminApi.createPage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      toast.success(editing ? "Page updated" : "Page created");
      closeModal();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsAdminApi.deletePage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      toast.success("Page deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "Draft" });
    setModalOpen(true);
  };

  const openEdit = async (page: StaticPage) => {
    setEditing(page);
    const full = await cmsAdminApi.getPage(page.id);
    reset({
      title: full.title,
      slug: full.slug,
      content: full.content,
      metaTitle: full.metaTitle || "",
      metaDescription: full.metaDescription || "",
      status: full.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  // Auto-generate slug from title
  const handleTitleBlur = () => {
    if (!editing) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Static Pages</h1>
          <p className="page-subtitle">Manage Terms, Privacy, About, and other static pages.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          New Page
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <FileText className="mb-3 h-12 w-12 text-slate-200" />
          <p className="font-medium text-slate-700">No pages yet</p>
          <Button className="mt-4" onClick={openCreate}>Create Page</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {pages.map((page, i) => (
            <div
              key={page.id}
              className={`flex items-center justify-between px-5 py-4 ${i < pages.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{page.title}</p>
                  <p className="text-xs text-slate-400">/{page.slug} · Updated {formatDate(page.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={page.status === "Published" ? "success" : "default"} dot>
                  {page.status}
                </Badge>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  className="text-slate-400 hover:text-primary-600 transition-colors"
                  title="View"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <button
                  onClick={() => openEdit(page)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(page)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Page" : "New Page"}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit((d) => saveMutation.mutate(d))} isLoading={saveMutation.isPending}>
              {editing ? "Save Changes" : "Create Page"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" error={errors.title?.message} required {...register("title")} onBlur={handleTitleBlur} />
            <Input label="Slug" placeholder="url-friendly-slug" error={errors.slug?.message} required {...register("slug")} />
          </div>

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="Content"
                value={field.value}
                onChange={field.onChange}
                error={errors.content?.message}
                minHeight={300}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Meta Title" placeholder="SEO title (optional)" {...register("metaTitle")} />
            <Input label="Meta Description" placeholder="160 chars max" error={errors.metaDescription?.message} {...register("metaDescription")} />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="flex gap-2">
                  {(["Draft", "Published"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => field.onChange(s)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        field.value === s
                          ? s === "Published"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-slate-400 bg-slate-100 text-slate-700"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Page"
        description={`Delete "${deleteTarget?.title}"? This will also remove it from the public site.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
