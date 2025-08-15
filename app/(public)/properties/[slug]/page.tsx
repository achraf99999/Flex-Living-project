'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, Calendar, User } from 'lucide-react';
import { NormalizedReview } from '@/types';
import { formatDate, generateSlug } from '@/lib/utils';

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
    console.log('useEffect triggered with slug:', params.slug);
    fetchPropertyData();

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [params.slug]);

  const fetchPropertyData = async () => {
    console.log('fetchPropertyData called');
    setLoading(true);
    try {
      // First, get the listing ID from the slug
      const listingsResponse = await fetch('/api/listings');
      console.log('Listings response status:', listingsResponse.status);

      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        console.log('Listings data received:', listingsData.data.length, 'listings');
        console.log('Looking for slug:', params.slug);
        console.log('Available listings:', listingsData.data.map((l: any) => ({
          name: l.name,
          slug: generateSlug(l.name)
        })));

        const foundListing = listingsData.data.find((l: any) => {
          const generatedSlug = generateSlug(l.name);
          console.log('Comparing:', generatedSlug, 'with', params.slug, '=', generatedSlug === params.slug);
          return generatedSlug === params.slug;
        });

        console.log('Found listing:', foundListing);

        if (foundListing) {
          setListing(foundListing);

          // Fetch approved reviews for this listing
          const reviewsResponse = await fetch(`/api/public-reviews/${foundListing.id}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData.data.items);
          }
        } else {
          console.log('No listing found for slug:', params.slug);
        }
      } else {
        console.error('Listings API failed:', listingsResponse.status);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      console.log('Setting loading to false');
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
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Property not found</div>
          <div className="text-sm text-gray-600 mb-4">
            Could not find property with slug: <code className="bg-gray-100 px-2 py-1 rounded">{params.slug}</code>
          </div>
          <div className="text-sm text-gray-600">
            Available properties:
            <ul className="mt-2 space-y-1">
              <li>• <a href="/properties/2b-n1-a-29-shoreditch-heights" className="text-blue-600 hover:underline">2B N1 A - 29 Shoreditch Heights</a></li>
              <li>• <a href="/properties/1b-studio-15-brick-lane" className="text-blue-600 hover:underline">1B Studio - 15 Brick Lane</a></li>
              <li>• <a href="/properties/3b-penthouse-45-canary-wharf" className="text-blue-600 hover:underline">3B Penthouse - 45 Canary Wharf</a></li>
            </ul>
          </div>
        </div>
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
