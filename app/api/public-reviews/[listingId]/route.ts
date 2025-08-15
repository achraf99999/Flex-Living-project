import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviews';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { listingId } = params;
    
    const reviewsService = new ReviewsService();
    const result = await reviewsService.getPublicReviews(listingId);
    
    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    
    if (error instanceof Error && error.message.includes('Listing not found')) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Listing not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch public reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
