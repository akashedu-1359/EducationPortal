import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "@/config";

/**
 * POST /api/revalidate
 *
 * Called by the .NET backend after admin saves CMS content.
 * Validates REVALIDATION_SECRET and revalidates the specified cache tags.
 *
 * Body: { secret: string; tags: string[] }
 *
 * Standard tags used in this app:
 *   cms-homepage   — homepage banners, sections, promo banner
 *   cms-pages      — all static pages
 *   cms-page-<slug>— single static page
 *   cms-faqs       — FAQ categories and items
 *   cms-footer     — footer config
 *   cms-settings   — site settings
 *   cms-flags      — feature flags
 */
export async function POST(req: NextRequest) {
  const { secret, tags } = await req.json().catch(() => ({}));

  if (!secret || secret !== config.revalidationSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json(
      { message: "tags must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];
  for (const tag of tags) {
    if (typeof tag === "string") {
      revalidateTag(tag);
      revalidated.push(tag);
    }
  }

  return NextResponse.json({ revalidated, now: Date.now() });
}
