import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { HostawayService } from '../services/hostaway';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.reviewSelectionLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listing.deleteMany();

  // Option 1: Sync Hostaway reviews (original logic)
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  if (useMockData) {
    // Option 2: Seed from mock-hostaway-reviews.json
    console.log('📥 Seeding from mock-hostaway-reviews.json...');
    const mockDataPath = path.resolve(__dirname, 'mock-hostaway-reviews.json');
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

    // Insert listings and reviews (adjust structure as needed)
    for (const listing of mockData.listings) {
      await prisma.listing.create({
        data: {
          ...listing,
          reviews: {
            create: listing.reviews || [],
          },
        },
      });
    }

  } else {
    // Use HostawayService
    console.log('📥 Syncing Hostaway reviews...');
    const hostawayService = new HostawayService();
    await hostawayService.syncReviews();
  }

  // Get some stats
  const reviewCount = await prisma.review.count();
  const listingCount = await prisma.listing.count();

  console.log(`✅ Seed completed successfully!`);
  console.log(`📊 Created ${listingCount} listings and ${reviewCount} reviews`);

  // Show some sample data
  const sampleReviews = await prisma.review.findMany({
    take: 3,
    include: {
      listing: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('\n📋 Sample reviews:');
  sampleReviews.forEach((review, index) => {
    console.log(`${index + 1}. ${review.listing.name} - ${review.authorName} (${review.ratingOverall}/10)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });