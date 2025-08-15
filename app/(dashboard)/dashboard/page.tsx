'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Star, Filter, Search, TrendingUp, MessageSquare, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { NormalizedReview, AnalyticsData, ListingWithStats } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ReviewCard } from '@/components/ReviewCard';

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [listings, setListings] = useState<ListingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filters, setFilters] = useState({
    listingId: 'all',
    type: 'all',
    status: 'all',
    channel: 'all',
    minRating: undefined as number | undefined,
    maxRating: undefined as number | undefined,
    from: '',
    to: '',
    approved: undefined as boolean | undefined,
    q: '',
    page: 1,
    pageSize: 20,
    sort: 'submittedAt:desc',
  });

  // Memoize fetchData to prevent infinite loops
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch reviews
      const reviewParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== 'all') {
          reviewParams.append(key, value.toString());
        }
      });

      const [reviewsRes, analyticsRes, listingsRes] = await Promise.all([
        fetch(`/api/reviews/hostaway?${reviewParams}`),
        fetch('/api/reviews/analytics'),
        fetch('/api/listings'),
      ]);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.data.items);
        setTotalReviews(reviewsData.data.total);
      } else {
        throw new Error('Failed to fetch reviews');
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data);
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Only fetch on mount and when filters actually change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Separate effect for filter changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        setFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
        fetchData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.listingId, filters.type, filters.status, filters.channel, filters.minRating, filters.maxRating, filters.from, filters.to, filters.approved, filters.q, filters.sort]);

  const handleApproveReview = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved }),
      });

      if (response.ok) {
        // Update local state
        setReviews(prev => prev.map(review =>
          review.id === reviewId ? { ...review, approved } : review
        ));
        // Show success feedback
        setError(null);
      } else {
        throw new Error('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve review');
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const totalPages = Math.ceil(totalReviews / filters.pageSize);

  // Loading skeleton
  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Analytics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Connection Error</h3>
                <p className="text-sm text-red-700">Failed to connect to the database</p>
              </div>
            </div>

            <div className="text-left text-sm text-red-700 space-y-2">
              <p><strong>Common causes:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Database not configured in Vercel</li>
                <li>Environment variables missing</li>
                <li>Database connection string invalid</li>
                <li>Database not accessible from Vercel</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-red-100 rounded text-xs text-red-800">
              <strong>Error details:</strong> {error}
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={fetchData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>

            <div className="text-xs text-gray-500">
              <p>If the problem persists, check your Vercel environment variables:</p>
              <p>• DATABASE_URL</p>
              <p>• HOSTAWAY_API_KEY</p>
              <p>• NEXTAUTH_SECRET</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fetchData()}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and approve property reviews</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.categoryAverages ?
                  (Object.values(analytics.categoryAverages).reduce((a, b) => a + b, 0) / Object.values(analytics.categoryAverages).length).toFixed(1) :
                  '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReviews}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Reviews</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.filter(r => r.approved).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.approved).length / reviews.length) * 100) : 0}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Presets */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, approved: true, page: 1 })}
          >
            Approved Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, minRating: 8, page: 1 })}
          >
            High Ratings (8+)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, from: '2024-01-01', page: 1 })}
          >
            This Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({
              listingId: 'all',
              type: 'all',
              status: 'all',
              channel: 'all',
              minRating: undefined,
              maxRating: undefined,
              from: '',
              to: '',
              approved: undefined,
              q: '',
              page: 1,
              pageSize: 20,
              sort: 'submittedAt:desc',
            })}
          >
            Clear All
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Property</label>
                <Select value={filters.listingId} onValueChange={(value) => updateFilter('listingId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All properties</SelectItem>
                    {listings.map(listing => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="guest-to-host">Guest to Host</SelectItem>
                    <SelectItem value="host-to-guest">Host to Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Channel</label>
                <Select value={filters.channel} onValueChange={(value) => updateFilter('channel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="booking">Booking.com</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={filters.q}
                    onChange={(e) => updateFilter('q', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min Rating</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  value={filters.minRating || ''}
                  onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Rating</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="10"
                  value={filters.maxRating || ''}
                  onChange={(e) => updateFilter('maxRating', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(e) => updateFilter('from', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(e) => updateFilter('to', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.approved}
                  onCheckedChange={(checked) => updateFilter('approved', checked)}
                />
                <label className="text-sm font-medium">Approved only</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({totalReviews})</CardTitle>
            <CardDescription>Manage and approve property reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Approve</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Property</th>
                        <th className="text-left p-2">Rating</th>
                        <th className="text-left p-2">Author</th>
                        <th className="text-left p-2">Channel</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <Switch
                              checked={review.approved}
                              onCheckedChange={(checked) => handleApproveReview(review.id, checked)}
                            />
                          </td>
                          <td className="p-2 text-sm">{formatDate(review.submittedAt)}</td>
                          <td className="p-2 text-sm font-medium">{review.listing.name}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{review.ratingOverall?.toFixed(1) || 'N/A'}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </td>
                          <td className="p-2 text-sm">{review.authorName || 'Anonymous'}</td>
                          <td className="p-2 text-sm capitalize">{review.channel || 'Unknown'}</td>
                          <td className="p-2 text-sm capitalize">{review.type.replace('-', ' ')}</td>
                          <td className="p-2 text-sm max-w-xs truncate">
                            {review.text || 'No text provided'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No reviews found matching your filters.
                  </div>
                )}

                {/* Mobile Review Cards */}
                <div className="md:hidden space-y-4 mt-6">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onApproveChange={handleApproveReview}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {((filters.page - 1) * filters.pageSize) + 1} to {Math.min(filters.page * filters.pageSize, totalReviews)} of {totalReviews} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === 1}
                        onClick={() => goToPage(filters.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Page {filters.page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= totalPages}
                        onClick={() => goToPage(filters.page + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
