/**
 * Question Migration Script
 *
 * Converts existing taskBank tasks to MCQ format and loads into database.
 * Run: tsx prisma/migrate-questions.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import { arithmeticTasks, geometryTasks, logicTasks, Task } from '../src/data/taskBank';

// Load environment variables
dotenv.config();

// Initialize Prisma Client with SQLite adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

// Mapping of task topics to skill IDs
const TOPIC_TO_SKILL: Record<string, string> = {
  'Сложение': 'arithmetic_addition',
  'Вычитание': 'arithmetic_subtraction',
  'Умножение': 'arithmetic_multiplication',
  'Деление': 'arithmetic_division',
  'Удвоение': 'arithmetic_multiplication',
  'Дроби': 'arithmetic_fractions',
  'Десятичные': 'arithmetic_decimals',
  'Фигуры': 'geometry_shapes',
  'Периметр': 'geometry_perimeter',
  'Площадь': 'geometry_area',
  'Паттерны': 'logic_patterns',
  'Последовательности': 'logic_sequences',
  'Задачи': 'logic_word_problems',
};

// Mapping difficulty (1-6) to age ranges and grade bands
function mapDifficultyToMetadata(difficulty: number) {
  if (difficulty <= 2) {
    return { ageMin: 6, ageMax: 8, gradeMin: 'K-1', gradeMax: '2-3' };
  } else if (difficulty <= 4) {
    return { ageMin: 8, ageMax: 11, gradeMin: '2-3', gradeMax: '4-5' };
  } else {
    return { ageMin: 11, ageMax: 14, gradeMin: '4-5', gradeMax: '6-7' };
  }
}

// Generate MCQ choices for a numeric answer
function generateChoicesForNumeric(correctAnswer: number, count = 4): string[] {
  const choices = [correctAnswer.toString()];
  const offsets = [-2, -1, 1, 2, 3, -3, 4, -4];

  for (const offset of offsets) {
    const value = correctAnswer + offset;
    if (value > 0 && !choices.includes(value.toString()) && choices.length < count) {
      choices.push(value.toString());
    }
  }

  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return choices;
}

// Generate MCQ choices for a string answer (geometry/logic)
function generateChoicesForString(correctAnswer: string, domain: string): string[] {
  const geometryShapes = ['круг', 'квадрат', 'треугольник', 'прямоугольник', 'ромб', 'трапеция'];
  const logicOptions = ['A', 'B', 'C', 'D'];

  if (domain === 'Geometry') {
    const choices = [correctAnswer];
    const pool = geometryShapes.filter(s => s !== correctAnswer.toLowerCase());

    while (choices.length < 4 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      choices.push(pool.splice(idx, 1)[0]);
    }

    return choices;
  } else {
    return logicOptions;
  }
}

// Convert Task to Question format
async function migrateTask(task: Task, domain: string): Promise<void> {
  const skillId = TOPIC_TO_SKILL[task.t];

  if (!skillId) {
    console.warn(`  ⚠️  No skill mapping for topic: ${task.t}`);
    return;
  }

  // Check if skill exists
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    console.warn(`  ⚠️  Skill not found: ${skillId}`);
    return;
  }

  const metadata = mapDifficultyToMetadata(task.d);

  // Generate choices
  const isNumeric = typeof task.a === 'number';
  const correctAnswer = task.a.toString();
  const choices = isNumeric
    ? generateChoicesForNumeric(task.a as number)
    : generateChoicesForString(task.a as string, domain);

  // Check if question already exists (by content similarity)
  const existingQuestion = await prisma.question.findFirst({
    where: {
      prompt: task.q,
      skillId: skillId,
    },
  });

  if (existingQuestion) {
    console.log(`  ↩️  Skipping duplicate: ${task.q.substring(0, 50)}...`);
    return;
  }

  // Create question
  await prisma.question.create({
    data: {
      skillId,
      domain,
      topic: skill.topic,
      subtopic: skill.subtopic,
      difficulty: Math.min(10, Math.ceil(task.d * 1.67)), // Scale 1-6 to 1-10
      ageMin: metadata.ageMin,
      ageMax: metadata.ageMax,
      gradeMin: metadata.gradeMin,
      gradeMax: metadata.gradeMax,
      locale: 'ru',
      prompt: task.q,
      choices: JSON.stringify(choices),
      correct: correctAnswer,
      explanation: task.e,
      format: 'mcq',
      tags: JSON.stringify([]),
      version: 1,
      validated: false, // Mark as unvalidated for review
    },
  });

  console.log(`  ✅ Migrated: ${task.q.substring(0, 50)}...`);
}

async function main() {
  console.log('🔄 Starting question migration...\n');

  try {
    let totalMigrated = 0;

    // Migrate arithmetic tasks
    console.log('📊 Migrating arithmetic tasks...');
    for (const task of arithmeticTasks) {
      await migrateTask(task, 'Arithmetic');
      totalMigrated++;
    }

    // Migrate geometry tasks
    console.log('\n📐 Migrating geometry tasks...');
    for (const task of geometryTasks) {
      await migrateTask(task, 'Geometry');
      totalMigrated++;
    }

    // Migrate logic tasks
    console.log('\n🧩 Migrating logic tasks...');
    for (const task of logicTasks) {
      await migrateTask(task, 'Logic');
      totalMigrated++;
    }

    console.log(`\n✅ Migration complete! ${totalMigrated} questions migrated.`);

    // Show stats
    const stats = await prisma.question.groupBy({
      by: ['domain'],
      _count: true,
    });

    console.log('\n📈 Question bank stats:');
    stats.forEach(stat => {
      console.log(`  ${stat.domain}: ${stat._count} questions`);
    });

    const total = await prisma.question.count();
    console.log(`  Total: ${total} questions\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
