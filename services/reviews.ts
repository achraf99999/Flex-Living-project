import { prisma } from '@/lib/db';
import { ReviewFilters, NormalizedReview, PaginatedResponse } from '@/types';
import { reviewFiltersSchema } from '@/lib/schemas';

export class ReviewsService {
  async getReviews(filters: ReviewFilters): Promise<PaginatedResponse<NormalizedReview>> {
    const validatedFilters = reviewFiltersSchema.parse(filters);
    
    const where: any = {};
    
    if (validatedFilters.listingId) {
      where.listingId = validatedFilters.listingId;
    }
    
    if (validatedFilters.type) {
      where.type = validatedFilters.type;
    }
    
    if (validatedFilters.status) {
      where.status = validatedFilters.status;
    }
    
    if (validatedFilters.channel) {
      where.channel = validatedFilters.channel;
    }
    
    if (validatedFilters.approved !== undefined) {
      where.approved = validatedFilters.approved;
    }
    
    if (validatedFilters.minRating || validatedFilters.maxRating) {
      where.ratingOverall = {};
      if (validatedFilters.minRating) {
        where.ratingOverall.gte = validatedFilters.minRating;
      }
      if (validatedFilters.maxRating) {
        where.ratingOverall.lte = validatedFilters.maxRating;
      }
    }
    
    if (validatedFilters.from || validatedFilters.to) {
      where.submittedAt = {};
      if (validatedFilters.from) {
        where.submittedAt.gte = new Date(validatedFilters.from);
      }
      if (validatedFilters.to) {
        where.submittedAt.lte = new Date(validatedFilters.to);
      }
    }
    
    if (validatedFilters.q) {
      where.OR = [
        { text: { contains: validatedFilters.q, mode: 'insensitive' } },
        { authorName: { contains: validatedFilters.q, mode: 'insensitive' } },
      ];
    }
    
    // Build orderBy
    let orderBy: any = { submittedAt: 'desc' };
    if (validatedFilters.sort) {
      const [field, direction] = validatedFilters.sort.split(':');
      orderBy = { [field]: direction || 'desc' };
    }
    
    const page = validatedFilters.page || 1;
    const pageSize = validatedFilters.pageSize || 20;
    const skip = (page - 1) * pageSize;
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          listing: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);
    
    const normalizedReviews: NormalizedReview[] = reviews.map(review => ({
      id: review.id,
      source: review.source as 'hostaway' | 'google',
      externalId: review.externalId || undefined,
      listing: {
        id: review.listing.id,
        name: review.listing.name,
      },
      type: review.type as 'host-to-guest' | 'guest-to-host',
      status: review.status as 'published' | 'draft' | 'hidden',
      ratingOverall: review.ratingOverall,
      categories: review.categories as Record<string, number> | undefined,
      text: review.text || undefined,
      authorName: review.authorName || undefined,
      channel: review.channel || undefined,
      submittedAt: review.submittedAt.toISOString(),
      approved: review.approved,
    }));
    
    return {
      items: normalizedReviews,
      page,
      pageSize,
      total,
    };
  }
  
  async approveReview(reviewId: string, approved: boolean, actor?: string): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    await prisma.$transaction([
      prisma.review.update({
        where: { id: reviewId },
        data: { approved },
      }),
      prisma.reviewSelectionLog.create({
        data: {
          reviewId,
          action: approved ? 'approved' : 'unapproved',
          actor,
        },
      }),
    ]);
  }
  
  async getPublicReviews(listingId: string): Promise<{
    listing: { id: string; name: string };
    items: NormalizedReview[];
  }> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    const reviews = await prisma.review.findMany({
      where: {
        listingId,
        approved: true,
      },
      include: {
        listing: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
    
    const normalizedReviews: NormalizedReview[] = reviews.map(review => ({
      id: review.id,
      source: review.source as 'hostaway' | 'google',
      externalId: review.externalId || undefined,
      listing: {
        id: review.listing.id,
        name: review.listing.name,
      },
      type: review.type as 'host-to-guest' | 'guest-to-host',
      status: review.status as 'published' | 'draft' | 'hidden',
      ratingOverall: review.ratingOverall,
      categories: review.categories as Record<string, number> | undefined,
      text: review.text || undefined,
      authorName: review.authorName || undefined,
      channel: review.channel || undefined,
      submittedAt: review.submittedAt.toISOString(),
      approved: review.approved,
    }));
    
    return {
      listing: {
        id: listing.id,
        name: listing.name,
      },
      items: normalizedReviews,
    };
  }
}
