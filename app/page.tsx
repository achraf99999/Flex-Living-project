import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, BarChart3, Home, Users } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            FlexLiving Reviews Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and display property reviews from multiple sources including Hostaway,
            with powerful filtering, analytics, and approval workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <CardTitle>Dashboard</CardTitle>
              </div>
              <CardDescription>
                Manage reviews, approve content, and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access the full admin dashboard to filter, sort, and approve reviews.
                View detailed analytics and insights about your properties.
              </p>
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8 text-green-600" />
                <CardTitle>Properties</CardTitle>
              </div>
              <CardDescription>
                View public property pages with approved reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                See how approved reviews appear on public property pages.
                Perfect for testing the embeddable reviews section.
              </p>
              <div className="space-y-2">
                <Link href="/properties/2b-n1-a-29-shoreditch-heights">
                  <Button variant="outline" className="w-full">
                    View Sample Property
                  </Button>
                </Link>
                <div className="text-xs text-gray-500 mt-2">
                  Available: 2B N1 A - 29 Shoreditch Heights
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <CardTitle>API Access</CardTitle>
              </div>
              <CardDescription>
                Integrate reviews into your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use our RESTful API to fetch normalized reviews,
                analytics data, and public review endpoints.
              </p>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-2 rounded">
                  <code>GET /api/reviews/hostaway</code>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <code>GET /api/public-reviews/:listingId</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Review Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Import reviews from Hostaway API</li>
                <li>• Normalize data across multiple sources</li>
                <li>• Filter and search reviews</li>
                <li>• Approve/unapprove reviews</li>
                <li>• Bulk operations support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Analytics & Insights</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Real-time dashboard metrics</li>
                <li>• Category-based rating analysis</li>
                <li>• Trend tracking over time</li>
                <li>• Property performance comparison</li>
                <li>• Issue detection and alerts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Public Display</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Embeddable review sections</li>
                <li>• Approved-only content display</li>
                <li>• Responsive design</li>
                <li>• SEO-friendly URLs</li>
                <li>• Cross-platform compatibility</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">API & Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• RESTful API endpoints</li>
                <li>• Normalized data format</li>
                <li>• Pagination and filtering</li>
                <li>• Rate limiting</li>
                <li>• Comprehensive documentation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Set up your database, run the seed script, and start managing your reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            <a href="https://github.com/achraf99999/Flex-Living-project" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
