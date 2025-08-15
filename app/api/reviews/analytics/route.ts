import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics';
import { ApiResponse, AnalyticsData } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AnalyticsData>>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    const analyticsService = new AnalyticsService();
    const result = await analyticsService.getAnalytics(filters);
    
    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
