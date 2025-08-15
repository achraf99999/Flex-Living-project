# FlexLiving Reviews Dashboard

A comprehensive reviews management system for FlexLiving properties that ingests reviews from multiple sources (Hostaway, Google), normalizes them, and provides a powerful dashboard for managers to filter, sort, and approve reviews. The system also exposes embeddable review sections for public property pages.

## 🚀 Features

### Review Management
- **Multi-source ingestion**: Import reviews from Hostaway API and Google Places
- **Data normalization**: Standardize review data across different sources
- **Advanced filtering**: Filter by property, rating, date, channel, type, and more
- **Approval workflow**: Approve/unapprove reviews with audit logging
- **Bulk operations**: Manage multiple reviews efficiently

### Analytics & Insights
- **Real-time dashboard**: View key metrics and performance indicators
- **Category analysis**: Break down ratings by cleanliness, communication, etc.
- **Trend tracking**: Monitor rating trends over time
- **Property comparison**: Compare performance across properties
- **Issue detection**: Identify areas needing improvement

### Public Display
- **Embeddable reviews**: Display approved reviews on property pages
- **Responsive design**: Works seamlessly across all devices
- **SEO-friendly**: Optimized for search engines
- **Performance optimized**: Fast loading times

### API & Integration
- **RESTful API**: Comprehensive endpoints for integration
- **Normalized data**: Consistent data format across sources
- **Pagination**: Efficient data retrieval
- **Rate limiting**: Protect against abuse

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI Components**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Testing**: Vitest + Playwright
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd flexliving-reviews
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flexliving_reviews"

# Hostaway API
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=your_hostaway_api_key_here
HOSTAWAY_BASE_URL=https://sandbox-api.hostaway.com

# Google Places API (optional)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Admin Authentication
ADMIN_TOKEN=your_admin_token_here
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with mock data
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t flexliving-reviews .

# Run the container
docker run -p 3000:3000 flexliving-reviews
```

## 📊 API Documentation

### Core Endpoints

#### GET /api/reviews/hostaway
Returns normalized Hostaway reviews with filtering and pagination.

**Query Parameters:**
- `listingId` - Filter by specific listing
- `type` - Filter by review type (guest-to-host, host-to-guest)
- `status` - Filter by status (published, draft, hidden)
- `channel` - Filter by channel (airbnb, booking, google)
- `minRating` / `maxRating` - Filter by rating range
- `from` / `to` - Filter by date range
- `approved` - Filter by approval status
- `q` - Search in review text and author name
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20, max: 100)
- `sort` - Sort field and direction (e.g., "submittedAt:desc")

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "ckxyz",
        "source": "hostaway",
        "externalId": "7453",
        "listing": { "id": "cklist1", "name": "2B N1 A - 29 Shoreditch Heights" },
        "type": "host-to-guest",
        "status": "published",
        "ratingOverall": 10,
        "categories": { "cleanliness": 10, "communication": 10 },
        "text": "Great experience!",
        "authorName": "John Doe",
        "channel": "airbnb",
        "submittedAt": "2020-08-21T22:45:14.000Z",
        "approved": false
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 128
  }
}
```

#### POST /api/reviews/approve
Approve or unapprove a review.

**Request Body:**
```json
{
  "reviewId": "ckxyz",
  "approved": true
}
```

#### GET /api/reviews/analytics
Get analytics data for the dashboard.

**Query Parameters:**
- `listingId` - Filter by specific listing
- `from` / `to` - Date range
- `bucket` - Time bucket (day, week, month)

**Response:**
```json
{
  "status": "success",
  "data": {
    "topListings": [
      {
        "listingId": "cklist1",
        "name": "2B N1 A - 29 Shoreditch Heights",
        "avgRating": 9.7,
        "count": 32
      }
    ],
    "categoryAverages": {
      "cleanliness": 9.4,
      "communication": 9.7
    },
    "trend": [
      {
        "bucket": "2025-01",
        "avgRating": 4.6,
        "count": 12
      }
    ],
    "issues": [
      {
        "category": "cleanliness",
        "avg": 6.2,
        "delta": -1.1
      }
    ]
  }
}
```

#### GET /api/public-reviews/:listingId
Get approved reviews for public display.

**Response:**
```json
{
  "status": "success",
  "data": {
    "listing": { "id": "cklist1", "name": "2B N1 A - 29 Shoreditch Heights" },
    "items": [/* approved reviews only */]
  }
}
```

## 🏗 Project Structure

```
flexliving-reviews/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard routes
│   │   └── dashboard/
│   │       └── page.tsx         # Main dashboard
│   ├── (public)/                # Public routes
│   │   └── properties/[slug]/
│   │       └── page.tsx         # Property pages
│   ├── api/                     # API routes
│   │   ├── reviews/
│   │   │   ├── hostaway/        # Required endpoint
│   │   │   ├── approve/         # Approval endpoint
│   │   │   ├── query/           # Unified query
│   │   │   └── analytics/       # Analytics endpoint
│   │   ├── listings/            # Listings endpoint
│   │   └── public-reviews/      # Public reviews endpoint
│   ├── layout.tsx
│   └── globals.css
├── components/ui/               # shadcn/ui components
├── lib/                         # Utilities and config
│   ├── db.ts                   # Prisma client
│   ├── schemas.ts              # Zod schemas
│   └── utils.ts                # Utility functions
├── services/                    # Business logic
│   ├── hostaway.ts             # Hostaway integration
│   ├── reviews.ts              # Review management
│   └── analytics.ts            # Analytics service
├── types/                       # TypeScript types
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts                 # Database seeding
├── data/                        # Mock data
└── docker-compose.yml          # Docker configuration
```

## 🧪 Testing

### Run tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test with UI
npm run test:ui
```

### Test API endpoints

```bash
# Test the required endpoint
curl "http://localhost:3000/api/reviews/hostaway?page=1&pageSize=5"

# Test approval
curl -X POST "http://localhost:3000/api/reviews/approve" \
  -H "Content-Type: application/json" \
  -d '{"reviewId":"ckxyz","approved":true}'
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with mock data
npm run db:studio    # Open Prisma Studio
```

### Database Management

```bash
# Reset database
npm run db:push --force-reset

# View database in Prisma Studio
npm run db:studio

# Run migrations
npx prisma migrate dev
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `HOSTAWAY_API_KEY` - Your Hostaway API key
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `NEXTAUTH_URL` - Your production URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@flexliving.com or create an issue in the repository.

## 🔄 Roadmap

- [ ] Google Places API integration
- [ ] Email notifications for new reviews
- [ ] Advanced analytics dashboard
- [ ] Mobile app for review management
- [ ] Multi-language support
- [ ] Automated review moderation
- [ ] Integration with more review platforms
