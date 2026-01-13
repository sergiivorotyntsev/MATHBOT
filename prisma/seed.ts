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

  // Seed questions
  console.log('\n📝 Seeding questions...');

  const questionsToCreate = [];

  // ==================== ARITHMETIC ====================

  // Addition (arithmetic_addition)
  console.log('  Generating Addition questions...');
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const correct = a + b;
    const choices = [
      correct.toString(),
      (correct + 1).toString(),
      (correct - 1).toString(),
      (correct + 2).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'arithmetic_addition',
      domain: 'Arithmetic',
      topic: 'Addition',
      subtopic: null,
      difficulty: Math.min(10, Math.floor((a + b) / 4) + 1),
      ageMin: 6,
      ageMax: 10,
      gradeMin: '1',
      gradeMax: '4',
      locale: 'ru',
      prompt: `Сколько будет ${a} + ${b}?`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `${a} + ${b} = ${correct}`,
      format: 'mcq',
      tags: JSON.stringify(['arithmetic', 'addition', 'basic']),
      validated: true,
    });
  }

  // Subtraction (arithmetic_subtraction)
  console.log('  Generating Subtraction questions...');
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(Math.random() * 30) + 10;
    const b = Math.floor(Math.random() * a);
    const correct = a - b;
    const choices = [
      correct.toString(),
      (correct + 1).toString(),
      (correct - 1).toString(),
      (correct + 2).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'arithmetic_subtraction',
      domain: 'Arithmetic',
      topic: 'Subtraction',
      subtopic: null,
      difficulty: Math.min(10, Math.floor(a / 5) + 1),
      ageMin: 6,
      ageMax: 10,
      gradeMin: '1',
      gradeMax: '4',
      locale: 'ru',
      prompt: `Сколько будет ${a} − ${b}?`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `${a} − ${b} = ${correct}`,
      format: 'mcq',
      tags: JSON.stringify(['arithmetic', 'subtraction', 'basic']),
      validated: true,
    });
  }

  // Multiplication (arithmetic_multiplication)
  console.log('  Generating Multiplication questions...');
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const correct = a * b;
    const choices = [
      correct.toString(),
      (correct + a).toString(),
      (correct - a).toString(),
      (correct + b).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'arithmetic_multiplication',
      domain: 'Arithmetic',
      topic: 'Multiplication',
      subtopic: null,
      difficulty: Math.min(10, Math.floor((a * b) / 10) + 1),
      ageMin: 8,
      ageMax: 12,
      gradeMin: '3',
      gradeMax: '6',
      locale: 'ru',
      prompt: `Сколько будет ${a} × ${b}?`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `${a} × ${b} = ${correct}`,
      format: 'mcq',
      tags: JSON.stringify(['arithmetic', 'multiplication', 'basic']),
      validated: true,
    });
  }

  // Division (arithmetic_division)
  console.log('  Generating Division questions...');
  for (let i = 0; i < 25; i++) {
    const b = Math.floor(Math.random() * 9) + 2; // divisor 2-10
    const correct = Math.floor(Math.random() * 10) + 1; // quotient 1-10
    const a = b * correct; // dividend
    const choices = [
      correct.toString(),
      (correct + 1).toString(),
      (correct - 1).toString(),
      (correct + 2).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'arithmetic_division',
      domain: 'Arithmetic',
      topic: 'Division',
      subtopic: null,
      difficulty: Math.min(10, Math.floor(a / 10) + 2),
      ageMin: 8,
      ageMax: 12,
      gradeMin: '3',
      gradeMax: '6',
      locale: 'ru',
      prompt: `Сколько будет ${a} ÷ ${b}?`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `${a} ÷ ${b} = ${correct}`,
      format: 'mcq',
      tags: JSON.stringify(['arithmetic', 'division', 'basic']),
      validated: true,
    });
  }

  // ==================== GEOMETRY ====================

  // Shapes (geometry_shapes)
  console.log('  Generating Geometry Shapes questions...');
  const shapeQuestions = [
    { shape: 'треугольник', sides: 3, desc: 'имеет 3 стороны' },
    { shape: 'квадрат', sides: 4, desc: 'имеет 4 равные стороны' },
    { shape: 'прямоугольник', sides: 4, desc: 'имеет 4 стороны и 4 прямых угла' },
    { shape: 'круг', sides: 0, desc: 'не имеет углов' },
    { shape: 'пятиугольник', sides: 5, desc: 'имеет 5 сторон' },
    { shape: 'шестиугольник', sides: 6, desc: 'имеет 6 сторон' },
  ];

  for (let i = 0; i < 20; i++) {
    const shape = shapeQuestions[i % shapeQuestions.length];
    questionsToCreate.push({
      skillId: 'geometry_shapes',
      domain: 'Geometry',
      topic: 'Shapes',
      subtopic: null,
      difficulty: 3,
      ageMin: 6,
      ageMax: 10,
      gradeMin: 'K',
      gradeMax: '3',
      locale: 'ru',
      prompt: `Сколько сторон у фигуры "${shape.shape}"?`,
      choices: JSON.stringify([shape.sides.toString(), (shape.sides + 1).toString(), (shape.sides - 1).toString(), (shape.sides + 2).toString()].sort(() => Math.random() - 0.5)),
      correct: shape.sides.toString(),
      explanation: `${shape.shape} ${shape.desc}`,
      format: 'mcq',
      tags: JSON.stringify(['geometry', 'shapes', 'basic']),
      validated: true,
    });
  }

  // Perimeter (geometry_perimeter)
  console.log('  Generating Perimeter questions...');
  for (let i = 0; i < 25; i++) {
    const length = Math.floor(Math.random() * 10) + 3;
    const width = Math.floor(Math.random() * 10) + 2;
    const correct = 2 * (length + width);
    const choices = [
      correct.toString(),
      (correct + 2).toString(),
      (correct - 2).toString(),
      (length * width).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'geometry_perimeter',
      domain: 'Geometry',
      topic: 'Perimeter',
      subtopic: null,
      difficulty: Math.min(10, Math.floor((length + width) / 3) + 2),
      ageMin: 8,
      ageMax: 12,
      gradeMin: '3',
      gradeMax: '5',
      locale: 'ru',
      prompt: `Найдите периметр прямоугольника с длиной ${length} см и шириной ${width} см.`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `Периметр = 2 × (длина + ширина) = 2 × (${length} + ${width}) = ${correct} см`,
      format: 'mcq',
      tags: JSON.stringify(['geometry', 'perimeter', 'measurement']),
      validated: true,
    });
  }

  // Area (geometry_area)
  console.log('  Generating Area questions...');
  for (let i = 0; i < 25; i++) {
    const length = Math.floor(Math.random() * 10) + 3;
    const width = Math.floor(Math.random() * 10) + 2;
    const correct = length * width;
    const perimeter = 2 * (length + width);
    const choices = [
      correct.toString(),
      (correct + width).toString(),
      (correct + length).toString(),
      perimeter.toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'geometry_area',
      domain: 'Geometry',
      topic: 'Area',
      subtopic: null,
      difficulty: Math.min(10, Math.floor((length * width) / 10) + 2),
      ageMin: 9,
      ageMax: 13,
      gradeMin: '3',
      gradeMax: '6',
      locale: 'ru',
      prompt: `Найдите площадь прямоугольника с длиной ${length} см и шириной ${width} см.`,
      choices: JSON.stringify(choices),
      correct: correct.toString(),
      explanation: `Площадь = длина × ширина = ${length} × ${width} = ${correct} см²`,
      format: 'mcq',
      tags: JSON.stringify(['geometry', 'area', 'measurement']),
      validated: true,
    });
  }

  // ==================== LOGIC ====================

  // Patterns (logic_patterns)
  console.log('  Generating Pattern questions...');
  const patternTypes = [
    { pattern: [2, 4, 6, 8], next: 10, rule: 'увеличение на 2' },
    { pattern: [5, 10, 15, 20], next: 25, rule: 'увеличение на 5' },
    { pattern: [1, 3, 5, 7], next: 9, rule: 'нечётные числа' },
    { pattern: [10, 20, 30, 40], next: 50, rule: 'увеличение на 10' },
    { pattern: [3, 6, 9, 12], next: 15, rule: 'кратные 3' },
  ];

  for (let i = 0; i < 25; i++) {
    const p = patternTypes[i % patternTypes.length];
    const choices = [
      p.next.toString(),
      (p.next + 1).toString(),
      (p.next - 1).toString(),
      (p.next + 5).toString()
    ].sort(() => Math.random() - 0.5);

    questionsToCreate.push({
      skillId: 'logic_patterns',
      domain: 'Logic',
      topic: 'Patterns',
      subtopic: null,
      difficulty: 4,
      ageMin: 7,
      ageMax: 11,
      gradeMin: '2',
      gradeMax: '5',
      locale: 'ru',
      prompt: `Какое число следующее в последовательности: ${p.pattern.join(', ')}, ?`,
      choices: JSON.stringify(choices),
      correct: p.next.toString(),
      explanation: `Правило: ${p.rule}. Следующее число: ${p.next}`,
      format: 'mcq',
      tags: JSON.stringify(['logic', 'patterns', 'sequences']),
      validated: true,
    });
  }

  // Insert all questions
  console.log(`\n  Creating ${questionsToCreate.length} questions...`);

  const createdQuestions = await prisma.question.createMany({
    data: questionsToCreate,
  });

  console.log(`✅ Created ${createdQuestions.count} questions`);

  console.log('\n🎉 Seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`  Skills: ${SKILL_REGISTRY.length}`);
  console.log(`  Questions: ${createdQuestions.count}`);
  console.log(`  Users: 2 (test student + admin)`);
  console.log('\nNext steps:');
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
