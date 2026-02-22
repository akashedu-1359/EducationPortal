export type ResourceType = "Video" | "PDF" | "Blog";
export type ResourceStatus = "Draft" | "Published" | "Archived";
export type PricingType = "Free" | "Paid";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  resourceCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  type: ResourceType;
  status: ResourceStatus;
  pricingType: PricingType;
  price?: number;
  currency?: string;
  categoryId: string;
  category: Category;
  tags: string[];
  durationMinutes?: number;
  authorId: string;
  authorName: string;
  viewCount: number;
  enrollmentCount: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDetail extends Resource {
  contentUrl?: string; // pre-signed S3 URL (only if enrolled or free)
  isEnrolled: boolean;
  hasPurchased: boolean;
  relatedResources: Resource[];
}

export interface Enrollment {
  id: string;
  userId: string;
  resourceId: string;
  resource: Resource;
  enrolledAt: string;
  lastAccessedAt?: string;
  progress: number; // 0-100
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  type: ResourceType;
  categoryId: string;
  pricingType: PricingType;
  price?: number;
  currency?: string;
  tags?: string[];
  durationMinutes?: number;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {
  status?: ResourceStatus;
  thumbnailUrl?: string;
}

export interface ResourceFilters {
  categoryId?: string;
  type?: ResourceType;
  pricingType?: PricingType;
  search?: string;
  tags?: string[];
}
