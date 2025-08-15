'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Star, Filter, Search, TrendingUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { NormalizedReview, AnalyticsData, ListingWithStats } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [listings, setListings] = useState<ListingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    listingId: '',
    type: '',
    status: '',
    channel: '',
    minRating: '',
    maxRating: '',
    from: '',
    to: '',
    approved: undefined as boolean | undefined,
    q: '',
    page: 1,
    pageSize: 20,
    sort: 'submittedAt:desc',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch reviews
      const reviewParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
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
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
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
                  Object.values(analytics.categoryAverages).reduce((a, b) => a + b, 0) / Object.values(analytics.categoryAverages).length : 
                  0
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
              <div className="text-2xl font-bold">{reviews.length}</div>
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
                  value={filters.minRating}
                  onChange={(e) => updateFilter('minRating', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Rating</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="10"
                  value={filters.maxRating}
                  onChange={(e) => updateFilter('maxRating', e.target.value)}
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
            <CardTitle>Reviews ({reviews.length})</CardTitle>
            <CardDescription>Manage and approve property reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
