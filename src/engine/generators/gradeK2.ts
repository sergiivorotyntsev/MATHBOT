/**
 * 🎨 Question Generators - Kindergarten to Grade 2
 * Based on CCSS K.OA, 1.OA, 2.OA, K.NBT, 1.NBT, 2.NBT, K.G, 1.G, 2.G
 */

import { QuestionTemplate, GeneratorParams } from '../types';
import {
  SeededRandom,
  generateQuestionId,
  generateMultipleChoiceOptions,
  createTemplate,
  WORD_PROBLEM_SCENARIOS,
  fillTemplate,
  NUMBER_NAMES_RU,
  SHAPES,
  generatePattern
} from './baseGenerators';

// ==================== COUNTING (K.CC, 1.NBT) ====================

export const countToTenTemplate: QuestionTemplate = createTemplate('count-to-10', {
  name: 'Счёт до 10',
  description: 'Подсчёт объектов от 1 до 10',
  gradeRange: ['K', '1'],
  domains: ['OA'],
  standards: ['K.CC.A.1', 'K.CC.B.5'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);
    const count = rng.nextInt(1, 10);

    const objects = rng.choice(['🍎', '⭐', '🐶', '🚗', '🎈', '🎁', '🌼', '🐱', '🦋']);
    const objectsStr = objects.repeat(count);

    const questionId = generateQuestionId('count-to-10', { count, objects });

    return {
      metadata: {
        questionId,
        templateId: 'count-to-10',
        topic: 'Счёт до 10',
        gradeRange: ['K', '1'],
        domains: ['OA'],
        standards: ['K.CC.A.1'],
        difficulty: Math.min(5, Math.ceil(count / 2)) as 1 | 2 | 3 | 4 | 5,
        cognitiveComplexity: 'recall',
        skills: ['counting', 'number-recognition'],
        prerequisites: [],
        tags: ['visual', 'counting']
      },
      content: {
        prompt: `Сколько здесь ${objects === '🍎' ? 'яблок' : objects === '⭐' ? 'звёзд' : 'предметов'}?\n\n${objectsStr}`,
        choices: generateMultipleChoiceOptions(count, rng, 4, 3),
        correctAnswer: count,
        explanation: `Всего ${count} ${objects}. Можно посчитать: 1, 2, 3... ${count}.`,
        hint: `Посчитай по одному: ${objectsStr.split('').slice(0, 3).join(', ')}...`
      },
      generationParams: { count, objects },
      generatedAt: Date.now()
    };
  },
  maxVariations: 100,
  estimatedCount: 100
});

// ==================== ADDITION WITHIN 10 (K.OA.A.1, 1.OA.C.6) ====================

export const addWithin10Template: QuestionTemplate = createTemplate('add-within-10', {
  name: 'Сложение в пределах 10',
  description: 'Сложение чисел до 10',
  gradeRange: ['K', '2'],
  domains: ['OA'],
  standards: ['K.OA.A.1', '1.OA.C.6'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 2 ? 5 : 10;
    const a = rng.nextInt(1, max);
    const b = rng.nextInt(1, Math.min(max, 10 - a));
    const answer = a + b;

    const questionId = generateQuestionId('add-within-10', { a, b });

    return {
      metadata: {
        questionId,
        templateId: 'add-within-10',
        topic: 'Сложение в пределах 10',
        gradeRange: ['K', '2'],
        domains: ['OA'],
        standards: ['K.OA.A.1', '1.OA.C.6'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['addition', 'basic-facts'],
        prerequisites: ['counting'],
        tags: ['arithmetic', 'addition']
      },
      content: {
        prompt: `${a} + ${b} = ?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, 4),
        correctAnswer: answer,
        explanation: `${a} + ${b} = ${answer}. Можно посчитать: ${a}, ${Array.from({length: b}, (_, i) => a + i + 1).join(', ')}.`,
        hint: `Начни с ${a} и прибавь ${b}`
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 45 // 10*10 combinations / 2
});

// ==================== ADDITION WITHIN 20 (1.OA.C.6, 2.OA.B.2) ====================

export const addWithin20Template: QuestionTemplate = createTemplate('add-within-20', {
  name: 'Сложение в пределах 20',
  description: 'Сложение с переходом через десяток',
  gradeRange: ['1', '2'],
  domains: ['OA'],
  standards: ['1.OA.C.6', '2.OA.B.2'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 3 ? 15 : 20;
    const a = rng.nextInt(1, max);
    const b = rng.nextInt(1, Math.min(10, 20 - a));
    const answer = a + b;

    const questionId = generateQuestionId('add-within-20', { a, b });

    return {
      metadata: {
        questionId,
        templateId: 'add-within-20',
        topic: 'Сложение в пределах 20',
        subtopic: answer > 10 ? 'С переходом через 10' : 'Без перехода',
        gradeRange: ['1', '2'],
        domains: ['OA'],
        standards: ['1.OA.C.6'],
        difficulty: answer > 10 ? Math.min(5, params.difficulty + 1) as 1 | 2 | 3 | 4 | 5 : params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['addition', 'place-value'],
        prerequisites: ['addition', 'counting'],
        tags: ['arithmetic', 'addition', answer > 10 ? 'regrouping' : 'no-regrouping']
      },
      content: {
        prompt: `${a} + ${b} = ?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, 5),
        correctAnswer: answer,
        explanation: answer > 10
          ? `${a} + ${b} = ${answer}. Можно разбить: ${a} + ${10 - a} = 10, потом 10 + ${b - (10 - a)} = ${answer}.`
          : `${a} + ${b} = ${answer}.`,
        hint: answer > 10 ? `Попробуй сначала дойти до 10` : `Просто сложи ${a} и ${b}`
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 190 // ~20*20 / 2
});

// ==================== SUBTRACTION WITHIN 10 (K.OA.A.2, 1.OA.C.6) ====================

export const subtractWithin10Template: QuestionTemplate = createTemplate('subtract-within-10', {
  name: 'Вычитание в пределах 10',
  description: 'Вычитание чисел до 10',
  gradeRange: ['K', '2'],
  domains: ['OA'],
  standards: ['K.OA.A.2', '1.OA.C.6'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 2 ? 5 : 10;
    const a = rng.nextInt(2, max);
    const b = rng.nextInt(1, a);
    const answer = a - b;

    const questionId = generateQuestionId('subtract-within-10', { a, b });

    return {
      metadata: {
        questionId,
        templateId: 'subtract-within-10',
        topic: 'Вычитание в пределах 10',
        gradeRange: ['K', '2'],
        domains: ['OA'],
        standards: ['K.OA.A.2'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['subtraction', 'basic-facts'],
        prerequisites: ['counting', 'addition'],
        tags: ['arithmetic', 'subtraction']
      },
      content: {
        prompt: `${a} - ${b} = ?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, 4),
        correctAnswer: answer,
        explanation: `${a} - ${b} = ${answer}. Убери ${b} из ${a}.`,
        hint: `От ${a} отними ${b}`
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 45
});

// ==================== WORD PROBLEMS - ADD/SUBTRACT (1.OA.A.1) ====================

export const wordProblemAddTemplate: QuestionTemplate = createTemplate('word-problem-add', {
  name: 'Текстовая задача на сложение',
  description: 'Word problems for addition within 20',
  gradeRange: ['1', '2'],
  domains: ['OA'],
  standards: ['1.OA.A.1', '2.OA.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 3 ? 10 : 20;
    const a = rng.nextInt(1, max);
    const b = rng.nextInt(1, Math.min(10, max - a));
    const answer = a + b;

    const scenarioKey = rng.choice(Object.keys(WORD_PROBLEM_SCENARIOS.add));
    const scenarioTemplate = WORD_PROBLEM_SCENARIOS.add[scenarioKey as keyof typeof WORD_PROBLEM_SCENARIOS.add];

    const prompt = fillTemplate(scenarioTemplate, { a, b });

    const questionId = generateQuestionId('word-problem-add', { a, b, scenarioKey });

    return {
      metadata: {
        questionId,
        templateId: 'word-problem-add',
        topic: 'Текстовые задачи на сложение',
        gradeRange: ['1', '2'],
        domains: ['OA'],
        standards: ['1.OA.A.1'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['addition', 'word-problems', 'reading-comprehension'],
        prerequisites: ['addition', 'counting'],
        tags: ['word-problem', 'addition', 'story']
      },
      content: {
        prompt,
        choices: generateMultipleChoiceOptions(answer, rng, 4, 5),
        correctAnswer: answer,
        explanation: `Было ${a}, добавили ${b}. Всего: ${a} + ${b} = ${answer}.`,
        hint: `Это задача на сложение. Складываем ${a} + ${b}.`
      },
      generationParams: { a, b, scenarioKey },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 1000
});

// ==================== PATTERNS (K.G, 1.OA) ====================

export const patternABTemplate: QuestionTemplate = createTemplate('pattern-ab', {
  name: 'Паттерн AB',
  description: 'Simple AB pattern recognition',
  gradeRange: ['K', '1'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const elements = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
    const pattern = generatePattern(rng, 'AB', elements);

    const questionId = generateQuestionId('pattern-ab', { pattern: pattern.join('') });

    return {
      metadata: {
        questionId,
        templateId: 'pattern-ab',
        topic: 'Паттерны',
        subtopic: 'AB паттерн',
        gradeRange: ['K', '1'],
        domains: ['OA'],
        standards: [],
        difficulty: 1,
        cognitiveComplexity: 'reasoning',
        skills: ['patterns', 'logic'],
        prerequisites: [],
        tags: ['pattern', 'visual', 'sequence']
      },
      content: {
        prompt: `Какой элемент идёт дальше?\n\n${pattern.join(' ')} ...`,
        choices: rng.shuffle([pattern[0], pattern[1], rng.choice(elements), rng.choice(elements)]),
        correctAnswer: pattern[0],
        explanation: `Паттерн: ${pattern[0]} ${pattern[1]}, повторяется. Дальше идёт ${pattern[0]}.`,
        hint: `Посмотри на повторение: ${pattern[0]} ${pattern[1]}, ${pattern[0]} ${pattern[1]}...`
      },
      generationParams: { pattern: pattern.join('') },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 100
});

// ==================== SHAPES (K.G.A.2) ====================

export const shapeRecognitionTemplate: QuestionTemplate = createTemplate('shape-recognition', {
  name: 'Распознавание фигур',
  description: 'Identify basic shapes',
  gradeRange: ['K', '1'],
  domains: ['G'],
  standards: ['K.G.A.2'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const shapeKeys = Object.keys(SHAPES);
    const correctShapeKey = rng.choice(shapeKeys);
    const correctShape = SHAPES[correctShapeKey as keyof typeof SHAPES];

    const questionId = generateQuestionId('shape-recognition', { shape: correctShapeKey });

    return {
      metadata: {
        questionId,
        templateId: 'shape-recognition',
        topic: 'Геометрия',
        subtopic: 'Распознавание фигур',
        gradeRange: ['K', '1'],
        domains: ['G'],
        standards: ['K.G.A.2'],
        difficulty: 1,
        cognitiveComplexity: 'recall',
        skills: ['geometry', 'shapes'],
        prerequisites: [],
        tags: ['geometry', 'shapes', 'visual']
      },
      content: {
        prompt: `Сколько сторон у фигуры "${correctShape.ru}"?`,
        choices: rng.shuffle(['0', '3', '4', '5', '6']).slice(0, 4),
        correctAnswer: correctShape.sides,
        explanation: `У фигуры ${correctShape.ru} ${correctShape.sides} ${correctShape.sides === 0 ? '' : 'сторон(ы)'}.`,
        hint: correctShape.sides === 0 ? `${correctShape.ru} - это круглая фигура` : `Посчитай стороны ${correctShape.ru}`
      },
      generationParams: { shape: correctShapeKey },
      generatedAt: Date.now()
    };
  },
  maxVariations: 100,
  estimatedCount: 6
});

// ==================== EXPORT ALL ====================

export const GRADE_K2_TEMPLATES: QuestionTemplate[] = [
  countToTenTemplate,
  addWithin10Template,
  addWithin20Template,
  subtractWithin10Template,
  wordProblemAddTemplate,
  patternABTemplate,
  shapeRecognitionTemplate
];

console.log(`🎨 Grade K-2 generators loaded (${GRADE_K2_TEMPLATES.length} templates)`);
