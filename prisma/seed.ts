/**
 * Database Seed Script
 *
 * Seeds skills taxonomy from curriculum definition.
 * Run: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import { SKILL_REGISTRY } from '../src/curriculum/skills';

// Load environment variables
dotenv.config();

// Initialize Prisma Client with SQLite adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data (optional - uncomment if needed)
  // console.log('🗑️  Clearing existing skills...');
  // await prisma.skill.deleteMany();

  // Seed skills
  console.log('📚 Seeding skills...');

  for (const skill of SKILL_REGISTRY) {
    console.log(`  Creating skill: ${skill.id} (${skill.name.en})`);

    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {
        domain: skill.domain,
        topic: skill.topic,
        subtopic: skill.subtopic,
        displayName: skill.name.en,
        description: `${skill.name.ru} - Priority ${skill.priority}`,
        prerequisites: JSON.stringify(skill.prerequisites),
        gradeMin: skill.gradeRange.min,
        gradeMax: skill.gradeRange.max,
        estimatedMinutes: skill.estimatedMasteryHours * 60,
        priority: skill.priority,
        ccssStandards: JSON.stringify(skill.ccssStandards),
      },
      create: {
        id: skill.id,
        domain: skill.domain,
        topic: skill.topic,
        subtopic: skill.subtopic,
        displayName: skill.name.en,
        description: `${skill.name.ru} - Priority ${skill.priority}`,
        prerequisites: JSON.stringify(skill.prerequisites),
        gradeMin: skill.gradeRange.min,
        gradeMax: skill.gradeRange.max,
        estimatedMinutes: skill.estimatedMasteryHours * 60,
        priority: skill.priority,
        ccssStandards: JSON.stringify(skill.ccssStandards),
      },
    });
  }

  console.log(`\n✅ Seeded ${SKILL_REGISTRY.length} skills`);

  // Create a test user
  console.log('\n👤 Creating test user...');

  const testUser = await prisma.user.upsert({
    where: { email: 'test@mathbot.local' },
    update: {
      name: 'Test Student',
      age: 8,
      gradeBand: '2-3',
    },
    create: {
      email: 'test@mathbot.local',
      name: 'Test Student',
      age: 8,
      gradeBand: '2-3',
      role: 'student',
    },
  });

  console.log(`  Created user: ${testUser.name} (${testUser.email})`);

  // Create an admin user
  console.log('\n🔐 Creating admin user...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mathbot.local' },
    update: {
      role: 'admin',
    },
    create: {
      email: 'admin@mathbot.local',
      name: 'Admin',
      age: 30,
      gradeBand: '10-12',
      role: 'admin',
    },
  });

  console.log(`  Created admin: ${adminUser.name} (${adminUser.email})`);

  console.log('\n🎉 Seeding completed!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run dev:server');
  console.log('  2. Test health: curl http://localhost:3001/health');
  console.log('  3. Get skills: curl http://localhost:3001/api/skills');
  console.log('  4. View DB: npm run db:studio\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
