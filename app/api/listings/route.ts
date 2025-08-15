import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics';
import { ApiResponse, ListingWithStats } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ListingWithStats[]>>> {
  try {
    const analyticsService = new AnalyticsService();
    const result = await analyticsService.getListingsWithStats();
    
    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch listings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
