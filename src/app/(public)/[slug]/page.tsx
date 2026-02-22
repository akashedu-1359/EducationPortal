import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { config } from "@/config";
import type { StaticPage } from "@/types";

interface Props {
  params: { slug: string };
}

async function getPage(slug: string): Promise<StaticPage | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/cms/pages/${slug}`, {
      next: { tags: [`cms-page-${slug}`, "cms-pages"], revalidate: 86400 }, // ISR — 24h
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as StaticPage;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return {};
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function StaticCmsPage({ params }: Props) {
  const page = await getPage(params.slug);

  if (!page || page.status !== "Published") {
    notFound();
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container-pad">
        <div className="mx-auto max-w-3xl">
          <h1 className="page-title">{page.title}</h1>
          {page.publishedAt && (
            <p className="page-subtitle">
              Last updated:{" "}
              {new Date(page.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          <div
            className="prose prose-slate mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}
