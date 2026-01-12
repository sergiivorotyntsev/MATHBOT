#!/usr/bin/env tsx
/**
 * 🏗️ Question Bank Builder
 * Generates all questions from templates and validates uniqueness
 */

import { ALL_TEMPLATES } from '../src/engine/generators';
import { Question, GradeLevel, Domain } from '../src/engine/types';

// ==================== CONFIGURATION ====================

const SAMPLES_PER_TEMPLATE = 20; // Generate 20 samples per template per difficulty
const GRADES: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];
const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

// ==================== GENERATION ====================

interface GenerationStats {
  totalGenerated: number;
  uniqueQuestionIds: Set<string>;
  byGrade: Record<GradeLevel, number>;
  byDomain: Record<Domain, number>;
  byDifficulty: Record<number, number>;
  byTemplate: Record<string, number>;
  duplicates: number;
  errors: number;
}

function initStats(): GenerationStats {
  return {
    totalGenerated: 0,
    uniqueQuestionIds: new Set(),
    byGrade: {} as Record<GradeLevel, number>,
    byDomain: {} as Record<Domain, number>,
    byDifficulty: {} as Record<number, number>,
    byTemplate: {} as Record<string, number>,
    duplicates: 0,
    errors: 0
  };
}

function generateQuestions(): GenerationStats {
  const stats = initStats();
  const questions: Question[] = [];

  console.log(`\n🏗️  Building Question Bank...\n`);
  console.log(`Templates: ${ALL_TEMPLATES.length}`);
  console.log(`Samples per template per difficulty: ${SAMPLES_PER_TEMPLATE}`);
  console.log(`Difficulties tested: ${DIFFICULTIES.join(', ')}\n`);

  for (const template of ALL_TEMPLATES) {
    console.log(`  📝 ${template.id} (${template.name})...`);
    let templateCount = 0;

    for (const difficulty of DIFFICULTIES) {
      for (const grade of GRADES) {
        // Check if this grade is in template's range
        const gradeOrder = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
        const gradeIdx = gradeOrder.indexOf(grade);
        const minIdx = gradeOrder.indexOf(template.gradeRange[0]);
        const maxIdx = gradeOrder.indexOf(template.gradeRange[1]);

        if (gradeIdx < minIdx || gradeIdx > maxIdx) {
          continue; // Skip this grade
        }

        for (let i = 0; i < SAMPLES_PER_TEMPLATE; i++) {
          try {
            const seed = Date.now() + i + templateCount * 1000;
            const question = template.generator({
              seed,
              difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
              grade,
              options: {}
            });

            stats.totalGenerated++;
            templateCount++;

            // Check uniqueness
            const qid = question.metadata.questionId;
            if (stats.uniqueQuestionIds.has(qid)) {
              stats.duplicates++;
            } else {
              stats.uniqueQuestionIds.add(qid);

              // Count by grade
              for (const qGrade of question.metadata.gradeRange) {
                stats.byGrade[qGrade] = (stats.byGrade[qGrade] || 0) + 1;
              }

              // Count by domain
              for (const domain of question.metadata.domains) {
                stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
              }

              // Count by difficulty
              stats.byDifficulty[question.metadata.difficulty] =
                (stats.byDifficulty[question.metadata.difficulty] || 0) + 1;

              // Count by template
              stats.byTemplate[template.id] = (stats.byTemplate[template.id] || 0) + 1;

              questions.push(question);
            }
          } catch (error) {
            stats.errors++;
            console.error(`    ⚠️  Error generating question: ${error}`);
          }
        }
      }
    }

    console.log(`     ✓ Generated ${templateCount} variations`);
  }

  return stats;
}

// ==================== VALIDATION ====================

function validateQuestions(stats: GenerationStats): boolean {
  console.log(`\n🔍 Validation...\n`);

  let valid = true;

  // Check minimum count
  const MIN_REQUIRED = 10000;
  if (stats.uniqueQuestionIds.size < MIN_REQUIRED) {
    console.error(`  ❌ FAIL: Only ${stats.uniqueQuestionIds.size} unique questions (need ${MIN_REQUIRED})`);
    valid = false;
  } else {
    console.log(`  ✅ PASS: ${stats.uniqueQuestionIds.size} unique questions (exceeds ${MIN_REQUIRED})`);
  }

  // Check duplicates
  const duplicateRate = (stats.duplicates / stats.totalGenerated) * 100;
  if (duplicateRate > 5) {
    console.warn(`  ⚠️  WARNING: ${duplicateRate.toFixed(2)}% duplicate rate`);
  } else {
    console.log(`  ✅ Low duplicate rate: ${duplicateRate.toFixed(2)}%`);
  }

  // Check errors
  if (stats.errors > 0) {
    console.warn(`  ⚠️  ${stats.errors} generation errors`);
  } else {
    console.log(`  ✅ No generation errors`);
  }

  // Check grade coverage
  console.log(`\n  Grade Coverage:`);
  for (const grade of GRADES) {
    const count = stats.byGrade[grade] || 0;
    console.log(`    ${grade}: ${count} questions`);
    if (count === 0) {
      console.warn(`    ⚠️  No questions for grade ${grade}`);
    }
  }

  return valid;
}

// ==================== REPORTING ====================

function printReport(stats: GenerationStats): void {
  console.log(`\n📊 Question Bank Statistics\n`);
  console.log(`═══════════════════════════════════════════\n`);

  console.log(`Total Generated:     ${stats.totalGenerated}`);
  console.log(`Unique Questions:    ${stats.uniqueQuestionIds.size}`);
  console.log(`Duplicates:          ${stats.duplicates} (${((stats.duplicates / stats.totalGenerated) * 100).toFixed(2)}%)`);
  console.log(`Errors:              ${stats.errors}\n`);

  console.log(`By Grade:`);
  for (const grade of GRADES) {
    const count = stats.byGrade[grade] || 0;
    console.log(`  ${grade.padEnd(3)} ${count.toString().padStart(6)} questions`);
  }

  console.log(`\nBy Domain:`);
  const domains = Object.keys(stats.byDomain).sort();
  for (const domain of domains) {
    console.log(`  ${domain.padEnd(5)} ${stats.byDomain[domain as Domain].toString().padStart(6)} questions`);
  }

  console.log(`\nBy Difficulty:`);
  for (let i = 1; i <= 5; i++) {
    const count = stats.byDifficulty[i] || 0;
    console.log(`  ${i}     ${count.toString().padStart(6)} questions`);
  }

  console.log(`\nTop 10 Templates by Variation:`);
  const sortedTemplates = Object.entries(stats.byTemplate)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  for (const [templateId, count] of sortedTemplates) {
    console.log(`  ${templateId.padEnd(30)} ${count.toString().padStart(6)}`);
  }

  console.log(`\n═══════════════════════════════════════════\n`);
}

// ==================== MAIN ====================

function main(): void {
  console.log(`\n╔═══════════════════════════════════════════╗`);
  console.log(`║   📚 MATHBOT Question Bank Builder       ║`);
  console.log(`╚═══════════════════════════════════════════╝`);

  const startTime = Date.now();

  // Generate questions
  const stats = generateQuestions();

  // Validate
  const isValid = validateQuestions(stats);

  // Report
  printReport(stats);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Completed in ${elapsed}s\n`);

  if (isValid) {
    console.log(`✅ Question bank is valid and ready!\n`);
    process.exit(0);
  } else {
    console.log(`❌ Question bank failed validation.\n`);
    process.exit(1);
  }
}

main();
