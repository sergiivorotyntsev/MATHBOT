/**
 * 🧩 Logic & Pattern Generators - All Grades
 * Visual patterns, sequences, logic puzzles, comparisons
 */

import { QuestionTemplate, GeneratorParams } from '../types';
import {
  SeededRandom,
  generateQuestionId,
  createTemplate,
  generatePattern
} from './baseGenerators';

// ==================== PATTERN AAB (K-2) ====================

export const patternAABTemplate: QuestionTemplate = createTemplate('pattern-aab', {
  name: 'Паттерн AAB',
  description: 'AAB pattern recognition',
  gradeRange: ['K', '2'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const elements = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '🌙', '☀️'];
    const pattern = generatePattern(rng, 'AAB', elements);

    const questionId = generateQuestionId('pattern-aab', { pattern: pattern.join('') });

    // Pattern is [A, A, B], repeating, next should be A
    const nextElement = pattern[0];

    return {
      metadata: {
        questionId,
        templateId: 'pattern-aab',
        topic: 'Паттерны',
        subtopic: 'AAB паттерн',
        gradeRange: ['K', '2'],
        domains: ['OA'],
        standards: [],
        difficulty: 2,
        cognitiveComplexity: 'reasoning',
        skills: ['patterns', 'logic', 'sequencing'],
        prerequisites: [],
        tags: ['pattern', 'visual', 'sequence']
      },
      content: {
        prompt: `Какой элемент идёт дальше?\\n\\n${pattern[0]} ${pattern[0]} ${pattern[1]} ${pattern[0]} ${pattern[0]} ${pattern[1]} ...`,
        choices: rng.shuffle([pattern[0], pattern[1], rng.choice(elements), rng.choice(elements)]),
        correctAnswer: pattern[0],
        explanation: `Паттерн: ${pattern[0]} ${pattern[0]} ${pattern[1]}, повторяется. Дальше идёт ${pattern[0]}.`,
        hint: `Посмотри на группы: ${pattern[0]}${pattern[0]}${pattern[1]}, ${pattern[0]}${pattern[0]}${pattern[1]}...`
      },
      generationParams: { pattern: pattern.join('') },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 200
});

// ==================== PATTERN ABB (K-2) ====================

export const patternABBTemplate: QuestionTemplate = createTemplate('pattern-abb', {
  name: 'Паттерн ABB',
  description: 'ABB pattern recognition',
  gradeRange: ['K', '2'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const elements = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '🌙', '☀️'];
    const pattern = generatePattern(rng, 'ABB', elements);

    const questionId = generateQuestionId('pattern-abb', { pattern: pattern.join('') });

    const nextElement = pattern[0];

    return {
      metadata: {
        questionId,
        templateId: 'pattern-abb',
        topic: 'Паттерны',
        subtopic: 'ABB паттерн',
        gradeRange: ['K', '2'],
        domains: ['OA'],
        standards: [],
        difficulty: 2,
        cognitiveComplexity: 'reasoning',
        skills: ['patterns', 'logic', 'sequencing'],
        prerequisites: [],
        tags: ['pattern', 'visual', 'sequence']
      },
      content: {
        prompt: `Какой элемент идёт дальше?\\n\\n${pattern[0]} ${pattern[1]} ${pattern[1]} ${pattern[0]} ${pattern[1]} ${pattern[1]} ...`,
        choices: rng.shuffle([pattern[0], pattern[1], rng.choice(elements), rng.choice(elements)]),
        correctAnswer: pattern[0],
        explanation: `Паттерн: ${pattern[0]} ${pattern[1]} ${pattern[1]}, повторяется. Дальше идёт ${pattern[0]}.`,
        hint: `Посмотри на группы: ${pattern[0]}${pattern[1]}${pattern[1]}, ${pattern[0]}${pattern[1]}${pattern[1]}...`
      },
      generationParams: { pattern: pattern.join('') },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 200
});

// ==================== PATTERN ABC (1-3) ====================

export const patternABCTemplate: QuestionTemplate = createTemplate('pattern-abc', {
  name: 'Паттерн ABC',
  description: 'ABC pattern recognition',
  gradeRange: ['1', '3'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const elements = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '🌙', '☀️'];
    const pattern = generatePattern(rng, 'ABC', elements);

    const questionId = generateQuestionId('pattern-abc', { pattern: pattern.join('') });

    const nextElement = pattern[0];

    return {
      metadata: {
        questionId,
        templateId: 'pattern-abc',
        topic: 'Паттерны',
        subtopic: 'ABC паттерн',
        gradeRange: ['1', '3'],
        domains: ['OA'],
        standards: [],
        difficulty: 3,
        cognitiveComplexity: 'reasoning',
        skills: ['patterns', 'logic', 'sequencing'],
        prerequisites: [],
        tags: ['pattern', 'visual', 'sequence']
      },
      content: {
        prompt: `Какой элемент идёт дальше?\\n\\n${pattern[0]} ${pattern[1]} ${pattern[2]} ${pattern[0]} ${pattern[1]} ${pattern[2]} ...`,
        choices: rng.shuffle([pattern[0], pattern[1], pattern[2], rng.choice(elements)]),
        correctAnswer: pattern[0],
        explanation: `Паттерн: ${pattern[0]} ${pattern[1]} ${pattern[2]}, повторяется. Дальше идёт ${pattern[0]}.`,
        hint: `Посмотри на группы по три: ${pattern[0]}${pattern[1]}${pattern[2]}, ${pattern[0]}${pattern[1]}${pattern[2]}...`
      },
      generationParams: { pattern: pattern.join('') },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 300
});

// ==================== NUMBER SEQUENCE +N (1-4) ====================

export const numberSequencePlusNTemplate: QuestionTemplate = createTemplate('number-sequence-plus-n', {
  name: 'Числовая последовательность +N',
  description: 'Number sequences with constant addition',
  gradeRange: ['1', '4'],
  domains: ['OA'],
  standards: ['4.OA.C.5'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const increment = params.difficulty <= 2 ? rng.choice([1, 2, 5]) : rng.choice([2, 3, 4, 5, 10]);
    const start = rng.nextInt(1, 50);
    const sequence = [start, start + increment, start + 2 * increment, start + 3 * increment];
    const answer = start + 4 * increment;

    const questionId = generateQuestionId('number-sequence-plus-n', { start, increment });

    return {
      metadata: {
        questionId,
        templateId: 'number-sequence-plus-n',
        topic: 'Последовательности',
        subtopic: 'Арифметическая прогрессия',
        gradeRange: ['1', '4'],
        domains: ['OA'],
        standards: ['4.OA.C.5'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['sequences', 'patterns', 'addition'],
        prerequisites: ['addition', 'counting'],
        tags: ['pattern', 'sequence', 'arithmetic']
      },
      content: {
        prompt: `Какое число идёт дальше?\\n\\n${sequence.join(', ')}, ...`,
        choices: rng.shuffle([
          answer,
          answer + increment,
          answer - increment,
          answer + rng.nextInt(1, 10)
        ]).map(n => String(n)),
        correctAnswer: answer,
        explanation: `Каждое число увеличивается на ${increment}. ${sequence[3]} + ${increment} = ${answer}.`,
        hint: `Найди разницу между соседними числами`
      },
      generationParams: { start, increment },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 500
});

// ==================== NUMBER SEQUENCE ALTERNATING (2-4) ====================

export const numberSequenceAlternatingTemplate: QuestionTemplate = createTemplate('number-sequence-alternating', {
  name: 'Чередующаяся последовательность',
  description: 'Alternating number sequences (+a, -b)',
  gradeRange: ['2', '4'],
  domains: ['OA'],
  standards: ['4.OA.C.5'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const add = params.difficulty <= 2 ? rng.choice([2, 5]) : rng.choice([3, 5, 10]);
    const subtract = params.difficulty <= 2 ? rng.choice([1, 2]) : rng.choice([2, 3, 5]);
    const start = rng.nextInt(10, 30);

    const sequence = [
      start,
      start + add,
      start + add - subtract,
      start + add - subtract + add
    ];
    const answer = sequence[3] - subtract;

    const questionId = generateQuestionId('number-sequence-alternating', { start, add, subtract });

    return {
      metadata: {
        questionId,
        templateId: 'number-sequence-alternating',
        topic: 'Последовательности',
        subtopic: 'Чередование',
        gradeRange: ['2', '4'],
        domains: ['OA'],
        standards: ['4.OA.C.5'],
        difficulty: Math.min(5, params.difficulty + 1) as 1 | 2 | 3 | 4 | 5,
        cognitiveComplexity: 'reasoning',
        skills: ['sequences', 'patterns', 'addition', 'subtraction'],
        prerequisites: ['addition', 'subtraction'],
        tags: ['pattern', 'sequence', 'alternating']
      },
      content: {
        prompt: `Какое число идёт дальше?\\n\\n${sequence.join(', ')}, ...`,
        choices: rng.shuffle([
          answer,
          answer + add,
          answer + subtract,
          sequence[3] + add
        ]).map(n => String(n)),
        correctAnswer: answer,
        explanation: `Паттерн: +${add}, затем -${subtract}, затем опять +${add}, -${subtract}... Дальше идёт -${subtract}: ${sequence[3]} - ${subtract} = ${answer}.`,
        hint: `Попробуй найти, что меняется: то прибавляется, то вычитается`
      },
      generationParams: { start, add, subtract },
      generatedAt: Date.now()
    };
  },
  maxVariations: 1000,
  estimatedCount: 400
});

// ==================== ODD ONE OUT (2-5) ====================

export const oddOneOutTemplate: QuestionTemplate = createTemplate('odd-one-out', {
  name: 'Найди лишнее',
  description: 'Find the odd one out',
  gradeRange: ['2', '5'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const categories = [
      { name: 'even-odd', ru: 'чётность', items: [[2, 4, 6, 8], [3]], description: 'нечётное среди чётных' },
      { name: 'multiples', ru: 'кратные', items: [[10, 20, 30, 40], [15]], description: 'не кратно 10' },
      { name: 'magnitude', ru: 'величина', items: [[100, 200, 300], [5]], description: 'намного меньше остальных' },
      { name: 'divisibility', ru: 'делимость', items: [[6, 12, 18, 24], [7]], description: 'не делится на 6' }
    ];

    const category = rng.choice(categories);
    const mainGroup = rng.sample(category.items[0], 3);
    const oddOne = rng.choice(category.items[1]);

    // Adjust numbers based on difficulty
    const multiplier = params.difficulty <= 2 ? 1 : params.difficulty <= 4 ? 2 : 5;
    const adjustedMain = mainGroup.map(n => n * multiplier);
    const adjustedOdd = oddOne * multiplier;

    const allChoices = rng.shuffle([...adjustedMain, adjustedOdd]);

    const questionId = generateQuestionId('odd-one-out', { category: category.name, oddOne: adjustedOdd });

    return {
      metadata: {
        questionId,
        templateId: 'odd-one-out',
        topic: 'Логика',
        subtopic: 'Найди лишнее',
        gradeRange: ['2', '5'],
        domains: ['OA'],
        standards: [],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['logic', 'patterns', 'number-sense'],
        prerequisites: ['counting', 'number-properties'],
        tags: ['logic', 'odd-one-out', 'reasoning']
      },
      content: {
        prompt: `Какое число лишнее?\\n\\n${allChoices.join(', ')}`,
        choices: allChoices.map(n => String(n)),
        correctAnswer: adjustedOdd,
        explanation: `${adjustedOdd} — ${category.description}, а остальные ${category.ru}.`,
        hint: `Подумай, что общего у других чисел`
      },
      generationParams: { category: category.name, oddOne: adjustedOdd },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 200
});

// ==================== LOGIC: TRUE/FALSE STATEMENTS (2-4) ====================

export const logicTrueFalseTemplate: QuestionTemplate = createTemplate('logic-true-false', {
  name: 'Верно или неверно',
  description: 'Evaluate true/false logic statements',
  gradeRange: ['2', '4'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const statements = [
      { text: 'Все чётные числа делятся на 2', answer: 'Верно', difficulty: 2 },
      { text: '5 × 3 = 3 × 5', answer: 'Верно', difficulty: 2 },
      { text: '10 - 3 = 3 - 10', answer: 'Неверно', difficulty: 2 },
      { text: 'Половина от 20 равна 10', answer: 'Верно', difficulty: 2 },
      { text: 'Сумма 7 + 8 больше 20', answer: 'Неверно', difficulty: 2 },
      { text: '3 + 3 + 3 = 3 × 3', answer: 'Верно', difficulty: 3 },
      { text: 'Все нечётные числа оканчиваются на 1', answer: 'Неверно', difficulty: 3 },
      { text: '100 ÷ 10 = 10', answer: 'Верно', difficulty: 3 },
      { text: 'Площадь квадрата 5×5 равна 25', answer: 'Верно', difficulty: 4 },
      { text: '1/2 больше чем 1/4', answer: 'Верно', difficulty: 4 }
    ];

    const validStatements = statements.filter(s => s.difficulty <= params.difficulty + 1);
    const statement = rng.choice(validStatements);

    const questionId = generateQuestionId('logic-true-false', { text: statement.text });

    return {
      metadata: {
        questionId,
        templateId: 'logic-true-false',
        topic: 'Логика',
        subtopic: 'Истинность утверждений',
        gradeRange: ['2', '4'],
        domains: ['OA'],
        standards: [],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['logic', 'reasoning', 'number-sense'],
        prerequisites: ['basic-arithmetic'],
        tags: ['logic', 'true-false', 'reasoning']
      },
      content: {
        prompt: `${statement.text}\\n\\nВерно или неверно?`,
        choices: ['Верно', 'Неверно'],
        correctAnswer: statement.answer,
        explanation: statement.answer === 'Верно'
          ? `Это утверждение верно.`
          : `Это утверждение неверно.`,
        hint: `Проверь утверждение с примерами`
      },
      generationParams: { text: statement.text },
      generatedAt: Date.now()
    };
  },
  maxVariations: 200,
  estimatedCount: 10
});

// ==================== COMPARISON WORD PROBLEMS (1-3) ====================

export const comparisonWordProblemTemplate: QuestionTemplate = createTemplate('comparison-word-problem', {
  name: 'Задачи на сравнение',
  description: 'Comparison word problems (more/less)',
  gradeRange: ['1', '3'],
  domains: ['OA'],
  standards: ['1.OA.A.1', '2.OA.A.1'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const max = params.difficulty <= 2 ? 20 : params.difficulty <= 4 ? 50 : 100;
    const base = rng.nextInt(5, max);
    const difference = rng.nextInt(2, Math.min(base - 1, 20));

    const comparisonType = rng.choice(['more', 'less']);

    let prompt: string, answer: number;

    if (comparisonType === 'more') {
      answer = base + difference;
      const scenarios = [
        `У Маши ${base} карандашей. У Пети на ${difference} карандашей больше. Сколько карандашей у Пети?`,
        `В первой корзине ${base} яблок. Во второй на ${difference} яблок больше. Сколько яблок во второй корзине?`,
        `Вася прочитал ${base} страниц. Катя прочитала на ${difference} страниц больше. Сколько страниц прочитала Катя?`
      ];
      prompt = rng.choice(scenarios);
    } else {
      answer = base - difference;
      const scenarios = [
        `У Маши ${base} карандашей. У Пети на ${difference} карандашей меньше. Сколько карандашей у Пети?`,
        `В первой корзине ${base} яблок. Во второй на ${difference} яблок меньше. Сколько яблок во второй корзине?`,
        `Вася прочитал ${base} страниц. Катя прочитала на ${difference} страниц меньше. Сколько страниц прочитала Катя?`
      ];
      prompt = rng.choice(scenarios);
    }

    const questionId = generateQuestionId('comparison-word-problem', { base, difference, comparisonType });

    return {
      metadata: {
        questionId,
        templateId: 'comparison-word-problem',
        topic: 'Задачи на сравнение',
        gradeRange: ['1', '3'],
        domains: ['OA'],
        standards: ['1.OA.A.1'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['word-problems', 'comparison', comparisonType === 'more' ? 'addition' : 'subtraction'],
        prerequisites: ['addition', 'subtraction', 'reading-comprehension'],
        tags: ['word-problem', 'comparison', comparisonType]
      },
      content: {
        prompt,
        choices: [String(answer), String(answer + difference), String(answer - difference), String(base)],
        correctAnswer: answer,
        explanation: comparisonType === 'more'
          ? `"На ${difference} больше" значит прибавляем: ${base} + ${difference} = ${answer}.`
          : `"На ${difference} меньше" значит вычитаем: ${base} - ${difference} = ${answer}.`,
        hint: comparisonType === 'more'
          ? `"Больше" — значит прибавляем`
          : `"Меньше" — значит вычитаем`
      },
      generationParams: { base, difference, comparisonType },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 800
});

// ==================== MISSING NUMBER IN EQUATION (2-4) ====================

export const missingNumberTemplate: QuestionTemplate = createTemplate('missing-number', {
  name: 'Пропущенное число',
  description: 'Find the missing number in equation',
  gradeRange: ['2', '4'],
  domains: ['OA'],
  standards: ['2.OA.A.1', '3.OA.A.4'],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const operation = rng.choice(['+', '-', '×']);
    const position = rng.choice(['left', 'right', 'result']);

    let a: number, b: number, result: number, answer: number, prompt: string;

    if (operation === '+') {
      a = rng.nextInt(1, params.difficulty <= 3 ? 20 : 50);
      b = rng.nextInt(1, params.difficulty <= 3 ? 20 : 50);
      result = a + b;
    } else if (operation === '-') {
      result = rng.nextInt(1, params.difficulty <= 3 ? 20 : 50);
      b = rng.nextInt(1, result);
      a = result + b;
    } else {
      a = rng.nextInt(2, params.difficulty <= 3 ? 10 : 12);
      b = rng.nextInt(2, params.difficulty <= 3 ? 10 : 12);
      result = a * b;
    }

    if (position === 'left') {
      answer = a;
      prompt = `? ${operation} ${b} = ${result}`;
    } else if (position === 'right') {
      answer = b;
      prompt = `${a} ${operation} ? = ${result}`;
    } else {
      answer = result;
      prompt = `${a} ${operation} ${b} = ?`;
    }

    const questionId = generateQuestionId('missing-number', { a, b, operation, position });

    return {
      metadata: {
        questionId,
        templateId: 'missing-number',
        topic: 'Уравнения',
        subtopic: 'Пропущенное число',
        gradeRange: ['2', '4'],
        domains: ['OA'],
        standards: ['3.OA.A.4'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['equations', 'inverse-operations', operation === '+' ? 'addition' : operation === '-' ? 'subtraction' : 'multiplication'],
        prerequisites: ['basic-arithmetic'],
        tags: ['algebra', 'missing-number', 'equations']
      },
      content: {
        prompt: `Найди пропущенное число:\\n\\n${prompt}`,
        choices: [String(answer), String(answer + 1), String(answer - 1), String(answer + rng.nextInt(2, 10))],
        correctAnswer: answer,
        explanation: `${a} ${operation} ${b} = ${result}, значит пропущенное число = ${answer}.`,
        hint: position === 'result'
          ? `Просто вычисли результат`
          : `Используй обратное действие`
      },
      generationParams: { a, b, operation, position },
      generatedAt: Date.now()
    };
  },
  maxVariations: 2000,
  estimatedCount: 1000
});

// ==================== GROWING PATTERN (VISUAL) (K-2) ====================

export const growingPatternTemplate: QuestionTemplate = createTemplate('growing-pattern', {
  name: 'Растущий паттерн',
  description: 'Growing visual patterns',
  gradeRange: ['K', '2'],
  domains: ['OA'],
  standards: [],
  generator: (params: GeneratorParams) => {
    const rng = new SeededRandom(params.seed);

    const symbol = rng.choice(['■', '●', '★', '▲']);
    const growth = rng.choice([1, 2]);
    const start = rng.nextInt(1, 3);

    const step1 = symbol.repeat(start);
    const step2 = symbol.repeat(start + growth);
    const step3 = symbol.repeat(start + 2 * growth);
    const answer = start + 3 * growth;

    const questionId = generateQuestionId('growing-pattern', { symbol, start, growth });

    return {
      metadata: {
        questionId,
        templateId: 'growing-pattern',
        topic: 'Паттерны',
        subtopic: 'Растущий паттерн',
        gradeRange: ['K', '2'],
        domains: ['OA'],
        standards: [],
        difficulty: params.difficulty,
        cognitiveComplexity: 'reasoning',
        skills: ['patterns', 'sequences', 'counting'],
        prerequisites: ['counting'],
        tags: ['pattern', 'visual', 'growing']
      },
      content: {
        prompt: `Паттерн растёт. Сколько фигур будет в следующем шаге?\\n\\nШаг 1: ${step1}\\nШаг 2: ${step2}\\nШаг 3: ${step3}\\nШаг 4: ?`,
        choices: [String(answer), String(answer + 1), String(answer - 1), String(answer + growth)],
        correctAnswer: answer,
        explanation: `Каждый шаг добавляет ${growth} ${growth === 1 ? 'фигуру' : 'фигуры'}. ${start + 2 * growth} + ${growth} = ${answer}.`,
        hint: `Посчитай, сколько фигур добавляется каждый раз`
      },
      generationParams: { symbol, start, growth },
      generatedAt: Date.now()
    };
  },
  maxVariations: 500,
  estimatedCount: 100
});

// ==================== EXPORT ALL ====================

export const LOGIC_PATTERN_TEMPLATES: QuestionTemplate[] = [
  patternAABTemplate,
  patternABBTemplate,
  patternABCTemplate,
  numberSequencePlusNTemplate,
  numberSequenceAlternatingTemplate,
  oddOneOutTemplate,
  logicTrueFalseTemplate,
  comparisonWordProblemTemplate,
  missingNumberTemplate,
  growingPatternTemplate
];

console.log(`🧩 Logic & Pattern generators loaded (${LOGIC_PATTERN_TEMPLATES.length} templates)`);
