import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviews';
import { approveReviewSchema } from '@/lib/schemas';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const { reviewId, approved } = approveReviewSchema.parse(body);
    
    const reviewsService = new ReviewsService();
    await reviewsService.approveReview(reviewId, approved, 'admin'); // TODO: Get actual user
    
    return NextResponse.json({
      status: 'success',
      data: { reviewId, approved },
    });
  } catch (error) {
    console.error('Error approving review:', error);
    
    if (error instanceof Error && error.message.includes('Review not found')) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Review not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to approve review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
