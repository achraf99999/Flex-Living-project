'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, Calendar, User } from 'lucide-react';
import { NormalizedReview } from '@/types';
import { formatDate } from '@/lib/utils';

interface PropertyPageProps {
  params: {
    slug: string;
  };
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [listing, setListing] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyData();
  }, [params.slug]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      // First, get the listing ID from the slug
      const listingsResponse = await fetch('/api/listings');
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        const foundListing = listingsData.data.find((l: any) => 
          l.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === params.slug
        );
        
        if (foundListing) {
          setListing(foundListing);
          
          // Fetch approved reviews for this listing
          const reviewsResponse = await fetch(`/api/public-reviews/${foundListing.id}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData.data.items);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.ratingOverall || 0), 0);
    return total / reviews.length;
  };

  const getCategoryAverages = () => {
    const categories: Record<string, { sum: number; count: number }> = {};
    
    reviews.forEach(review => {
      if (review.categories) {
        Object.entries(review.categories).forEach(([category, rating]) => {
          if (!categories[category]) {
            categories[category] = { sum: 0, count: 0 };
          }
          categories[category].sum += rating;
          categories[category].count += 1;
        });
      }
    });

    const averages: Record<string, number> = {};
    Object.entries(categories).forEach(([category, { sum, count }]) => {
      averages[category] = Math.round((sum / count) * 10) / 10;
    });

    return averages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading property...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Property not found</div>
      </div>
    );
  }

  const avgRating = calculateAverageRating();
  const categoryAverages = getCategoryAverages();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{listing.name}</h1>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>London, UK</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Available for booking</span>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About this property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Experience luxury living in the heart of London. This beautifully appointed property 
                  offers modern amenities, stunning views, and exceptional service for your stay.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• High-speed WiFi</li>
                      <li>• Fully equipped kitchen</li>
                      <li>• Air conditioning</li>
                      <li>• 24/7 support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">House Rules</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• No smoking</li>
                      <li>• No parties</li>
                      <li>• Check-in: 3 PM</li>
                      <li>• Check-out: 11 AM</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Guest Reviews</CardTitle>
                <CardDescription>What guests are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-600">{reviews.length} reviews</p>
                </div>

                {Object.entries(categoryAverages).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Category Ratings</h4>
                    {Object.entries(categoryAverages).map(([category, rating]) => (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{rating.toFixed(1)}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Guest Reviews ({reviews.length})
            </CardTitle>
            <CardDescription>
              Read what our guests have to say about their stay
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{review.authorName || 'Anonymous Guest'}</h4>
                          <p className="text-sm text-gray-600">{formatDate(review.submittedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{review.ratingOverall?.toFixed(1) || 'N/A'}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    
                    {review.text && (
                      <p className="text-gray-700 mb-3">{review.text}</p>
                    )}

                    {review.categories && Object.keys(review.categories).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(review.categories).map(([category, rating]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize text-gray-600">{category.replace('_', ' ')}</span>
                            <span className="font-medium">{rating}/10</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Review from {review.channel || 'Unknown'} • {review.type.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">
                  Be the first to review this property after your stay!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
