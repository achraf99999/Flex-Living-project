# FlexLiving Reviews Dashboard

A modern, production-grade reviews management system for FlexLiving properties. This application ingests reviews from multiple sources, normalizes them into a consistent format, and provides managers with a robust dashboard for filtering, analyzing, and approving reviews for public display.  
**Live Demo:** [FlexLiving Reviews Dashboard](https://achref-d0w8ke9u3-achrefs-projects-3bf6cf25.vercel.app/)

---

## 📝 Project Overview

FlexLiving Reviews Dashboard centralizes all property reviews in one place, from various sources (like Hostaway, Google, Airbnb, and Booking.com).  
Managers can analyze, filter, and approve reviews before they appear publicly, ensuring only the best feedback is showcased.

---

## 🚀 Deployment & Hosting

The application is deployed on [Vercel](https://vercel.com/) for fast, reliable hosting and automatic CI/CD.  
The PostgreSQL database is provisioned via [Railway](https://railway.app/), offering robust cloud data storage for all reviews and properties.

- **Live app:** [https://achref-d0w8ke9u3-achrefs-projects-3bf6cf25.vercel.app/](https://achref-d0w8ke9u3-achrefs-projects-3bf6cf25.vercel.app/)
- **Backend:** Next.js API routes (serverless functions, deployed with Vercel)
- **Database:** PostgreSQL (hosted on Railway)
- **Environment Variables:** All production secrets and DB URLs are managed in Vercel and Railway dashboards.

**Deployment Steps (summary):**
1. Push code to GitHub.
2. Vercel auto-builds and deploys on each push.
3. Railway hosts the database; migrations and seed data are applied via Prisma.
4. Environment variables are configured in Vercel for DB/API secrets.

---

## 🎯 Assessment Requirements Met

✅ **Hostaway Integration (Mocked)** - Complete with normalized data structure  
✅ **Manager Dashboard** - Full-featured with filtering, analytics, and approval workflow  
✅ **Review Display Page** - Public property pages with approved reviews  
✅ **Google Reviews Exploration** - Research completed with implementation findings  
✅ **API Route Implementation** - GET /api/reviews/hostaway fully functional  

---

## 🚀 Key Features & Capabilities

### 🔄 Multi-Source Review Management
- Ingests reviews from Hostaway API and other sources
- Data normalization for consistent structure
- Mock data support for development/testing
- Approval workflow with audit logging

### 📊 Advanced Analytics Dashboard
- Real-time metrics and property comparisons
- Category breakdowns (cleanliness, communication, etc.)
- Trend analysis and issue detection

### 🎨 Modern User Interface
- Responsive and professional design (desktop/mobile/tablet)
- Intuitive navigation and filtering/search
- Bulk review operations and instant updates

### 🌐 Public Review Display
- SEO-friendly URLs and branding
- Approved reviews only
- Detailed category breakdowns

### 🔌 RESTful API
- Well-documented endpoints
- Normalized JSON responses
- Pagination, filtering, sorting

---

## 🛠 Technology Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Next.js API Routes, Prisma ORM, PostgreSQL, Zod  
**Testing:** Vitest, Playwright, ESLint, Docker

---

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+ (local or cloud)
- Git
- Docker (optional)

---

## 🚀 Quick Start Guide

```bash
# Clone the repository
git clone <repository-url>
cd flexliving-reviews

# Install dependencies
npm install
```

### Environment Configuration

```bash
cp env.example .env
nano .env
```
Edit `.env` with your DB and API credentials.

### Database Setup

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Start Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 How to Use

- **Manager Dashboard:** Filter, approve/unapprove, and analyze reviews.
- **Public Property Pages:** Displays only approved reviews (SEO-friendly).
- **API:** Test endpoints for Hostaway, analytics, and public data.

---

## 🧪 Testing & Quality Assurance

- **Unit & E2E Testing:** `npm test`, `npm run test:e2e`
- **Linting:** `npm run lint`
- **Type Checking:** `npm run type-check`

---

## 🚀 Deployment

- **Cloud Hosting:** Vercel (auto-deploy on push)
- **Database:** Railway (PostgreSQL cloud instance)
- **Production Environment:** Configure secrets and URLs in Vercel and Railway dashboards.

---

## 📈 Performance & Security

- Optimized queries, caching, lazy loading
- Secure input validation (Zod, Prisma)
- GDPR compliance and audit logging
- HTTPS, environment variable management

---

## 🤝 Contributing

- Fork and clone the repository
- Create feature branches
- Submit pull requests

---

## 📞 Support

- Open GitHub issues for bugs or feature requests
- For questions, you can reach me on mail .

---

## 🎉 Conclusion

FlexLiving Reviews Dashboard delivers a complete, scalable, and modern solution for property review management—fully meeting the Developer Assessment requirements.  
With Vercel cloud hosting and Railway database, it’s ready for real-world use.

---

**Try it now:** [Live App](https://achref-d0w8ke9u3-achrefs-projects-3bf6cf25.vercel.app/)
