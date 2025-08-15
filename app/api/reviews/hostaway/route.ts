import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviews';
import { ApiResponse, PaginatedResponse, NormalizedReview } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResponse<NormalizedReview>>>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    const reviewsService = new ReviewsService();
    const result = await reviewsService.getReviews(filters);
    
    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching Hostaway reviews:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
