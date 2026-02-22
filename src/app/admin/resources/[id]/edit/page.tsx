"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { resourcesApi } from "@/lib/resources";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/admin/FileUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { ResourceType, PricingType, UpdateResourceRequest } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(["Video", "PDF", "Blog"]),
  categoryId: z.string().min(1, "Select a category"),
  pricingType: z.enum(["Free", "Paid"]),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  tags: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminResourceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");

  const { data: resource, isLoading } = useQuery({
    queryKey: ["admin", "resource", id],
    queryFn: () => resourcesApi.adminList({ pageNumber: 1, pageSize: 1 }).then((r) => {
      const found = r.items.find((x) => x.id === id);
      if (!found) throw new Error("Not found");
      return found;
    }),
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: resourcesApi.getCategories,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (resource) {
      reset({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        categoryId: resource.categoryId,
        pricingType: resource.pricingType,
        price: resource.price,
        currency: resource.currency ?? "INR",
        tags: resource.tags?.join(", "),
        durationMinutes: resource.durationMinutes,
      });
      setThumbnailUrl(resource.thumbnailUrl ?? "");
    }
  }, [resource, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateResourceRequest) => resourcesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast.success("Resource updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const pricingType = watch("pricingType");
  const resourceType = watch("type");

  function onSubmit(data: FormData) {
    const payload: UpdateResourceRequest = {
      ...data,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      thumbnailUrl: thumbnailUrl || undefined,
    };
    mutation.mutate(payload);
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
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/resources")}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="page-title">Edit Resource</h1>
          <p className="page-subtitle truncate max-w-sm text-slate-400">{resource?.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <h2 className="font-semibold text-slate-900">Basic Info</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
              <Input {...register("title")} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
              <Textarea {...register("description")} rows={3} />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
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
                <Input {...register("tags")} placeholder="react, javascript" />
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

          {resourceType === "Blog" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-slate-900">Blog Content</h2>
              <RichTextEditor value={blogContent} onChange={setBlogContent} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-3 font-semibold text-slate-900">Thumbnail</h2>
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />
            )}
            <FileUpload
              accept="image/*"
              maxSizeMB={5}
              onUpload={(url) => setThumbnailUrl(url)}
              label="Replace thumbnail"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
            <h2 className="font-semibold text-slate-900">Pricing</h2>
            <div className="flex gap-4">
              {(["Free", "Paid"] as PricingType[]).map((pt) => (
                <label key={pt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register("pricingType")} value={pt} className="text-primary-600" />
                  <span className="text-sm text-slate-700">{pt}</span>
                </label>
              ))}
            </div>
            {pricingType === "Paid" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Price</label>
                  <Input type="number" {...register("price")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Currency</label>
                  <Input {...register("currency")} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting || mutation.isPending}>
              Save Changes
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/admin/resources")}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
