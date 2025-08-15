export type NormalizedReview = {
  id: string;
  source: "hostaway" | "google";
  externalId?: string;
  listing: { id: string; name: string };
  type: "host-to-guest" | "guest-to-host";
  status: "published" | "draft" | "hidden";
  ratingOverall?: number | null;
  categories?: Record<string, number>;
  text?: string;
  authorName?: string;
  channel?: string;
  submittedAt: string;
  approved: boolean;
};

export type HostawayReview = {
  id: string;
  type: string;
  status: string;
  rating?: number;
  publicReview?: string;
  reviewCategory?: Array<{
    category: string;
    rating: number;
  }>;
  submittedAt: string;
  guestName?: string;
  listingName: string;
  channel?: string;
};

export type ApiResponse<T = any> = {
  status: "success" | "error";
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ReviewFilters = {
  listingId?: string;
  type?: string;
  status?: string;
  channel?: string;
  minRating?: number;
  maxRating?: number;
  from?: string;
  to?: string;
  approved?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

export type AnalyticsData = {
  topListings: Array<{
    listingId: string;
    name: string;
    avgRating: number;
    count: number;
  }>;
  categoryAverages: Record<string, number>;
  trend: Array<{
    bucket: string;
    avgRating: number;
    count: number;
  }>;
  issues: Array<{
    category: string;
    avg: number;
    delta: number;
  }>;
};

export type ListingWithStats = {
  id: string;
  name: string;
  avgRating: number;
  reviewCount: number;
};
