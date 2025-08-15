import { prisma } from '@/lib/db';
import { calculateAverageRating, slugify } from '@/lib/utils';
import { HostawayReview, NormalizedReview } from '@/types';
import { hostawayReviewSchema } from '@/lib/schemas';

export class HostawayService {
  private baseUrl: string;
  private accountId: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com';
    this.accountId = process.env.HOSTAWAY_ACCOUNT_ID || '61148';
    this.apiKey = process.env.HOSTAWAY_API_KEY || '';
  }

  async fetchReviews(): Promise<HostawayReview[]> {
    try {
      // Try to fetch from Hostaway API first
      const response = await fetch(`${this.baseUrl}/v1/accounts/${this.accountId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          return data.result.map((review: any) => hostawayReviewSchema.parse(review));
        }
      }

      // If API call fails or returns empty, use mock data
      console.log('Using mock Hostaway data as API returned empty or failed');
      const mockData = await this.loadMockData();
      return mockData;
    } catch (error) {
      console.error('Error fetching Hostaway reviews:', error);
      // Fallback to mock data
      const mockData = await this.loadMockData();
      return mockData;
    }
  }

  private async loadMockData(): Promise<HostawayReview[]> {
    try {
      const mockReviews = await import('@/data/mock-hostaway-reviews.json');
      return mockReviews.default.map((review: any) => hostawayReviewSchema.parse(review));
    } catch (error) {
      console.error('Error loading mock data:', error);
      return [];
    }
  }

  async normalizeReview(review: HostawayReview): Promise<NormalizedReview> {
    // Find or create listing
    const listing = await this.findOrCreateListing(review.listingName);

    // Calculate rating overall
    let ratingOverall = review.rating || null;
    if (!ratingOverall && review.reviewCategory) {
      ratingOverall = calculateAverageRating(
        review.reviewCategory.reduce((acc, cat) => {
          acc[cat.category] = cat.rating;
          return acc;
        }, {} as Record<string, number>)
      );
    }

    // Convert categories to flat object
    const categories = review.reviewCategory?.reduce((acc, cat) => {
      acc[cat.category] = cat.rating;
      return acc;
    }, {} as Record<string, number>);

    // Convert submittedAt to ISO string
    const submittedAt = new Date(review.submittedAt).toISOString();

    return {
      id: review.id,
      source: 'hostaway',
      externalId: review.id,
      listing: {
        id: listing.id,
        name: listing.name,
      },
      type: review.type as 'host-to-guest' | 'guest-to-host',
      status: review.status as 'published' | 'draft' | 'hidden',
      ratingOverall,
      categories,
      text: review.publicReview,
      authorName: review.guestName,
      channel: review.channel,
      submittedAt,
      approved: false, // Default to false, to be approved by manager
    };
  }

  private async findOrCreateListing(name: string) {
    const slug = slugify(name);

    let listing = await prisma.listing.findUnique({
      where: { slug },
    });

    if (!listing) {
      listing = await prisma.listing.create({
        data: {
          name,
          slug,
          channel: 'hostaway',
        },
      });
    }

    return listing;
  }

  async syncReviews(): Promise<void> {
    const reviews = await this.fetchReviews();

    for (const review of reviews) {
      const normalized = await this.normalizeReview(review);

      // Upsert review
      await prisma.review.upsert({
        where: {
          externalId_source: {
            externalId: normalized.externalId!,
            source: normalized.source,
          },
        },
        update: {
          listingId: normalized.listing.id,
          type: normalized.type,
          status: normalized.status,
          ratingOverall: normalized.ratingOverall,
          categories: normalized.categories,
          text: normalized.text,
          authorName: normalized.authorName,
          submittedAt: new Date(normalized.submittedAt),
          channel: normalized.channel,
        },
        create: {
          source: normalized.source,
          externalId: normalized.externalId,
          listingId: normalized.listing.id,
          type: normalized.type,
          status: normalized.status,
          ratingOverall: normalized.ratingOverall,
          categories: normalized.categories,
          text: normalized.text,
          authorName: normalized.authorName,
          submittedAt: new Date(normalized.submittedAt),
          channel: normalized.channel,
          approved: normalized.approved,
        },
      });
    }
  }
}
