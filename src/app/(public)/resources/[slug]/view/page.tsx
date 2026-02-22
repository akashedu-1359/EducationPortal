import { notFound, redirect } from "next/navigation";
import { config } from "@/config";
import { VideoPlayer } from "@/components/content/VideoPlayer";
import { PdfViewer } from "@/components/content/PdfViewer";
import type { ResourceDetail } from "@/types";

interface Props {
  params: { slug: string };
}

async function getResourceAccess(slug: string): Promise<ResourceDetail | null> {
  // This SSR fetch runs with the user's session cookie to get the signed URL
  try {
    const res = await fetch(`${config.apiUrl}/api/resources/${slug}/access`, {
      cache: "no-store", // always fresh — contains pre-signed S3 URL
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ResourceDetail;
  } catch {
    return null;
  }
}

export default async function ResourceViewPage({ params }: Props) {
  const resource = await getResourceAccess(params.slug);

  if (!resource) notFound();

  // If user hasn't purchased and it's paid, redirect back to detail
  if (resource.pricingType === "Paid" && !resource.isEnrolled && !resource.hasPurchased) {
    redirect(`/resources/${params.slug}`);
  }

  return (
    <div className="py-8">
      <div className="container-pad">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">{resource.title}</h1>

        {resource.type === "Video" && resource.contentUrl && (
          <VideoPlayer
            src={resource.contentUrl}
            title={resource.title}
            poster={resource.thumbnailUrl}
          />
        )}

        {resource.type === "PDF" && (
          <PdfViewer
            src={resource.contentUrl}
            title={resource.title}
            isLocked={!resource.contentUrl}
          />
        )}

        {resource.type === "Blog" && resource.contentUrl && (
          <article className="prose prose-slate mx-auto max-w-3xl">
            {/* Blog content is fetched inline as HTML from the API */}
            <div dangerouslySetInnerHTML={{ __html: resource.contentUrl }} />
          </article>
        )}
      </div>
    </div>
  );
}
