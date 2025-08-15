import { prisma } from '@/lib/db';
import { AnalyticsData, ListingWithStats } from '@/types';
import { analyticsFiltersSchema } from '@/lib/schemas';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export class AnalyticsService {
  async getAnalytics(filters: any): Promise<AnalyticsData> {
    const validatedFilters = analyticsFiltersSchema.parse(filters);
    
    const where: any = {};
    
    if (validatedFilters.listingId) {
      where.listingId = validatedFilters.listingId;
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
    
    // Get top listings
    const topListings = await this.getTopListings(where);
    
    // Get category averages
    const categoryAverages = await this.getCategoryAverages(where);
    
    // Get trend data
    const trend = await this.getTrendData(where, validatedFilters.bucket);
    
    // Get issues (categories with low ratings)
    const issues = await this.getIssues(where);
    
    return {
      topListings,
      categoryAverages,
      trend,
      issues,
    };
  }
  
  private async getTopListings(where: any): Promise<AnalyticsData['topListings']> {
    const listings = await prisma.review.groupBy({
      by: ['listingId'],
      where,
      _count: {
        id: true,
      },
      _avg: {
        ratingOverall: true,
      },
    });
    
    const listingIds = listings.map(l => l.listingId);
    const listingDetails = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, name: true },
    });
    
    return listings
      .map(listing => {
        const detail = listingDetails.find(d => d.id === listing.listingId);
        return {
          listingId: listing.listingId,
          name: detail?.name || 'Unknown',
          avgRating: listing._avg.ratingOverall || 0,
          count: listing._count.id,
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }
  
  private async getCategoryAverages(where: any): Promise<Record<string, number>> {
    const reviews = await prisma.review.findMany({
      where,
      select: { categories: true },
    });
    
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    
    reviews.forEach(review => {
      if (review.categories) {
        const categories = review.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, rating]) => {
          if (!categoryTotals[category]) {
            categoryTotals[category] = { sum: 0, count: 0 };
          }
          categoryTotals[category].sum += rating;
          categoryTotals[category].count += 1;
        });
      }
    });
    
    const averages: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, { sum, count }]) => {
      averages[category] = Math.round((sum / count) * 10) / 10;
    });
    
    return averages;
  }
  
  private async getTrendData(where: any, bucket: 'day' | 'week' | 'month'): Promise<AnalyticsData['trend']> {
    const now = new Date();
    let startDate: Date;
    let formatString: string;
    let groupBy: any;
    
    switch (bucket) {
      case 'day':
        startDate = subDays(now, 30);
        formatString = 'yyyy-MM-dd';
        groupBy = {
          year: true,
          month: true,
          day: true,
        };
        break;
      case 'week':
        startDate = subWeeks(now, 12);
        formatString = 'yyyy-\'W\'ww';
        groupBy = {
          year: true,
          week: true,
        };
        break;
      case 'month':
        startDate = subMonths(now, 12);
        formatString = 'yyyy-MM';
        groupBy = {
          year: true,
          month: true,
        };
        break;
    }
    
    const trendData = await prisma.review.groupBy({
      by: ['submittedAt'],
      where: {
        ...where,
        submittedAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        ratingOverall: true,
      },
    });
    
    // Group by bucket
    const buckets: Record<string, { sum: number; count: number; ratings: number[] }> = {};
    
    trendData.forEach(item => {
      let bucketKey: string;
      
      switch (bucket) {
        case 'day':
          bucketKey = format(item.submittedAt, 'yyyy-MM-dd');
          break;
        case 'week':
          bucketKey = format(item.submittedAt, 'yyyy-\'W\'ww');
          break;
        case 'month':
          bucketKey = format(item.submittedAt, 'yyyy-MM');
          break;
      }
      
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = { sum: 0, count: 0, ratings: [] };
      }
      
      buckets[bucketKey].sum += item._count.id;
      buckets[bucketKey].count += 1;
      if (item._avg.ratingOverall) {
        buckets[bucketKey].ratings.push(item._avg.ratingOverall);
      }
    });
    
    return Object.entries(buckets)
      .map(([bucket, data]) => ({
        bucket,
        avgRating: data.ratings.length > 0 
          ? Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 10) / 10
          : 0,
        count: data.sum,
      }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket));
  }
  
  private async getIssues(where: any): Promise<AnalyticsData['issues']> {
    const categoryAverages = await this.getCategoryAverages(where);
    const issues: AnalyticsData['issues'] = [];
    
    Object.entries(categoryAverages).forEach(([category, avg]) => {
      if (avg < 7) {
        issues.push({
          category,
          avg,
          delta: -1.1, // Mock delta for now
        });
      }
    });
    
    return issues;
  }
  
  async getListingsWithStats(): Promise<ListingWithStats[]> {
    const listings = await prisma.review.groupBy({
      by: ['listingId'],
      _count: {
        id: true,
      },
      _avg: {
        ratingOverall: true,
      },
    });
    
    const listingIds = listings.map(l => l.listingId);
    const listingDetails = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, name: true },
    });
    
    return listings
      .map(listing => {
        const detail = listingDetails.find(d => d.id === listing.listingId);
        return {
          id: listing.listingId,
          name: detail?.name || 'Unknown',
          avgRating: Math.round((listing._avg.ratingOverall || 0) * 10) / 10,
          reviewCount: listing._count.id,
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating);
  }
}
