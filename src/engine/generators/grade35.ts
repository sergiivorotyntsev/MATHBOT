/**
 * 🎨 Question Generators - Grades 3 to 5
 * Based on CCSS 3.OA, 3.NF, 3.MD, 3.G, 4.OA, 4.NBT, 4.NF, 4.MD, 5.OA, 5.NBT, 5.NF, 5.MD
 */

import { QuestionTemplate, GeneratorParams } from '../types';
import {
  SeededRandom,
  generateQuestionId,
  generateMultipleChoiceOptions,
  createTemplate,
  WORD_PROBLEM_SCENARIOS,
  fillTemplate
} from './baseGenerators';

// ==================== MULTIPLICATION WITHIN 100 (3.OA.C.7) ====================

export const multiplyWithin100Template: QuestionTemplate = createTemplate('multiply-within-100', {
  name: 'Умножение в пределах 100',
  description: 'Multiplication facts 0-10',
  gradeRange: ['3', '5'],
  domains: ['OA'],
  standards: ['3.OA.C.7', '4.OA.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const maxFactor = params.difficulty <= 2 ? 5 : params.difficulty <= 4 ? 10 : 12;
    const a = rng.nextInt(2, maxFactor);
    const b = rng.nextInt(2, maxFactor);
    const answer = a * b;

    const questionId = generateQuestionId('multiply-within-100', { a, b });

    return {
      metadata: {
        questionId,
        templateId: 'multiply-within-100',
        topic: 'Умножение',
        subtopic: 'Таблица умножения',
        gradeRange: ['3', '5'],
        domains: ['OA'],
        standards: ['3.OA.C.7'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['multiplication', 'basic-facts'],
        prerequisites: ['addition', 'counting'],
        tags: ['arithmetic', 'multiplication', 'times-tables']
      },
      content: {
        prompt: `${a} × ${b} = ?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, Math.max(10, answer)),
        correctAnswer: answer,
        explanation: `${a} × ${b} = ${answer}. Это значит ${a} взять ${b} раз: ${Array(Math.min(b, 5)).fill(a).join(' + ')}${b > 5 ? ' + ...' : ''} = ${answer}.`,
        hint: `Попробуй посчитать: ${a} + ${a}${b > 2 ? ` + ${a}` : ''}...`
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 144 // 12*12
});

// ==================== DIVISION WITHIN 100 (3.OA.C.7) ====================

export const divideWithin100Template: QuestionTemplate = createTemplate('divide-within-100', {
  name: 'Деление в пределах 100',
  description: 'Division facts 0-10',
  gradeRange: ['3', '5'],
  domains: ['OA'],
  standards: ['3.OA.C.7', '4.OA.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const maxDivisor = params.difficulty <= 2 ? 5 : params.difficulty <= 4 ? 10 : 12;
    const divisor = rng.nextInt(2, maxDivisor);
    const quotient = rng.nextInt(2, maxDivisor);
    const dividend = divisor * quotient;

    const questionId = generateQuestionId('divide-within-100', { dividend, divisor });

    return {
      metadata: {
        questionId,
        templateId: 'divide-within-100',
        topic: 'Деление',
        subtopic: 'Таблица деления',
        gradeRange: ['3', '5'],
        domains: ['OA'],
        standards: ['3.OA.C.7'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['division', 'basic-facts'],
        prerequisites: ['multiplication', 'subtraction'],
        tags: ['arithmetic', 'division']
      },
      content: {
        prompt: `${dividend} ÷ ${divisor} = ?`,
        choices: generateMultipleChoiceOptions(quotient, rng, 4, Math.max(5, quotient)),
        correctAnswer: quotient,
        explanation: `${dividend} ÷ ${divisor} = ${quotient}. Проверка: ${divisor} × ${quotient} = ${dividend}.`,
        hint: `Сколько раз ${divisor} поместится в ${dividend}?`
      },
      generationParams: { dividend, divisor },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 144
});

// ==================== MULTI-DIGIT MULTIPLICATION (4.NBT.B.5) ====================

export const multiDigitMultiplyTemplate: QuestionTemplate = createTemplate('multi-digit-multiply', {
  name: 'Многозначное умножение',
  description: 'Multi-digit multiplication',
  gradeRange: ['4', '5'],
  domains: ['NBT'],
  standards: ['4.NBT.B.5', '5.NBT.B.5'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    let a: number, b: number;
    if (params.difficulty <= 2) {
      // 2-digit × 1-digit
      a = rng.nextInt(10, 99);
      b = rng.nextInt(2, 9);
    } else if (params.difficulty <= 4) {
      // 2-digit × 2-digit
      a = rng.nextInt(10, 99);
      b = rng.nextInt(10, 99);
    } else {
      // 3-digit × 2-digit
      a = rng.nextInt(100, 999);
      b = rng.nextInt(10, 99);
    }

    const answer = a * b;
    const questionId = generateQuestionId('multi-digit-multiply', { a, b });

    return {
      metadata: {
        questionId,
        templateId: 'multi-digit-multiply',
        topic: 'Умножение',
        subtopic: 'Многозначное умножение',
        gradeRange: ['4', '5'],
        domains: ['NBT'],
        standards: ['4.NBT.B.5'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['multiplication', 'place-value', 'multi-digit'],
        prerequisites: ['multiplication', 'place-value'],
        tags: ['arithmetic', 'multiplication', 'multi-digit']
      },
      content: {
        prompt: `${a} × ${b} = ?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, Math.max(100, Math.floor(answer * 0.2))),
        correctAnswer: answer,
        explanation: `${a} × ${b} = ${answer}`,
        hint: `Разбей на разряды: ${a} × ${b}`
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 5000,
  estimatedCount: 8000 // 90*90 for 2-digit
});

// ==================== MULTI-DIGIT DIVISION (4.NBT.B.6) ====================

export const multiDigitDivideTemplate: QuestionTemplate = createTemplate('multi-digit-divide', {
  name: 'Многозначное деление',
  description: 'Multi-digit division with remainders',
  gradeRange: ['4', '5'],
  domains: ['NBT'],
  standards: ['4.NBT.B.6', '5.NBT.B.6'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const divisor = params.difficulty <= 2 ? rng.nextInt(2, 9) : rng.nextInt(10, 50);
    const quotient = params.difficulty <= 3 ? rng.nextInt(10, 99) : rng.nextInt(10, 999);
    const remainder = params.difficulty >= 4 ? rng.nextInt(0, divisor - 1) : 0;
    const dividend = divisor * quotient + remainder;

    const questionId = generateQuestionId('multi-digit-divide', { dividend, divisor, remainder });

    const hasRemainder = remainder > 0;

    return {
      metadata: {
        questionId,
        templateId: 'multi-digit-divide',
        topic: 'Деление',
        subtopic: hasRemainder ? 'С остатком' : 'Многозначное деление',
        gradeRange: ['4', '5'],
        domains: ['NBT'],
        standards: ['4.NBT.B.6'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['division', 'place-value', 'multi-digit'],
        prerequisites: ['division', 'multiplication', 'place-value'],
        tags: ['arithmetic', 'division', 'multi-digit', hasRemainder ? 'remainder' : 'exact']
      },
      content: {
        prompt: hasRemainder
          ? `${dividend} ÷ ${divisor} = ? (остаток ?)`
          : `${dividend} ÷ ${divisor} = ?`,
        choices: hasRemainder
          ? [`${quotient} ост. ${remainder}`, `${quotient + 1} ост. ${remainder - 1}`, `${quotient - 1} ост. ${remainder + divisor}`, `${quotient} ост. ${remainder + 1}`]
          : generateMultipleChoiceOptions(quotient, rng, 4, Math.max(10, quotient)),
        correctAnswer: hasRemainder ? `${quotient} ост. ${remainder}` : quotient,
        explanation: hasRemainder
          ? `${dividend} ÷ ${divisor} = ${quotient} ост. ${remainder}. Проверка: ${divisor} × ${quotient} + ${remainder} = ${dividend}.`
          : `${dividend} ÷ ${divisor} = ${quotient}. Проверка: ${divisor} × ${quotient} = ${dividend}.`,
        hint: `Сколько раз ${divisor} помещается в ${dividend}?`
      },
      generationParams: { dividend, divisor, remainder },
      generatedAt: Date.now()
    };
  },
  maxVariations: 5000,
  estimatedCount: 5000
});

// ==================== FRACTIONS: UNDERSTANDING (3.NF.A.1) ====================

export const fractionBasicsTemplate: QuestionTemplate = createTemplate('fraction-basics', {
  name: 'Основы дробей',
  description: 'Understanding fractions as parts of a whole',
  gradeRange: ['3', '4'],
  domains: ['NF'],
  standards: ['3.NF.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const denominator = params.difficulty <= 2 ? rng.choice([2, 4]) : rng.choice([3, 4, 6, 8]);
    const numerator = rng.nextInt(1, denominator - 1);

    const questionId = generateQuestionId('fraction-basics', { numerator, denominator });

    const shapes = ['🍕', '🍰', '🟦', '🍫'];
    const shape = rng.choice(shapes);

    const shapeRu = shape === '🍕' ? 'пиццы' : shape === '🍰' ? 'торта' : shape === '🟦' ? 'квадрата' : 'плитки шоколада';

    return {
      metadata: {
        questionId,
        templateId: 'fraction-basics',
        topic: 'Дроби',
        subtopic: 'Понимание дробей',
        gradeRange: ['3', '4'],
        domains: ['NF'],
        standards: ['3.NF.A.1'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'recall',
        skills: ['fractions', 'part-whole'],
        prerequisites: ['division', 'equal-parts'],
        tags: ['fractions', 'visual', 'part-whole']
      },
      content: {
        prompt: `${shape} разделили на ${denominator} равных частей. Взяли ${numerator} ${numerator === 1 ? 'часть' : 'части'}. Какую дробь взяли?`,
        choices: rng.shuffle([
          `${numerator}/${denominator}`,
          `${denominator}/${numerator}`,
          `${numerator + 1}/${denominator}`,
          `${numerator}/${denominator + 1}`
        ]),
        correctAnswer: `${numerator}/${denominator}`,
        explanation: `Из ${denominator} частей взяли ${numerator}. Это дробь ${numerator}/${denominator}.`,
        hint: `Числитель (сверху) — сколько взяли. Знаменатель (снизу) — на сколько частей делили.`
      },
      generationParams: { numerator, denominator },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 30
});

// ==================== FRACTIONS: COMPARING (3.NF.A.3) ====================

export const compareFractionsTemplate: QuestionTemplate = createTemplate('compare-fractions', {
  name: 'Сравнение дробей',
  description: 'Comparing fractions with same denominator or numerator',
  gradeRange: ['3', '4'],
  domains: ['NF'],
  standards: ['3.NF.A.3'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const sameDenominator = params.difficulty <= 3 || rng.next() < 0.5;

    let a_num: number, a_den: number, b_num: number, b_den: number;

    if (sameDenominator) {
      // Same denominator (easier)
      a_den = b_den = rng.choice([2, 3, 4, 5, 6, 8]);
      a_num = rng.nextInt(1, a_den - 1);
      b_num = a_num + rng.nextInt(1, Math.max(1, a_den - a_num - 1));
      if (b_num >= a_den) b_num = Math.max(1, a_num - 1);
    } else {
      // Same numerator (harder)
      a_num = b_num = rng.nextInt(1, 5);
      const denominators = [2, 3, 4, 5, 6, 8];
      const idx1 = Math.floor(rng.next() * denominators.length);
      const idx2 = (idx1 + 1 + Math.floor(rng.next() * (denominators.length - 1))) % denominators.length;
      a_den = denominators[idx1];
      b_den = denominators[idx2];
    }

    const a_value = a_num / a_den;
    const b_value = b_num / b_den;
    const correctAnswer = a_value > b_value ? '>' : a_value < b_value ? '<' : '=';

    const questionId = generateQuestionId('compare-fractions', { a_num, a_den, b_num, b_den });

    return {
      metadata: {
        questionId,
        templateId: 'compare-fractions',
        topic: 'Дроби',
        subtopic: 'Сравнение дробей',
        gradeRange: ['3', '4'],
        domains: ['NF'],
        standards: ['3.NF.A.3'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['fractions', 'comparing', 'number-sense'],
        prerequisites: ['fractions'],
        tags: ['fractions', 'comparing', 'reasoning']
      },
      content: {
        prompt: `${a_num}/${a_den} ___ ${b_num}/${b_den}`,
        choices: ['>', '<', '=', 'Невозможно сравнить'],
        correctAnswer,
        explanation: sameDenominator
          ? `У дробей одинаковый знаменатель (${a_den}), поэтому сравниваем числители: ${a_num} ${correctAnswer} ${b_num}.`
          : `У дробей одинаковый числитель (${a_num}), но разные знаменатели. Чем больше знаменатель, тем меньше каждая часть. ${a_den} ${correctAnswer === '>' ? '<' : '>'} ${b_den}, значит ${a_num}/${a_den} ${correctAnswer} ${b_num}/${b_den}.`,
        hint: sameDenominator
          ? `Если знаменатели равны, сравнивай числители`
          : `Если числители равны, чем больше знаменатель, тем меньше дробь`
      },
      generationParams: { a_num, a_den, b_num, b_den },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 500
});

// ==================== FRACTIONS: ADDITION (4.NF.B.3) ====================

export const addFractionsTemplate: QuestionTemplate = createTemplate('add-fractions', {
  name: 'Сложение дробей',
  description: 'Adding fractions with same denominator',
  gradeRange: ['4', '5'],
  domains: ['NF'],
  standards: ['4.NF.B.3', '5.NF.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const denominator = params.difficulty <= 2 ? rng.choice([2, 4]) : rng.choice([3, 4, 5, 6, 8, 10, 12]);
    const a_num = rng.nextInt(1, denominator - 2);
    const b_num = rng.nextInt(1, denominator - a_num);
    const sum_num = a_num + b_num;

    // Simplify if possible
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(sum_num, denominator);
    const simplified_num = sum_num / divisor;
    const simplified_den = denominator / divisor;

    const needsSimplification = divisor > 1;

    const questionId = generateQuestionId('add-fractions', { a_num, b_num, denominator });

    return {
      metadata: {
        questionId,
        templateId: 'add-fractions',
        topic: 'Дроби',
        subtopic: 'Сложение дробей',
        gradeRange: ['4', '5'],
        domains: ['NF'],
        standards: ['4.NF.B.3'],
        difficulty: needsSimplification ? Math.min(5, params.difficulty + 1) as 1 | 2 | 3 | 4 | 5 : params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['fractions', 'addition', 'simplifying'],
        prerequisites: ['fractions', 'addition'],
        tags: ['fractions', 'addition', needsSimplification ? 'simplifying' : 'same-denominator']
      },
      content: {
        prompt: `${a_num}/${denominator} + ${b_num}/${denominator} = ?`,
        choices: needsSimplification
          ? rng.shuffle([
              `${simplified_num}/${simplified_den}`,
              `${sum_num}/${denominator}`,
              `${sum_num + 1}/${denominator}`,
              `${a_num + b_num}/${denominator * 2}`
            ])
          : rng.shuffle([
              `${sum_num}/${denominator}`,
              `${sum_num + 1}/${denominator}`,
              `${sum_num}/${denominator + 1}`,
              `${sum_num - 1}/${denominator}`
            ]),
        correctAnswer: needsSimplification ? `${simplified_num}/${simplified_den}` : `${sum_num}/${denominator}`,
        explanation: needsSimplification
          ? `${a_num}/${denominator} + ${b_num}/${denominator} = ${sum_num}/${denominator}. Упрощаем: ${sum_num}/${denominator} = ${simplified_num}/${simplified_den}.`
          : `${a_num}/${denominator} + ${b_num}/${denominator} = ${sum_num}/${denominator}. Знаменатели одинаковые, складываем числители.`,
        hint: `Если знаменатели одинаковые, складывай только числители`
      },
      generationParams: { a_num, b_num, denominator },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 500
});

// ==================== FRACTIONS: MULTIPLICATION (5.NF.B.4) ====================

export const multiplyFractionsTemplate: QuestionTemplate = createTemplate('multiply-fractions', {
  name: 'Умножение дробей',
  description: 'Multiplying fractions and mixed numbers',
  gradeRange: ['5', '5'],
  domains: ['NF'],
  standards: ['5.NF.B.4'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    let a_num: number, a_den: number, b_num: number, b_den: number;

    if (params.difficulty <= 2) {
      // Fraction × whole number
      a_num = rng.nextInt(1, 5);
      a_den = rng.choice([2, 3, 4, 5]);
      b_num = rng.nextInt(2, 6);
      b_den = 1;
    } else {
      // Fraction × fraction
      a_num = rng.nextInt(1, 5);
      a_den = rng.choice([2, 3, 4, 5, 6]);
      b_num = rng.nextInt(1, 5);
      b_den = rng.choice([2, 3, 4, 5, 6]);
    }

    const result_num = a_num * b_num;
    const result_den = a_den * b_den;

    // Simplify
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(result_num, result_den);
    const simplified_num = result_num / divisor;
    const simplified_den = result_den / divisor;

    const questionId = generateQuestionId('multiply-fractions', { a_num, a_den, b_num, b_den });

    return {
      metadata: {
        questionId,
        templateId: 'multiply-fractions',
        topic: 'Дроби',
        subtopic: 'Умножение дробей',
        gradeRange: ['5', '5'],
        domains: ['NF'],
        standards: ['5.NF.B.4'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['fractions', 'multiplication'],
        prerequisites: ['fractions', 'multiplication'],
        tags: ['fractions', 'multiplication', 'simplifying']
      },
      content: {
        prompt: b_den === 1
          ? `${a_num}/${a_den} × ${b_num} = ?`
          : `${a_num}/${a_den} × ${b_num}/${b_den} = ?`,
        choices: rng.shuffle([
          simplified_den === 1 ? `${simplified_num}` : `${simplified_num}/${simplified_den}`,
          `${result_num}/${result_den}`,
          `${result_num + 1}/${result_den}`,
          `${a_num * b_num}/${a_den + b_den}`
        ]),
        correctAnswer: simplified_den === 1 ? `${simplified_num}` : `${simplified_num}/${simplified_den}`,
        explanation: b_den === 1
          ? `${a_num}/${a_den} × ${b_num} = ${a_num * b_num}/${a_den} = ${simplified_num}/${simplified_den}.`
          : `${a_num}/${a_den} × ${b_num}/${b_den} = ${result_num}/${result_den} = ${simplified_num}/${simplified_den}. Умножаем числители и знаменатели отдельно.`,
        hint: `Умножай числитель на числитель, знаменатель на знаменатель`
      },
      generationParams: { a_num, a_den, b_num, b_den },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 600
});

// ==================== DECIMALS (4.NF.C.6) ====================

export const decimalNotationTemplate: QuestionTemplate = createTemplate('decimal-notation', {
  name: 'Десятичные дроби',
  description: 'Understanding decimal notation',
  gradeRange: ['4', '5'],
  domains: ['NF'],
  standards: ['4.NF.C.6', '5.NBT.A.3'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const denominator = params.difficulty <= 2 ? 10 : params.difficulty <= 4 ? 100 : 1000;
    const numerator = rng.nextInt(1, denominator - 1);

    const decimal = numerator / denominator;
    const decimalStr = decimal.toFixed(denominator === 10 ? 1 : denominator === 100 ? 2 : 3);

    const questionId = generateQuestionId('decimal-notation', { numerator, denominator });

    const direction = rng.next() < 0.5 ? 'fraction-to-decimal' : 'decimal-to-fraction';

    if (direction === 'fraction-to-decimal') {
      return {
        metadata: {
          questionId,
          templateId: 'decimal-notation',
          topic: 'Десятичные дроби',
          subtopic: 'Перевод дроби в десятичную',
          gradeRange: ['4', '5'],
          domains: ['NF'],
          standards: ['4.NF.C.6'],
          difficulty: params.difficulty,
          cognitiveComplexity: 'application',
          skills: ['decimals', 'fractions', 'place-value'],
          prerequisites: ['fractions', 'place-value'],
          tags: ['decimals', 'fractions', 'conversion']
        },
        content: {
          prompt: `${numerator}/${denominator} = ?`,
          choices: generateMultipleChoiceOptions(parseFloat(decimalStr), rng, 4, 0.1).map(n => {
            const val = typeof n === 'string' ? parseFloat(n) : n;
            return val.toFixed(denominator === 10 ? 1 : denominator === 100 ? 2 : 3);
          }),
          correctAnswer: decimalStr,
          explanation: `${numerator}/${denominator} = ${decimalStr}`,
          hint: `${denominator === 10 ? 'Десятые' : denominator === 100 ? 'Сотые' : 'Тысячные'} доли записываются после запятой`
        },
        generationParams: { numerator, denominator, direction },
        generatedAt: Date.now()
      };
    } else {
      return {
        metadata: {
          questionId,
          templateId: 'decimal-notation',
          topic: 'Десятичные дроби',
          subtopic: 'Перевод десятичной в дробь',
          gradeRange: ['4', '5'],
          domains: ['NF'],
          standards: ['4.NF.C.6'],
          difficulty: params.difficulty,
          cognitiveComplexity: 'application',
          skills: ['decimals', 'fractions', 'place-value'],
          prerequisites: ['fractions', 'place-value'],
          tags: ['decimals', 'fractions', 'conversion']
        },
        content: {
          prompt: `${decimalStr} = ?`,
          choices: rng.shuffle([
            `${numerator}/${denominator}`,
            `${numerator * 10}/${denominator}`,
            `${numerator}/${denominator / 10}`,
            `${numerator + 1}/${denominator}`
          ]),
          correctAnswer: `${numerator}/${denominator}`,
          explanation: `${decimalStr} = ${numerator}/${denominator}`,
          hint: `Посчитай, сколько знаков после запятой`
        },
        generationParams: { numerator, denominator, direction },
        generatedAt: Date.now()
      };
    }
  },
  maxVariations: 2000,
  estimatedCount: 1000
});

// ==================== AREA AND PERIMETER (3.MD.C.7, 3.MD.D.8) ====================

export const areaPerimeterTemplate: QuestionTemplate = createTemplate('area-perimeter', {
  name: 'Площадь и периметр',
  description: 'Calculate area and perimeter of rectangles',
  gradeRange: ['3', '5'],
  domains: ['MD'],
  standards: ['3.MD.C.7', '3.MD.D.8', '4.MD.A.3'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const maxDimension = params.difficulty <= 2 ? 10 : params.difficulty <= 4 ? 20 : 50;
    const length = rng.nextInt(2, maxDimension);
    const width = rng.nextInt(2, Math.min(length, maxDimension));

    const questionType = rng.choice(['area', 'perimeter']);

    const area = length * width;
    const perimeter = 2 * (length + width);
    const answer = questionType === 'area' ? area : perimeter;

    const questionId = generateQuestionId('area-perimeter', { length, width, questionType });

    return {
      metadata: {
        questionId,
        templateId: 'area-perimeter',
        topic: 'Измерения',
        subtopic: questionType === 'area' ? 'Площадь' : 'Периметр',
        gradeRange: ['3', '5'],
        domains: ['MD'],
        standards: ['3.MD.C.7', '3.MD.D.8'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['area', 'perimeter', 'measurement', 'multiplication'],
        prerequisites: ['multiplication', 'addition'],
        tags: ['geometry', questionType, 'measurement']
      },
      content: {
        prompt: questionType === 'area'
          ? `Прямоугольник имеет длину ${length} см и ширину ${width} см. Какова его площадь?`
          : `Прямоугольник имеет длину ${length} см и ширину ${width} см. Каков его периметр?`,
        choices: generateMultipleChoiceOptions(answer, rng, 4, Math.max(10, answer)),
        correctAnswer: answer,
        explanation: questionType === 'area'
          ? `Площадь = длина × ширина = ${length} × ${width} = ${area} см²`
          : `Периметр = 2 × (длина + ширина) = 2 × (${length} + ${width}) = 2 × ${length + width} = ${perimeter} см`,
        hint: questionType === 'area'
          ? `Площадь прямоугольника = длина × ширина`
          : `Периметр = сумма всех сторон = 2 × (длина + ширина)`
      },
      generationParams: { length, width, questionType },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 1000
});

// ==================== VOLUME (5.MD.C.3) ====================

export const volumeTemplate: QuestionTemplate = createTemplate('volume', {
  name: 'Объём',
  description: 'Calculate volume of rectangular prisms',
  gradeRange: ['5', '5'],
  domains: ['MD'],
  standards: ['5.MD.C.3', '5.MD.C.4', '5.MD.C.5'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const maxDimension = params.difficulty <= 2 ? 6 : params.difficulty <= 4 ? 10 : 15;
    const length = rng.nextInt(2, maxDimension);
    const width = rng.nextInt(2, maxDimension);
    const height = rng.nextInt(2, maxDimension);

    const volume = length * width * height;

    const questionId = generateQuestionId('volume', { length, width, height });

    return {
      metadata: {
        questionId,
        templateId: 'volume',
        topic: 'Объём',
        subtopic: 'Объём прямоугольного параллелепипеда',
        gradeRange: ['5', '5'],
        domains: ['MD'],
        standards: ['5.MD.C.3'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['volume', 'measurement', 'multiplication', '3d-shapes'],
        prerequisites: ['multiplication', 'area'],
        tags: ['geometry', 'volume', 'measurement', '3d']
      },
      content: {
        prompt: `Коробка имеет длину ${length} см, ширину ${width} см и высоту ${height} см. Каков её объём?`,
        choices: generateMultipleChoiceOptions(volume, rng, 4, Math.max(20, volume)),
        correctAnswer: volume,
        explanation: `Объём = длина × ширина × высота = ${length} × ${width} × ${height} = ${volume} см³`,
        hint: `Объём прямоугольного параллелепипеда = длина × ширина × высота`
      },
      generationParams: { length, width, height },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 1000
});

// ==================== WORD PROBLEMS: MULTIPLICATION (3.OA.A.3) ====================

export const wordProblemMultiplyTemplate: QuestionTemplate = createTemplate('word-problem-multiply', {
  name: 'Текстовая задача на умножение',
  description: 'Word problems for multiplication',
  gradeRange: ['3', '5'],
  domains: ['OA'],
  standards: ['3.OA.A.3', '4.OA.A.2'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 2 ? 10 : params.difficulty <= 4 ? 20 : 50;
    const a = rng.nextInt(2, 12);
    const b = rng.nextInt(2, Math.min(max, 20));
    const answer = a * b;

    const scenarioKey = rng.choice(Object.keys(WORD_PROBLEM_SCENARIOS.multiply));
    const scenarioTemplate = WORD_PROBLEM_SCENARIOS.multiply[scenarioKey as keyof typeof WORD_PROBLEM_SCENARIOS.multiply];

    const prompt = fillTemplate(scenarioTemplate, { a, b });

    const questionId = generateQuestionId('word-problem-multiply', { a, b, scenarioKey });

    return {
      metadata: {
        questionId,
        templateId: 'word-problem-multiply',
        topic: 'Текстовые задачи на умножение',
        gradeRange: ['3', '5'],
        domains: ['OA'],
        standards: ['3.OA.A.3'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['multiplication', 'word-problems', 'reading-comprehension'],
        prerequisites: ['multiplication'],
        tags: ['word-problem', 'multiplication', 'story']
      },
      content: {
        prompt,
        choices: generateMultipleChoiceOptions(answer, rng, 4, Math.max(10, answer)),
        correctAnswer: answer,
        explanation: `Умножаем: ${a} × ${b} = ${answer}.`,
        hint: `Это задача на умножение. Умножь ${a} × ${b}.`
      },
      generationParams: { a, b, scenarioKey },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 1500
});

// ==================== MULTI-STEP WORD PROBLEMS (4.OA.A.3) ====================

export const multiStepWordProblemTemplate: QuestionTemplate = createTemplate('multi-step-word-problem', {
  name: 'Многошаговые задачи',
  description: 'Multi-step word problems',
  gradeRange: ['4', '5'],
  domains: ['OA'],
  standards: ['4.OA.A.3', '5.OA.A.2'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const problemType = rng.choice(['add-multiply', 'subtract-multiply', 'multiply-divide']);

    let prompt: string, answer: number, explanation: string;

    if (problemType === 'add-multiply') {
      const bags = rng.nextInt(3, 8);
      const applesPerBag = rng.nextInt(4, 12);
      const extraApples = rng.nextInt(2, 10);
      answer = bags * applesPerBag + extraApples;
      prompt = `У Саши ${bags} пакетов яблок, в каждом по ${applesPerBag} яблок. Ещё у него есть ${extraApples} яблок отдельно. Сколько всего яблок у Саши?`;
      explanation = `Сначала находим яблоки в пакетах: ${bags} × ${applesPerBag} = ${bags * applesPerBag}. Потом прибавляем отдельные: ${bags * applesPerBag} + ${extraApples} = ${answer}.`;
    } else if (problemType === 'subtract-multiply') {
      const initial = rng.nextInt(30, 100);
      const groups = rng.nextInt(2, 6);
      const perGroup = rng.nextInt(3, Math.floor(initial / groups / 2));
      const given = groups * perGroup;
      answer = initial - given;
      prompt = `У Миши было ${initial} конфет. Он раздал ${groups} друзьям по ${perGroup} конфет каждому. Сколько конфет осталось у Миши?`;
      explanation = `Сначала находим, сколько раздал: ${groups} × ${perGroup} = ${given}. Потом вычитаем: ${initial} - ${given} = ${answer}.`;
    } else {
      // multiply-divide
      const total = rng.nextInt(20, 100);
      const boxes = rng.nextInt(2, 6);
      const itemsPerBox = total;
      const friends = rng.nextInt(2, 5);
      answer = Math.floor(total / friends);
      prompt = `В магазин привезли ${total} игрушек. Их нужно разложить поровну в ${friends} коробки. Сколько игрушек будет в каждой коробке?`;
      explanation = `Делим общее количество на число коробок: ${total} ÷ ${friends} = ${answer}.`;
    }

    const questionId = generateQuestionId('multi-step-word-problem', { problemType, answer });

    return {
      metadata: {
        questionId,
        templateId: 'multi-step-word-problem',
        topic: 'Многошаговые задачи',
        gradeRange: ['4', '5'],
        domains: ['OA'],
        standards: ['4.OA.A.3'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['multi-step', 'word-problems', 'mixed-operations'],
        prerequisites: ['addition', 'subtraction', 'multiplication', 'division'],
        tags: ['word-problem', 'multi-step', 'reasoning']
      },
      content: {
        prompt,
        choices: generateMultipleChoiceOptions(answer, rng, 4, Math.max(10, answer)),
        correctAnswer: answer,
        explanation,
        hint: `Реши по шагам. Сначала одно действие, потом другое.`
      },
      generationParams: { problemType, answer },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 1000
});

// ==================== EXPORT ALL ====================

export const GRADE_35_TEMPLATES: QuestionTemplate[] = [
  multiplyWithin100Template,
  divideWithin100Template,
  multiDigitMultiplyTemplate,
  multiDigitDivideTemplate,
  fractionBasicsTemplate,
  compareFractionsTemplate,
  addFractionsTemplate,
  multiplyFractionsTemplate,
  decimalNotationTemplate,
  areaPerimeterTemplate,
  volumeTemplate,
  wordProblemMultiplyTemplate,
  multiStepWordProblemTemplate
];

console.log(`🎨 Grade 3-5 generators loaded (${GRADE_35_TEMPLATES.length} templates)`);
