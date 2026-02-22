"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { resourcesApi } from "@/lib/resources";
import { storageApi } from "@/lib/storage";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/admin/FileUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { ResourceType, PricingType, CreateResourceRequest } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description required"),
  type: z.enum(["Video", "PDF", "Blog"]),
  categoryId: z.string().min(1, "Select a category"),
  pricingType: z.enum(["Free", "Paid"]),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  tags: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminResourceNewPage() {
  const router = useRouter();
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: resourcesApi.getCategories,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "Video",
      pricingType: "Free",
      currency: "INR",
    },
  });

  const pricingType = watch("pricingType");
  const resourceType = watch("type");

  const mutation = useMutation({
    mutationFn: (data: CreateResourceRequest) => resourcesApi.create(data),
    onSuccess: (resource) => {
      toast.success("Resource created");
      router.push(`/admin/resources/${resource.id}/edit`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function onSubmit(data: FormData) {
    const payload: CreateResourceRequest = {
      ...data,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    mutation.mutate(payload);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/resources")}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="page-title">Add Resource</h1>
          <p className="page-subtitle">Create a new video, PDF, or blog resource.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <h2 className="font-semibold text-slate-900">Basic Info</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
              <Input {...register("title")} placeholder="Resource title" />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
              <Textarea {...register("description")} placeholder="Brief description…" rows={3} />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Type *</label>
                <select
                  {...register("type")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Video">Video</option>
                  <option value="PDF">PDF</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                <select
                  {...register("categoryId")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select category…</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
                <Input {...register("tags")} placeholder="react, javascript, beginner" />
                <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
              </div>
              {(resourceType === "Video" || resourceType === "PDF") && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Duration (minutes)</label>
                  <Input type="number" {...register("durationMinutes")} min={1} />
                </div>
              )}
            </div>
          </div>

          {/* Content upload */}
          {resourceType !== "Blog" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-slate-900">
                {resourceType} File
              </h2>
              <FileUpload
                accept={resourceType === "Video" ? "video/*" : "application/pdf"}
                maxSizeMB={resourceType === "Video" ? 2048 : 100}
                onUpload={(url) => setContentUrl(url)}
                label={`Upload ${resourceType} file`}
              />
              {contentUrl && (
                <p className="mt-2 text-xs text-green-600">
                  Uploaded: {contentUrl.split("/").pop()}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-slate-900">Blog Content</h2>
              <RichTextEditor value={blogContent} onChange={setBlogContent} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Thumbnail */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 font-semibold text-slate-900">Thumbnail</h2>
            <FileUpload
              accept="image/*"
              maxSizeMB={5}
              onUpload={(url) => setThumbnailUrl(url)}
              label="Upload thumbnail image"
            />
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="mt-3 h-28 w-full rounded-lg object-cover"
              />
            )}
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
            <h2 className="font-semibold text-slate-900">Pricing</h2>
            <div className="flex gap-4">
              {(["Free", "Paid"] as PricingType[]).map((pt) => (
                <label key={pt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register("pricingType")}
                    value={pt}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-slate-700">{pt}</span>
                </label>
              ))}
            </div>
            {pricingType === "Paid" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Price *</label>
                  <Input type="number" {...register("price")} placeholder="499" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Currency</label>
                  <Input {...register("currency")} defaultValue="INR" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting || mutation.isPending}
            >
              Create Resource
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/admin/resources")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
