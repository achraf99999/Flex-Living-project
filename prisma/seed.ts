import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function categoriesToJson(categories: any[]) {
  // Convert array of {category, rating} to an object: { category: rating, ... }
  const obj: Record<string, number> = {};
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat.category) obj[cat.category] = cat.rating;
    }
  }
  return obj;
}

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.reviewSelectionLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listing.deleteMany();

  const mockDataPath = path.join(__dirname, 'mock-hostaway-reviews.json');
  const reviewsData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

  // 1. Collect unique listings by name
  const listingMap: Record<string, any> = {};
  for (const review of reviewsData) {
    if (!listingMap[review.listingName]) {
      listingMap[review.listingName] = {
        name: review.listingName,
        slug: review.listingName.replace(/\s+/g, '-').toLowerCase(),
        channel: review.channel || null,
        externalId: null, // You can generate/assign if needed
      };
    }
  }
  // 2. Insert listings
  const listingNameToId: Record<string, string> = {};
  for (const listing of Object.values(listingMap)) {
    const created = await prisma.listing.create({ data: listing });
    listingNameToId[created.name] = created.id;
  }

  // 3. Insert reviews, referencing listings
  for (const review of reviewsData) {
    await prisma.review.create({
      data: {
        source: review.channel || "unknown",
        externalId: review.id,
        listingId: listingNameToId[review.listingName],
        type: review.type,
        status: review.status,
        ratingOverall: review.rating,
        categories: categoriesToJson(review.reviewCategory),
        text: review.publicReview,
        authorName: review.guestName,
        submittedAt: new Date(review.submittedAt),
        approved: review.status === "published",
        channel: review.channel || null,
      },
    });
  }

  // Done!
  const reviewCount = await prisma.review.count();
  const listingCount = await prisma.listing.count();

  console.log(`✅ Seed completed successfully!`);
  console.log(`📊 Created ${listingCount} listings and ${reviewCount} reviews`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });