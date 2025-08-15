import { PrismaClient } from '@prisma/client';
import { HostawayService } from '../services/hostaway';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.reviewSelectionLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listing.deleteMany();

  // Sync Hostaway reviews
  console.log('📥 Syncing Hostaway reviews...');
  const hostawayService = new HostawayService();
  await hostawayService.syncReviews();

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
