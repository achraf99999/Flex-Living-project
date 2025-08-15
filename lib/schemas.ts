import { z } from "zod";

export const reviewFiltersSchema = z.object({
  listingId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  channel: z.string().optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  maxRating: z.coerce.number().min(0).max(10).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  approved: z.coerce.boolean().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
});

export const approveReviewSchema = z.object({
  reviewId: z.string().cuid(),
  approved: z.boolean(),
});

export const analyticsFiltersSchema = z.object({
  listingId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  bucket: z.enum(["day", "week", "month"]).default("month"),
});

export const hostawayReviewSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.string(),
  rating: z.number().optional(),
  publicReview: z.string().optional(),
  reviewCategory: z.array(z.object({
    category: z.string(),
    rating: z.number(),
  })).optional(),
  submittedAt: z.string(),
  guestName: z.string().optional(),
  listingName: z.string(),
  channel: z.string().optional(),
});

export const normalizedReviewSchema = z.object({
  id: z.string(),
  source: z.enum(["hostaway", "google"]),
  externalId: z.string().optional(),
  listing: z.object({
    id: z.string(),
    name: z.string(),
  }),
  type: z.enum(["host-to-guest", "guest-to-host"]),
  status: z.enum(["published", "draft", "hidden"]),
  ratingOverall: z.number().nullable().optional(),
  categories: z.record(z.number()).optional(),
  text: z.string().optional(),
  authorName: z.string().optional(),
  channel: z.string().optional(),
  submittedAt: z.string(),
  approved: z.boolean(),
});
