/**
 * 🎲 Question Generators - Base utilities and templates
 */

import { Question, QuestionTemplate, GeneratorParams, GradeLevel } from '../types';

// ==================== SEEDED RANDOM ====================

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  sample<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

// ==================== HASH UTILITIES ====================

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateQuestionId(templateId: string, params: any): string {
  const paramStr = JSON.stringify(params);
  return `${templateId}-${hashString(paramStr)}`;
}

// ==================== ANSWER GENERATION ====================

export function generateMultipleChoiceOptions(
  correctAnswer: number,
  rng: SeededRandom,
  count: number = 4,
  spread: number = 10
): string[] {
  const options = new Set<number>([correctAnswer]);

  while (options.size < count) {
    const offset = rng.nextInt(-spread, spread);
    const wrongAnswer = correctAnswer + offset;

    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }

  return rng.shuffle(Array.from(options)).map(n => String(n));
}

// ==================== TEMPLATE HELPERS ====================

export function createTemplate(
  id: string,
  config: Omit<QuestionTemplate, 'id'>
): QuestionTemplate {
  return {
    id,
    ...config
  };
}

// ==================== WORD PROBLEM TEMPLATES ====================

interface WordProblemTemplate {
  scenario: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  generateParams: (rng: SeededRandom, difficulty: number) => {
    a: number;
    b: number;
    answer: number;
  };
}

export const WORD_PROBLEM_SCENARIOS = {
  add: {
    toys: 'У Маши было {a} игрушек. Ей подарили ещё {b}. Сколько игрушек теперь у Маши?',
    apples: 'В корзине {a} яблок. Туда положили ещё {b}. Сколько яблок стало?',
    birds: 'На ветке сидело {a} птиц. Прилетело ещё {b}. Сколько птиц на ветке?',
    cars: 'На парковке было {a} машин. Приехало ещё {b}. Сколько машин стало?',
    books: 'На полке {a} книг. Поставили ещё {b}. Сколько книг на полке?'
  },

  subtract: {
    toys: 'У Маши было {a} игрушек. Она отдала {b}. Сколько игрушек осталось?',
    apples: 'В корзине было {a} яблок. Съели {b}. Сколько яблок осталось?',
    birds: 'На ветке сидело {a} птиц. Улетело {b}. Сколько птиц осталось?',
    balloons: 'У Пети было {a} шариков. {b} лопнули. Сколько шариков осталось?',
    pencils: 'В пенале {a} карандашей. {b} сломались. Сколько целых карандашей?'
  },

  multiply: {
    groups: 'В каждой коробке {a} конфет. Есть {b} коробок. Сколько всего конфет?',
    rows: 'В ряду {a} стульев. Рядов {b}. Сколько всего стульев?',
    pages: 'На каждой странице {a} картинок. Страниц {b}. Сколько всего картинок?',
    baskets: 'В каждой корзине {a} яблок. Корзин {b}. Сколько всего яблок?',
    bags: 'В каждом пакете {a} орехов. Пакетов {b}. Сколько всего орехов?'
  },

  divide: {
    equal: '{a} конфет нужно разделить поровну между {b} детьми. Сколько конфет получит каждый?',
    groups: '{a} учеников нужно разделить на группы по {b} человек. Сколько групп получится?',
    plates: '{a} яблок разложили на {b} тарелок поровну. Сколько яблок на каждой тарелке?',
    boxes: '{a} карандашей разложили в {b} коробок поровну. Сколько карандашей в коробке?',
    teams: '{a} игроков разделили на {b} команд поровну. Сколько игроков в команде?'
  }
};

export function fillTemplate(template: string, params: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

// ==================== NUMBER NAMES (For young learners) ====================

export const NUMBER_NAMES_RU: Record<number, string> = {
  0: 'ноль', 1: 'один', 2: 'два', 3: 'три', 4: 'четыре', 5: 'пять',
  6: 'шесть', 7: 'семь', 8: 'восемь', 9: 'девять', 10: 'десять',
  11: 'одиннадцать', 12: 'двенадцать', 13: 'тринадцать', 14: 'четырнадцать',
  15: 'пятнадцать', 16: 'шестнадцать', 17: 'семнадцать', 18: 'восемнадцать',
  19: 'девятнадцать', 20: 'двадцать'
};

export const NUMBER_NAMES_EN: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
  16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty'
};

// ==================== SHAPES ====================

export const SHAPES = {
  circle: { ru: 'круг', en: 'circle', sides: 0 },
  square: { ru: 'квадрат', en: 'square', sides: 4 },
  triangle: { ru: 'треугольник', en: 'triangle', sides: 3 },
  rectangle: { ru: 'прямоугольник', en: 'rectangle', sides: 4 },
  pentagon: { ru: 'пятиугольник', en: 'pentagon', sides: 5 },
  hexagon: { ru: 'шестиугольник', en: 'hexagon', sides: 6 }
};

// ==================== PATTERNS ====================

export function generatePattern(
  rng: SeededRandom,
  type: 'AB' | 'ABB' | 'AAB' | 'ABC',
  elements: string[]
): string[] {
  const [a, b, c] = rng.sample(elements, 3);

  const patterns = {
    'AB': [a, b, a, b, a, b],
    'ABB': [a, b, b, a, b, b],
    'AAB': [a, a, b, a, a, b],
    'ABC': [a, b, c, a, b, c]
  };

  return patterns[type];
}

console.log('🎲 Base generators loaded');
