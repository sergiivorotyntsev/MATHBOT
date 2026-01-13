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

/**
 * Ensure unique choices by removing duplicates
 * If not enough unique choices, generate more wrong answers
 */
function ensureUniqueChoices<T extends number | string>(
  correctAnswer: T,
  wrongAnswers: T[],
  count: number = 3
): T[] {
  // Remove duplicates from wrong answers
  const uniqueWrong = Array.from(new Set(wrongAnswers.filter(x => x !== correctAnswer)));

  // If we have enough unique wrong answers, return them
  if (uniqueWrong.length >= count) {
    return uniqueWrong.slice(0, count);
  }

  // If not enough, warn and return what we have (duplicates will be filtered in shuffle)
  if (uniqueWrong.length > 0) {
    console.warn(`Not enough unique wrong answers: have ${uniqueWrong.length}, need ${count}`);
    return uniqueWrong;
  }

  // Last resort: generate simple variations (for numeric answers only)
  if (typeof correctAnswer === 'number') {
    const result: T[] = [];
    let offset = 1;
    while (result.length < count) {
      const candidate1 = (correctAnswer + offset) as T;
      const candidate2 = (correctAnswer - offset) as T;

      if (!result.includes(candidate1) && candidate1 !== correctAnswer) {
        result.push(candidate1);
      }
      if (result.length < count && !result.includes(candidate2) && candidate2 !== correctAnswer) {
        result.push(candidate2);
      }
      offset++;

      // Safety: prevent infinite loop
      if (offset > 100) break;
    }
    return result.slice(0, count);
  }

  return uniqueWrong;
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
    const wrongAnswerCandidates = [
      correctAnswer + rng.nextInt(1, 10),
      correctAnswer - rng.nextInt(1, 10),
      a + b + rng.nextInt(5, 15),
      correctAnswer + 1,
      correctAnswer - 1
    ].filter(x => x > 0 && x !== correctAnswer);

    const uniqueWrong = ensureUniqueChoices(correctAnswer, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...uniqueWrong, correctAnswer]).map(String);

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

    const wrongAnswerCandidates = [
      correctAnswer + rng.nextInt(1, 10),
      correctAnswer - rng.nextInt(1, Math.max(1, correctAnswer - 1)),
      a + b,
      correctAnswer + 1,
      Math.max(0, correctAnswer - 1)
    ].filter(x => x >= 0 && x !== correctAnswer);

    const uniqueWrong = ensureUniqueChoices(correctAnswer, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...uniqueWrong, correctAnswer]).map(String);

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

    const wrongAnswerCandidates = [
      correctAnswer + a,
      correctAnswer - b,
      a * (b + 1),
      a * (b - 1),
      correctAnswer + 1,
      correctAnswer - 1
    ].filter(x => x > 0 && x !== correctAnswer);

    const uniqueWrong = ensureUniqueChoices(correctAnswer, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...uniqueWrong, correctAnswer]).map(String);

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

    const wrongAnswerCandidates = [
      result + 1,
      result - 1,
      result + rng.nextInt(2, 5),
      divisor,
      result + 2,
      Math.max(1, result - 2)
    ].filter(x => x > 0 && x !== result);

    const uniqueWrong = ensureUniqueChoices(result, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...uniqueWrong, result]).map(String);

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

    const wrongAnswerCandidates = [
      correctAnswer + step,
      correctAnswer - step,
      correctAnswer + rng.nextInt(1, 5),
      sequence[3] * 2,
      correctAnswer + 1,
      correctAnswer - 1
    ].filter(x => x !== correctAnswer);

    const uniqueWrong = ensureUniqueChoices(correctAnswer, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...uniqueWrong, correctAnswer]).map(String);

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

// ==================== MORE ARITHMETIC TEMPLATES ====================

const countingTemplate: QuestionTemplate = {
  templateId: 'arithmetic_counting',
  domain: 'Arithmetic',
  topic: 'Counting',
  gradeBands: ['K-1', '2-3'],
  difficultyTiers: [1, 2, 3],
  prerequisites: [],
  tags: ['arithmetic', 'counting', 'basic'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const maxNum = gradeBand === 'K-1' ? (tier === 1 ? 10 : tier === 2 ? 20 : 50) : (tier === 1 ? 50 : tier === 2 ? 100 : 200);
    const start = rng.nextInt(1, maxNum - 10);
    const countBy = tier === 1 ? 1 : tier === 2 ? rng.choice([1, 2, 5]) : rng.choice([2, 5, 10]);
    const steps = rng.nextInt(3, 7);
    const correctAnswer = start + countBy * steps;

    const wrongAnswerCandidates = [
      correctAnswer + countBy,
      correctAnswer - countBy,
      start + countBy * (steps + 1),
      start + countBy * (steps - 1)
    ].filter(x => x > 0 && x !== correctAnswer);

    const wrongAnswers = ensureUniqueChoices(correctAnswer, wrongAnswerCandidates, 3);
    const choices = rng.shuffle([...wrongAnswers, correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `Считайте от ${start} вперед на ${countBy}: ${start}, ${start + countBy}, ${start + countBy * 2}, ... Какое число будет через ${steps} шагов?`
        : `Count forward from ${start} by ${countBy}: ${start}, ${start + countBy}, ${start + countBy * 2}, ... What number comes after ${steps} steps?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `${start} + (${countBy} × ${steps}) = ${correctAnswer}`
        : `${start} + (${countBy} × ${steps}) = ${correctAnswer}`,
      domain: 'Arithmetic',
      topic: 'Counting',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['arithmetic', 'counting', 'skip-counting']
    };
  }
};

const fractionsTemplate: QuestionTemplate = {
  templateId: 'arithmetic_fractions_basic',
  domain: 'Arithmetic',
  topic: 'Fractions',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Division')],
  tags: ['arithmetic', 'fractions'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const denominators = tier === 1 ? [2, 4] : tier === 2 ? [2, 4, 8] : tier === 3 ? [2, 3, 4, 6] : [2, 3, 4, 5, 6, 8, 10];
    const denominator = rng.choice(denominators);
    const numerator1 = rng.nextInt(1, denominator - 1);
    const numerator2 = rng.nextInt(1, denominator - numerator1);
    const correctAnswer = numerator1 + numerator2;

    const wrongAnswers = [
      correctAnswer + 1,
      correctAnswer - 1,
      numerator1 + numerator2 + denominator,
      Math.abs(numerator1 - numerator2)
    ].filter(x => x > 0 && x < denominator && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(x => `${x}/${denominator}`);

    return {
      language,
      prompt: language === 'ru'
        ? `Чему равно ${numerator1}/${denominator} + ${numerator2}/${denominator}?`
        : `What is ${numerator1}/${denominator} + ${numerator2}/${denominator}?`,
      choices,
      correctAnswer: `${correctAnswer}/${denominator}`,
      explanation: language === 'ru'
        ? `При одинаковых знаменателях складываем числители: ${numerator1} + ${numerator2} = ${correctAnswer}`
        : `With same denominators, add numerators: ${numerator1} + ${numerator2} = ${correctAnswer}`,
      domain: 'Arithmetic',
      topic: 'Fractions',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Division')],
      tags: ['arithmetic', 'fractions', 'addition']
    };
  }
};

const decimalsTemplate: QuestionTemplate = {
  templateId: 'arithmetic_decimals_basic',
  domain: 'Arithmetic',
  topic: 'Decimals',
  gradeBands: ['4-5', '6-7', '8-9'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Fractions')],
  tags: ['arithmetic', 'decimals'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const maxWhole = tier === 1 ? 10 : tier === 2 ? 50 : 100;
    const decimals = tier <= 2 ? 1 : 2;

    const a = rng.nextInt(1, maxWhole) + rng.nextInt(0, 9) / 10 + (decimals === 2 ? rng.nextInt(0, 9) / 100 : 0);
    const b = rng.nextInt(1, maxWhole) + rng.nextInt(0, 9) / 10 + (decimals === 2 ? rng.nextInt(0, 9) / 100 : 0);
    const correctAnswer = Math.round((a + b) * 100) / 100;

    const wrongAnswers = [
      Math.round((correctAnswer + 0.1) * 100) / 100,
      Math.round((correctAnswer - 0.1) * 100) / 100,
      Math.round((a + b + 1) * 100) / 100,
      Math.round((Math.abs(a - b)) * 100) / 100
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(x => x.toFixed(decimals));

    return {
      language,
      prompt: language === 'ru'
        ? `Чему равно ${a.toFixed(decimals)} + ${b.toFixed(decimals)}?`
        : `What is ${a.toFixed(decimals)} + ${b.toFixed(decimals)}?`,
      choices,
      correctAnswer: correctAnswer.toFixed(decimals),
      explanation: language === 'ru'
        ? `${a.toFixed(decimals)} + ${b.toFixed(decimals)} = ${correctAnswer.toFixed(decimals)}`
        : `${a.toFixed(decimals)} + ${b.toFixed(decimals)} = ${correctAnswer.toFixed(decimals)}`,
      domain: 'Arithmetic',
      topic: 'Decimals',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Fractions')],
      tags: ['arithmetic', 'decimals', 'addition']
    };
  }
};

const placeValueTemplate: QuestionTemplate = {
  templateId: 'arithmetic_place_value',
  domain: 'Arithmetic',
  topic: 'Place Value',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],
  tags: ['arithmetic', 'place-value'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const maxDigits = gradeBand === 'K-1' ? 2 : gradeBand === '2-3' ? 3 : 4;
    const targetPlace = tier === 1 ? 'ones' : tier === 2 ? 'tens' : tier === 3 ? 'hundreds' : tier === 4 ? 'thousands' : 'ten-thousands';

    const number = rng.nextInt(10 ** (maxDigits - 1), 10 ** maxDigits - 1);
    const numStr = String(number);

    let correctAnswer: number;
    let placeName: string;

    if (targetPlace === 'ones') {
      correctAnswer = parseInt(numStr[numStr.length - 1]);
      placeName = language === 'ru' ? 'единиц' : 'ones';
    } else if (targetPlace === 'tens') {
      correctAnswer = parseInt(numStr[numStr.length - 2] || '0');
      placeName = language === 'ru' ? 'десятков' : 'tens';
    } else if (targetPlace === 'hundreds') {
      correctAnswer = parseInt(numStr[numStr.length - 3] || '0');
      placeName = language === 'ru' ? 'сотен' : 'hundreds';
    } else {
      correctAnswer = parseInt(numStr[numStr.length - 4] || '0');
      placeName = language === 'ru' ? 'тысяч' : 'thousands';
    }

    const wrongAnswers = [
      correctAnswer + 1,
      correctAnswer + 2,
      correctAnswer - 1,
      parseInt(numStr[numStr.length - (targetPlace === 'tens' ? 1 : 2)] || '0')
    ].filter(x => x >= 0 && x <= 9 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `В числе ${number}, какая цифра в разряде ${placeName}?`
        : `In the number ${number}, what digit is in the ${placeName} place?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `В числе ${number} цифра ${correctAnswer} находится в разряде ${placeName}`
        : `In ${number}, the digit ${correctAnswer} is in the ${placeName} place`,
      domain: 'Arithmetic',
      topic: 'Place Value',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['arithmetic', 'place-value', 'number-sense']
    };
  }
};

// ==================== MORE GEOMETRY TEMPLATES ====================

const shapesTemplate: QuestionTemplate = {
  templateId: 'geometry_shapes_identification',
  domain: 'Geometry',
  topic: 'Shapes',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3],
  prerequisites: [],
  tags: ['geometry', 'shapes'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const easyShapes = [
      { ru: 'круг', en: 'circle', sides: 0 },
      { ru: 'треугольник', en: 'triangle', sides: 3 },
      { ru: 'квадрат', en: 'square', sides: 4 },
      { ru: 'прямоугольник', en: 'rectangle', sides: 4 }
    ];

    const mediumShapes = [
      ...easyShapes,
      { ru: 'пятиугольник', en: 'pentagon', sides: 5 },
      { ru: 'шестиугольник', en: 'hexagon', sides: 6 }
    ];

    const hardShapes = [
      ...mediumShapes,
      { ru: 'восьмиугольник', en: 'octagon', sides: 8 },
      { ru: 'ромб', en: 'rhombus', sides: 4 }
    ];

    const shapeList = tier === 1 ? easyShapes : tier === 2 ? mediumShapes : hardShapes;
    const targetShape = rng.choice(shapeList);

    const wrongShapes = shapeList.filter(s => s !== targetShape);
    const wrongAnswers = rng.shuffle(wrongShapes).slice(0, 3);

    const choices = rng.shuffle([...wrongAnswers.map(s => language === 'ru' ? s.ru : s.en), language === 'ru' ? targetShape.ru : targetShape.en]);

    return {
      language,
      prompt: language === 'ru'
        ? `Фигура имеет ${targetShape.sides} ${targetShape.sides === 1 ? 'сторону' : targetShape.sides <= 4 ? 'стороны' : 'сторон'}${targetShape.sides === 0 ? ' (это круглая фигура)' : ''}. Что это за фигура?`
        : `A shape has ${targetShape.sides} side${targetShape.sides !== 1 ? 's' : ''}${targetShape.sides === 0 ? ' (it is round)' : ''}. What shape is it?`,
      choices,
      correctAnswer: language === 'ru' ? targetShape.ru : targetShape.en,
      explanation: language === 'ru'
        ? `${targetShape.ru} имеет ${targetShape.sides} ${targetShape.sides === 1 ? 'сторону' : targetShape.sides <= 4 ? 'стороны' : 'сторон'}`
        : `A ${targetShape.en} has ${targetShape.sides} side${targetShape.sides !== 1 ? 's' : ''}`,
      domain: 'Geometry',
      topic: 'Shapes',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [],
      tags: ['geometry', 'shapes', 'identification']
    };
  }
};

// ==================== MORE LOGIC TEMPLATES ====================

const sequencesTemplate: QuestionTemplate = {
  templateId: 'logic_sequences_arithmetic',
  domain: 'Logic',
  topic: 'Sequences',
  gradeBands: ['2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],
  tags: ['logic', 'sequences', 'patterns'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    // Geometric or arithmetic sequence
    const isGeometric = tier >= 3 && rng.nextInt(0, 1) === 1;

    if (isGeometric) {
      const start = rng.nextInt(2, 10);
      const ratio = tier === 3 ? 2 : tier === 4 ? rng.choice([2, 3]) : rng.choice([2, 3, 4]);
      const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
      const correctAnswer = start * Math.pow(ratio, 4);

      const wrongAnswers = [
        correctAnswer * ratio,
        correctAnswer / ratio,
        correctAnswer + sequence[3],
        sequence[3] + ratio
      ].filter(x => x !== correctAnswer);

      const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

      return {
        language,
        prompt: language === 'ru'
          ? `Найдите следующее число: ${sequence.join(', ')}, ?`
          : `Find the next number: ${sequence.join(', ')}, ?`,
        choices,
        correctAnswer: String(correctAnswer),
        explanation: language === 'ru'
          ? `Последовательность умножается на ${ratio} каждый раз`
          : `The sequence multiplies by ${ratio} each time`,
        domain: 'Logic',
        topic: 'Sequences',
        gradeBand,
        ageBand: gradeBandToAgeBand(gradeBand),
        difficultyTier: tier,
        globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
        prerequisites: [],
        tags: ['logic', 'sequences', 'geometric']
      };
    } else {
      // Arithmetic sequence (similar to patterns but different progression)
      const start = rng.nextInt(5, 50);
      const step = tier === 1 ? rng.nextInt(2, 10) : tier === 2 ? rng.nextInt(5, 20) : rng.nextInt(10, 50);
      const sequence = [start, start + step, start + 2 * step, start + 3 * step];
      const correctAnswer = start + 4 * step;

      const wrongAnswers = [
        correctAnswer + step,
        correctAnswer - step,
        correctAnswer + 1,
        sequence[3] + 1
      ].filter(x => x !== correctAnswer);

      const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

      return {
        language,
        prompt: language === 'ru'
          ? `Продолжите последовательность: ${sequence.join(', ')}, ?`
          : `Continue the sequence: ${sequence.join(', ')}, ?`,
        choices,
        correctAnswer: String(correctAnswer),
        explanation: language === 'ru'
          ? `Каждое число увеличивается на ${step}`
          : `Each number increases by ${step}`,
        domain: 'Logic',
        topic: 'Sequences',
        gradeBand,
        ageBand: gradeBandToAgeBand(gradeBand),
        difficultyTier: tier,
        globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
        prerequisites: [],
        tags: ['logic', 'sequences', 'arithmetic']
      };
    }
  }
};

const wordProblemsTemplate: QuestionTemplate = {
  templateId: 'logic_word_problems_basic',
  domain: 'Logic',
  topic: 'Word Problems',
  gradeBands: ['K-1', '2-3', '4-5', '6-7'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Addition')],
  tags: ['logic', 'word-problems', 'application'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    const maxNum = tier === 1 ? 20 : tier === 2 ? 50 : tier === 3 ? 100 : tier === 4 ? 200 : 500;

    const scenarios = language === 'ru' ? [
      { thing: 'яблок', action: 'купила', more: 'еще' },
      { thing: 'книг', action: 'прочитал', more: 'еще' },
      { thing: 'конфет', action: 'съел', more: 'потом еще' },
      { thing: 'игрушек', action: 'получил', more: 'и еще' }
    ] : [
      { thing: 'apples', action: 'bought', more: 'then' },
      { thing: 'books', action: 'read', more: 'and then' },
      { thing: 'candies', action: 'ate', more: 'later' },
      { thing: 'toys', action: 'got', more: 'and' }
    ];

    const scenario = rng.choice(scenarios);
    const first = rng.nextInt(5, maxNum / 2);
    const second = rng.nextInt(5, maxNum / 2);
    const correctAnswer = first + second;

    const wrongAnswers = [
      correctAnswer + rng.nextInt(1, 10),
      correctAnswer - rng.nextInt(1, 10),
      Math.abs(first - second),
      first + second + first
    ].filter(x => x > 0 && x !== correctAnswer);

    const choices = rng.shuffle([...wrongAnswers.slice(0, 3), correctAnswer]).map(String);

    return {
      language,
      prompt: language === 'ru'
        ? `Маша ${scenario.action} ${first} ${scenario.thing}, ${scenario.more} ${scenario.action} ${second} ${scenario.thing}. Сколько всего ${scenario.thing} у Маши?`
        : `Masha ${scenario.action} ${first} ${scenario.thing}, ${scenario.more} ${scenario.action} ${second} ${scenario.thing}. How many ${scenario.thing} does Masha have in total?`,
      choices,
      correctAnswer: String(correctAnswer),
      explanation: language === 'ru'
        ? `${first} + ${second} = ${correctAnswer} ${scenario.thing}`
        : `${first} + ${second} = ${correctAnswer} ${scenario.thing}`,
      domain: 'Logic',
      topic: 'Word Problems',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [createSkillId('Arithmetic', 'Addition')],
      tags: ['logic', 'word-problems', 'addition']
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
  patternsTemplate,
  countingTemplate,
  fractionsTemplate,
  decimalsTemplate,
  placeValueTemplate,
  shapesTemplate,
  sequencesTemplate,
  wordProblemsTemplate
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
