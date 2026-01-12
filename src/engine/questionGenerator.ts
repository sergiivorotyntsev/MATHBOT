/**
 * 🎲 Question Generator System
 *
 * Template-based question generation with deterministic seeding.
 * Generates 10,000+ unique questions across all topics and difficulty tiers.
 *
 * Key principles:
 * - Deterministic: same seed = same question
 * - Stable IDs: questions have consistent IDs across sessions
 * - Parameterized: difficulty tier and grade band affect generation
 * - Variety: enough variation to prevent repeats in normal sessions
 */

import {
  Question,
  QuestionDomain,
  QuestionTopic,
  GradeBand,
  AgeBand,
  DifficultyTier,
  QuestionLanguage,
  SkillId,
  createSkillId,
  calculateGlobalDifficulty,
  gradeBandToAgeBand
} from '../types/question';

// ==================== SEEDED RANDOM ====================

/**
 * Simple seeded random number generator (LCG)
 * Returns values in [0, 1)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2146483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Simple hash function for stable IDs
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ==================== QUESTION TEMPLATE INTERFACE ====================

interface QuestionTemplate {
  templateId: string;
  domain: QuestionDomain;
  topic: QuestionTopic;
  gradeBands: GradeBand[];
  difficultyTiers: DifficultyTier[];
  prerequisites: SkillId[];
  tags: string[];

  /**
   * Generate a question given params
   */
  generate(params: {
    seed: number;
    gradeBand: GradeBand;
    tier: DifficultyTier;
    language: QuestionLanguage;
  }): Omit<Question, 'id' | 'skillId' | 'version' | 'source' | 'templateId' | 'generationParams'>;
}

// ==================== ARITHMETIC TEMPLATES ====================

const additionTemplate: QuestionTemplate = {
  templateId: 'arithmetic_addition_basic',
  domain: 'Arithmetic',
  topic: 'Addition',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],
  tags: ['arithmetic', 'addition', 'basic'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    // Determine number ranges based on grade and tier
    let maxNum = 10;
    if (gradeBand === 'K-1') maxNum = tier === 1 ? 5 : tier === 2 ? 10 : 20;
    else if (gradeBand === '2-3') maxNum = tier === 1 ? 20 : tier === 2 ? 50 : tier === 3 ? 100 : 500;
    else maxNum = tier === 1 ? 100 : tier === 2 ? 500 : tier === 3 ? 1000 : 5000;

    const a = rng.nextInt(1, maxNum);
    const b = rng.nextInt(1, maxNum);
    const correctAnswer = a + b;

    // Generate wrong answers
    const wrongAnswers = [
      correctAnswer + rng.nextInt(1, 10),
      correctAnswer - rng.nextInt(1, 10),
      a + b + rng.nextInt(5, 15)
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru' ? `Чему равно ${a} + ${b}?` : `What is ${a} + ${b}?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `${a} + ${b} = ${correctAnswer}`
        : `${a} + ${b} = ${correctAnswer}`,
      domain: 'Arithmetic',
      topic: 'Addition',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['arithmetic', 'addition', 'basic']
    };
  }
};

const subtractionTemplate: QuestionTemplate = {
  templateId: 'arithmetic_subtraction_basic',
  domain: 'Arithmetic',
  topic: 'Subtraction',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],
  tags: ['arithmetic', 'subtraction', 'basic'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let maxNum = 10;
    if (gradeBand === 'K-1') maxNum = tier === 1 ? 10 : tier === 2 ? 20 : 50;
    else if (gradeBand === '2-3') maxNum = tier === 1 ? 50 : tier === 2 ? 100 : tier === 3 ? 500 : 1000;
    else maxNum = tier === 1 ? 500 : tier === 2 ? 1000 : 5000;

    const a = rng.nextInt(1, maxNum);
    const b = rng.nextInt(1, a); // Ensure positive result
    const correctAnswer = a - b;

    const wrongAnswers = [
      correctAnswer + rng.nextInt(1, 10),
      correctAnswer - rng.nextInt(1, Math.max(1, correctAnswer - 1)),
      a + b
    ].filter(x => x >= 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru' ? `Чему равно ${a} − ${b}?` : `What is ${a} − ${b}?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `${a} − ${b} = ${correctAnswer}`
        : `${a} − ${b} = ${correctAnswer}`,
      domain: 'Arithmetic',
      topic: 'Subtraction',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['arithmetic', 'subtraction', 'basic']
    };
  }
};

const multiplicationTemplate: QuestionTemplate = {
  templateId: 'arithmetic_multiplication_basic',
  domain: 'Arithmetic',
  topic: 'Multiplication',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Addition')],
  tags: ['arithmetic', 'multiplication', 'times tables'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let maxA = 10, maxB = 10;
    if (gradeBand === '2-3') {
      maxA = tier <= 2 ? 10 : 12;
      maxB = tier === 1 ? 10 : tier === 2 ? 10 : 12;
    } else if (gradeBand === '4-5') {
      maxA = tier === 1 ? 12 : tier === 2 ? 20 : 50;
      maxB = tier === 1 ? 12 : tier === 2 ? 12 : 20;
    } else {
      maxA = tier === 1 ? 25 : tier === 2 ? 50 : 100;
      maxB = tier === 1 ? 25 : tier === 2 ? 50 : 100;
    }

    const a = rng.nextInt(2, maxA);
    const b = rng.nextInt(2, maxB);
    const correctAnswer = a * b;

    const wrongAnswers = [
      correctAnswer + a,
      correctAnswer - b,
      a * (b + 1),
      a * (b - 1)
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru' ? `Чему равно ${a} × ${b}?` : `What is ${a} × ${b}?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `${a} × ${b} = ${correctAnswer}`
        : `${a} × ${b} = ${correctAnswer}`,
      domain: 'Arithmetic',
      topic: 'Multiplication',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Addition')],
      tags: ['arithmetic', 'multiplication', 'times tables']
    };
  }
};

const divisionTemplate: QuestionTemplate = {
  templateId: 'arithmetic_division_basic',
  domain: 'Arithmetic',
  topic: 'Division',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Multiplication')],
  tags: ['arithmetic', 'division', 'basic'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let maxDivisor = 10, maxResult = 10;
    if (gradeBand === '2-3') {
      maxDivisor = tier <= 2 ? 10 : 12;
      maxResult = tier === 1 ? 10 : 12;
    } else if (gradeBand === '4-5') {
      maxDivisor = tier === 1 ? 12 : tier === 2 ? 20 : 25;
      maxResult = tier === 1 ? 12 : tier === 2 ? 20 : 50;
    } else {
      maxDivisor = tier === 1 ? 25 : tier === 2 ? 50 : 100;
      maxResult = tier === 1 ? 25 : tier === 2 ? 50 : 100;
    }

    const divisor = rng.nextInt(2, maxDivisor);
    const result = rng.nextInt(2, maxResult);
    const dividend = divisor * result;

    const wrongAnswers = [
      result + 1,
      result - 1,
      result + rng.nextInt(2, 5),
      divisor
    ].filter(x => x > 0 && x !== result);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), result]).map(String);

    return {
      language,
      prompt: language === 'ru' ? `Чему равно ${dividend} ÷ ${divisor}?` : `What is ${dividend} ÷ ${divisor}?`,
      choices,
      correctAnswer: String(result),
      explanation: language === 'ru'
        ? `${dividend} ÷ ${divisor} = ${result}`
        : `${dividend} ÷ ${divisor} = ${result}`,
      domain: 'Arithmetic',
      topic: 'Division',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Multiplication')],
      tags: ['arithmetic', 'division', 'basic']
    };
  }
};

// ==================== GEOMETRY TEMPLATES ====================

const perimeterTemplate: QuestionTemplate = {
  templateId: 'geometry_perimeter_rectangle',
  domain: 'Geometry',
  topic: 'Perimeter',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Addition')],
  tags: ['geometry', 'perimeter', 'rectangle'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let maxSide = 10;
    if (gradeBand === '2-3') maxSide = tier === 1 ? 10 : tier === 2 ? 20 : 50;
    else if (gradeBand === '4-5') maxSide = tier === 1 ? 20 : tier === 2 ? 50 : 100;
    else maxSide = tier === 1 ? 50 : tier === 2 ? 100 : 200;

    const length = rng.nextInt(3, maxSide);
    const width = rng.nextInt(2, length - 1);
    const correctAnswer = 2 * (length + width);

    const wrongAnswers = [
      length + width,
      length * width,
      correctAnswer + rng.nextInt(2, 10),
      correctAnswer - rng.nextInt(2, 10)
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `Прямоугольник имеет длину ${length} и ширину ${width}. Чему равен периметр?`
        : `A rectangle has length ${length} and width ${width}. What is the perimeter?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `Периметр = 2 × (${length} + ${width}) = ${correctAnswer}`
        : `Perimeter = 2 × (${length} + ${width}) = ${correctAnswer}`,
      domain: 'Geometry',
      topic: 'Perimeter',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Addition')],
      tags: ['geometry', 'perimeter', 'rectangle']
    };
  }
};

const areaTemplate: QuestionTemplate = {
  templateId: 'geometry_area_rectangle',
  domain: 'Geometry',
  topic: 'Area',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Multiplication')],
  tags: ['geometry', 'area', 'rectangle'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let maxSide = 10;
    if (gradeBand === '2-3') maxSide = tier === 1 ? 10 : tier === 2 ? 15 : 20;
    else if (gradeBand === '4-5') maxSide = tier === 1 ? 20 : tier === 2 ? 30 : 50;
    else maxSide = tier === 1 ? 50 : tier === 2 ? 100 : 200;

    const length = rng.nextInt(2, maxSide);
    const width = rng.nextInt(2, maxSide);
    const correctAnswer = length * width;

    const wrongAnswers = [
      2 * (length + width),
      length + width,
      correctAnswer + rng.nextInt(5, 15),
      correctAnswer - rng.nextInt(5, 15)
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `Прямоугольник имеет длину ${length} и ширину ${width}. Чему равна площадь?`
        : `A rectangle has length ${length} and width ${width}. What is the area?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `Площадь = ${length} × ${width} = ${correctAnswer}`
        : `Area = ${length} × ${width} = ${correctAnswer}`,
      domain: 'Geometry',
      topic: 'Area',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Multiplication')],
      tags: ['geometry', 'area', 'rectangle']
    };
  }
};

// ==================== LOGIC TEMPLATES ====================

const patternsTemplate: QuestionTemplate = {
  templateId: 'logic_patterns_sequence',
  domain: 'Logic',
  topic: 'Patterns',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],
  tags: ['logic', 'patterns', 'sequences'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    let start = rng.nextInt(1, 20);
    let step = tier === 1 ? rng.nextInt(1, 5) : tier === 2 ? rng.nextInt(2, 10) : rng.nextInt(5, 20);

    if (gradeBand === 'K-1') {
      start = rng.nextInt(1, 10);
      step = rng.nextInt(1, 3);
    }

    const sequence = [start, start + step, start + 2 * step, start + 3 * step];
    const correctAnswer = start + 4 * step;

    const wrongAnswers = [
      correctAnswer + step,
      correctAnswer - step,
      correctAnswer + rng.nextInt(1, 5),
      sequence[3] * 2
    ].filter(x => x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `Какое число продолжает последовательность: ${sequence.join(', ')}, ?`
        : `What number continues the pattern: ${sequence.join(', ')}, ?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `Последовательность увеличивается на ${step} каждый раз`
        : `The pattern increases by ${step} each time`,
      domain: 'Logic',
      topic: 'Patterns',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['logic', 'patterns', 'sequences']
    };
  }
};

// ==================== TEMPLATE REGISTRY ====================

const ALL_TEMPLATES: QuestionTemplate[] = [
  additionTemplate,
  subtractionTemplate,
  multiplicationTemplate,
  divisionTemplate,
  perimeterTemplate,
  areaTemplate,
  patternsTemplate
];

// ==================== GENERATOR API ====================

/**
 * Generate a single question from a template
 */
export function generateQuestion(
  templateId: string,
  variant: number,
  gradeBand: GradeBand,
  tier: DifficultyTier,
  language: QuestionLanguage
): Question {
  const template = ALL_TEMPLATES.find(t => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Create deterministic seed from template + variant + gradeBand + tier
  const seedString = `${templateId}_${variant}_${gradeBand}_${tier}`;
  const seed = hashString(seedString);

  // Generate base question
  const baseQuestion = template.generate({ seed, gradeBand, tier, language });

  // Create stable ID
  const id = `${templateId}_${variant}_${gradeBand}_${tier}`;

  // Create skill ID
  const skillId = createSkillId(template.domain, template.topic);

  // Assemble full question
  return {
    ...baseQuestion,
    id,
    skillId,
    version: '1.0.0',
    source: 'generated',
    templateId,
    generationParams: { variant, gradeBand, tier, language }
  };
}

/**
 * Generate all questions for a template
 * @param templateId Template identifier
 * @param variantsPerConfig Number of variants per (gradeBand, tier) combination
 */
export function generateAllQuestionsForTemplate(
  templateId: string,
  variantsPerConfig: number = 100,
  language: QuestionLanguage = 'en'
): Question[] {
  const template = ALL_TEMPLATES.find(t => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const questions: Question[] = [];

  for (const gradeBand of template.gradeBands) {
    for (const tier of template.difficultyTiers) {
      for (let variant = 0; variant < variantsPerConfig; variant++) {
        questions.push(generateQuestion(templateId, variant, gradeBand, tier, language));
      }
    }
  }

  return questions;
}

/**
 * Generate entire question bank (10,000+ questions)
 */
export function generateQuestionBank(
  variantsPerConfig: number = 100,
  language: QuestionLanguage = 'en'
): Question[] {
  const allQuestions: Question[] = [];

  for (const template of ALL_TEMPLATES) {
    const questions = generateAllQuestionsForTemplate(template.templateId, variantsPerConfig, language);
    allQuestions.push(...questions);
  }

  console.log(`Generated ${allQuestions.length} questions from ${ALL_TEMPLATES.length} templates`);
  return allQuestions;
}

/**
 * Get all available templates
 */
export function getAvailableTemplates(): QuestionTemplate[] {
  return ALL_TEMPLATES;
}

/**
 * Get templates for a specific domain
 */
export function getTemplatesForDomain(domain: QuestionDomain): QuestionTemplate[] {
  return ALL_TEMPLATES.filter(t => t.domain === domain);
}

/**
 * Get templates for a specific topic
 */
export function getTemplatesForTopic(topic: QuestionTopic): QuestionTemplate[] {
  return ALL_TEMPLATES.filter(t => t.topic === topic);
}
