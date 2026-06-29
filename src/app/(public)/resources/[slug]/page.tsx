import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Clock, Users, Tag,
} from "lucide-react";
import { config } from "@/config";
import { formatDate, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ResourceAccessCard } from "@/components/resources/ResourceAccessCard";
import { ResourcePriceLabel } from "@/components/resources/ResourcePriceLabel";
import type { ResourceDetail } from "@/types";

interface Props {
  params: { slug: string };
}

async function getResource(slug: string): Promise<ResourceDetail | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/resources/${slug}`, {
      next: { revalidate: 600 }, // ISR — 10 minutes
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ResourceDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getResource(params.slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.description,
    openGraph: {
      title: r.title,
      description: r.description,
      images: r.thumbnailUrl ? [r.thumbnailUrl] : [],
    },
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const resource = await getResource(params.slug);
  if (!resource) notFound();

  return (
    <div className="py-10">
      <div className="container-pad">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/resources" className="hover:text-slate-700">Resources</Link>
              <span>/</span>
              <span className="text-slate-600">{resource.category?.name}</span>
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900">{resource.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge variant={resource.type === "Video" ? "primary" : resource.type === "PDF" ? "success" : "info"}>
                {resource.type}
              </Badge>
              <ResourcePriceLabel
                pricingType={resource.pricingType}
                price={resource.price}
                currency={resource.currency}
              />
              {resource.durationMinutes && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  {formatDuration(resource.durationMinutes)}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                {resource.enrollmentCount} enrolled
              </span>
            </div>

            {/* Thumbnail */}
            {resource.thumbnailUrl && (
              <div className="relative mt-6 h-64 overflow-hidden rounded-2xl sm:h-80">
                <Image
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h2 className="section-title mb-3">About this resource</h2>
              <p className="text-slate-600 leading-relaxed">{resource.description}</p>
            </div>

            {/* Tags */}
            {resource.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-slate-400" />
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Author & Date */}
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {resource.authorName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-700">{resource.authorName}</p>
                <p>{resource.publishedAt ? `Published ${formatDate(resource.publishedAt)}` : "Draft"}</p>
              </div>
            </div>
          </div>

          {/* Sidebar — enroll / access card */}
          <div className="lg:col-span-1">
            <ResourceAccessCard resource={resource} />
          </div>
        </div>

        {/* Related Resources */}
        {resource.relatedResources?.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-5">Related Resources</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resource.relatedResources.map((r) => (
                <Link
                  key={r.id}
                  href={`/resources/${r.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-card-hover transition-shadow shadow-card"
                >
                  <p className="line-clamp-2 font-medium text-slate-900">{r.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="default" className="text-xs">{r.type}</Badge>
                    {r.pricingType === "Free" && <Badge variant="success" className="text-xs">Free</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
