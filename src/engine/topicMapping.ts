/**
 * 🗺️ Topic Mapping - Централизованное соответствие тем
 *
 * Решает проблему: UI использует русские названия, банк вопросов - английские
 *
 * Маппинг связывает:
 * - curriculumMap ID (например 'counting')
 * - questionGenerator topic (например 'Counting')
 * - Русское название для UI
 */

import { QuestionTopic } from '../types/question';

export interface TopicMapping {
  /** ID из curriculumMap */
  curriculumId: string;
  /** Topic из questionGenerator (английский) */
  questionTopic: QuestionTopic;
  /** Русское название */
  nameRu: string;
  /** Английское название */
  nameEn: string;
}

/**
 * Полный маппинг всех тем
 *
 * ВАЖНО: TopicSelector передаёт curriculum IDs (например 'counting', 'addition-subtraction-basic'),
 * поэтому нужны маппинги для ВСЕХ curriculum IDs (топ-уровень + подтопики)
 */
export const TOPIC_MAPPINGS: TopicMapping[] = [
  // ==================== ARITHMETIC ====================

  // Counting & Numbers
  {
    curriculumId: 'counting',
    questionTopic: 'Counting',
    nameRu: 'Счёт и числа',
    nameEn: 'Counting & Numbers'
  },
  {
    curriculumId: 'count-to-10',
    questionTopic: 'Counting',
    nameRu: 'Счёт до 10',
    nameEn: 'Count to 10'
  },
  {
    curriculumId: 'count-to-20',
    questionTopic: 'Counting',
    nameRu: 'Счёт до 20',
    nameEn: 'Count to 20'
  },
  {
    curriculumId: 'count-to-100',
    questionTopic: 'Counting',
    nameRu: 'Счёт до 100',
    nameEn: 'Count to 100'
  },

  // Place Value
  {
    curriculumId: 'place-value',
    questionTopic: 'Place Value',
    nameRu: 'Разрядность',
    nameEn: 'Place Value'
  },

  // Addition & Subtraction (compound topic)
  {
    curriculumId: 'addition-subtraction-basic',
    questionTopic: 'Addition', // Default to Addition for compound topic
    nameRu: 'Сложение и вычитание',
    nameEn: 'Addition & Subtraction'
  },
  {
    curriculumId: 'add-within-10',
    questionTopic: 'Addition',
    nameRu: 'Сложение в пределах 10',
    nameEn: 'Add within 10'
  },
  {
    curriculumId: 'subtract-within-10',
    questionTopic: 'Subtraction',
    nameRu: 'Вычитание в пределах 10',
    nameEn: 'Subtract within 10'
  },
  {
    curriculumId: 'add-within-20',
    questionTopic: 'Addition',
    nameRu: 'Сложение в пределах 20',
    nameEn: 'Add within 20'
  },
  {
    curriculumId: 'subtract-within-20',
    questionTopic: 'Subtraction',
    nameRu: 'Вычитание в пределах 20',
    nameEn: 'Subtract within 20'
  },
  {
    curriculumId: 'add-within-100',
    questionTopic: 'Addition',
    nameRu: 'Сложение в пределах 100',
    nameEn: 'Add within 100'
  },
  {
    curriculumId: 'subtract-within-100',
    questionTopic: 'Subtraction',
    nameRu: 'Вычитание в пределах 100',
    nameEn: 'Subtract within 100'
  },

  // Addition/Subtraction (individual)
  {
    curriculumId: 'addition',
    questionTopic: 'Addition',
    nameRu: 'Сложение',
    nameEn: 'Addition'
  },
  {
    curriculumId: 'subtraction',
    questionTopic: 'Subtraction',
    nameRu: 'Вычитание',
    nameEn: 'Subtraction'
  },

  // Multiplication & Division (compound topic)
  {
    curriculumId: 'multiplication-division',
    questionTopic: 'Multiplication', // Default to Multiplication
    nameRu: 'Умножение и деление',
    nameEn: 'Multiplication & Division'
  },
  {
    curriculumId: 'multiply-within-100',
    questionTopic: 'Multiplication',
    nameRu: 'Умножение в пределах 100',
    nameEn: 'Multiply within 100'
  },
  {
    curriculumId: 'divide-within-100',
    questionTopic: 'Division',
    nameRu: 'Деление в пределах 100',
    nameEn: 'Divide within 100'
  },
  {
    curriculumId: 'multi-digit-multiply',
    questionTopic: 'Multiplication',
    nameRu: 'Многозначное умножение',
    nameEn: 'Multi-digit Multiplication'
  },
  {
    curriculumId: 'multi-digit-divide',
    questionTopic: 'Division',
    nameRu: 'Многозначное деление',
    nameEn: 'Multi-digit Division'
  },

  // Multiplication/Division (individual)
  {
    curriculumId: 'multiplication',
    questionTopic: 'Multiplication',
    nameRu: 'Умножение',
    nameEn: 'Multiplication'
  },
  {
    curriculumId: 'division',
    questionTopic: 'Division',
    nameRu: 'Деление',
    nameEn: 'Division'
  },

  // Fractions
  {
    curriculumId: 'fractions',
    questionTopic: 'Fractions',
    nameRu: 'Дроби',
    nameEn: 'Fractions'
  },
  {
    curriculumId: 'understand-fractions',
    questionTopic: 'Fractions',
    nameRu: 'Понятие дроби',
    nameEn: 'Understanding Fractions'
  },
  {
    curriculumId: 'compare-fractions',
    questionTopic: 'Fractions',
    nameRu: 'Сравнение дробей',
    nameEn: 'Compare Fractions'
  },
  {
    curriculumId: 'add-subtract-fractions',
    questionTopic: 'Fractions',
    nameRu: 'Сложение и вычитание дробей',
    nameEn: 'Add & Subtract Fractions'
  },
  {
    curriculumId: 'multiply-fractions',
    questionTopic: 'Fractions',
    nameRu: 'Умножение дробей',
    nameEn: 'Multiply Fractions'
  },

  // Decimals
  {
    curriculumId: 'decimals',
    questionTopic: 'Decimals',
    nameRu: 'Десятичные дроби',
    nameEn: 'Decimals'
  },
  {
    curriculumId: 'decimals-percentages',
    questionTopic: 'Decimals', // Map percentages to Decimals
    nameRu: 'Десятичные дроби и проценты',
    nameEn: 'Decimals & Percentages'
  },
  {
    curriculumId: 'understand-decimals',
    questionTopic: 'Decimals',
    nameRu: 'Понятие десятичной дроби',
    nameEn: 'Understanding Decimals'
  },
  {
    curriculumId: 'compare-decimals',
    questionTopic: 'Decimals',
    nameRu: 'Сравнение десятичных дробей',
    nameEn: 'Compare Decimals'
  },
  {
    curriculumId: 'operations-decimals',
    questionTopic: 'Decimals',
    nameRu: 'Операции с десятичными дробями',
    nameEn: 'Operations with Decimals'
  },

  // ==================== GEOMETRY ====================

  // Geometry (top-level)
  {
    curriculumId: 'geometry',
    questionTopic: 'Shapes', // Default to Shapes
    nameRu: 'Геометрия',
    nameEn: 'Geometry'
  },

  // Shapes
  {
    curriculumId: 'shapes',
    questionTopic: 'Shapes',
    nameRu: 'Фигуры',
    nameEn: 'Shapes'
  },
  {
    curriculumId: 'identify-shapes',
    questionTopic: 'Shapes',
    nameRu: 'Распознавание фигур',
    nameEn: 'Identify Shapes'
  },
  {
    curriculumId: 'shape-properties',
    questionTopic: 'Shapes',
    nameRu: 'Свойства фигур',
    nameEn: 'Shape Properties'
  },
  {
    curriculumId: 'compose-shapes',
    questionTopic: 'Shapes',
    nameRu: 'Составление фигур',
    nameEn: 'Compose Shapes'
  },

  // Perimeter & Area
  {
    curriculumId: 'perimeter',
    questionTopic: 'Perimeter',
    nameRu: 'Периметр',
    nameEn: 'Perimeter'
  },
  {
    curriculumId: 'area',
    questionTopic: 'Area',
    nameRu: 'Площадь',
    nameEn: 'Area'
  },
  {
    curriculumId: 'perimeter-area',
    questionTopic: 'Perimeter', // Default to Perimeter
    nameRu: 'Периметр и площадь',
    nameEn: 'Perimeter & Area'
  },

  // ==================== LOGIC ====================

  // Patterns & Logic (compound topic)
  {
    curriculumId: 'patterns-logic',
    questionTopic: 'Patterns', // Default to Patterns
    nameRu: 'Паттерны и логика',
    nameEn: 'Patterns & Logic'
  },
  {
    curriculumId: 'patterns',
    questionTopic: 'Patterns',
    nameRu: 'Паттерны',
    nameEn: 'Patterns'
  },
  {
    curriculumId: 'patterns-ab-abb',
    questionTopic: 'Patterns',
    nameRu: 'Простые паттерны (AB, ABB)',
    nameEn: 'Simple Patterns (AB, ABB)'
  },
  {
    curriculumId: 'growing-patterns',
    questionTopic: 'Patterns',
    nameRu: 'Растущие паттерны',
    nameEn: 'Growing Patterns'
  },
  {
    curriculumId: 'number-patterns',
    questionTopic: 'Patterns',
    nameRu: 'Числовые паттерны',
    nameEn: 'Number Patterns'
  },

  // Sequences
  {
    curriculumId: 'sequences',
    questionTopic: 'Sequences',
    nameRu: 'Последовательности',
    nameEn: 'Sequences'
  },

  // Word Problems
  {
    curriculumId: 'word-problems',
    questionTopic: 'Word Problems',
    nameRu: 'Текстовые задачи',
    nameEn: 'Word Problems'
  },
  {
    curriculumId: 'addition-subtraction-word',
    questionTopic: 'Word Problems',
    nameRu: 'Задачи на сложение/вычитание',
    nameEn: 'Add/Subtract Word Problems'
  },
  {
    curriculumId: 'multiplication-division-word',
    questionTopic: 'Word Problems',
    nameRu: 'Задачи на умножение/деление',
    nameEn: 'Multiply/Divide Word Problems'
  },
  {
    curriculumId: 'multi-step-word',
    questionTopic: 'Word Problems',
    nameRu: 'Многошаговые задачи',
    nameEn: 'Multi-step Word Problems'
  }
];

/**
 * Получить английское название темы для банка вопросов
 */
export function getQuestionTopicFromUI(uiName: string): QuestionTopic | null {
  // Попробовать найти по русскому названию
  const byRu = TOPIC_MAPPINGS.find(m =>
    m.nameRu.toLowerCase() === uiName.toLowerCase() ||
    m.nameRu.toLowerCase().includes(uiName.toLowerCase()) ||
    uiName.toLowerCase().includes(m.nameRu.toLowerCase())
  );
  if (byRu) return byRu.questionTopic;

  // Попробовать найти по английскому названию
  const byEn = TOPIC_MAPPINGS.find(m =>
    m.nameEn.toLowerCase() === uiName.toLowerCase() ||
    m.nameEn.toLowerCase().includes(uiName.toLowerCase()) ||
    uiName.toLowerCase().includes(m.nameEn.toLowerCase())
  );
  if (byEn) return byEn.questionTopic;

  // Попробовать найти по curriculum ID
  const byCurriculumId = TOPIC_MAPPINGS.find(m =>
    m.curriculumId.toLowerCase() === uiName.toLowerCase() ||
    m.curriculumId.toLowerCase().replace(/-/g, ' ') === uiName.toLowerCase()
  );
  if (byCurriculumId) return byCurriculumId.questionTopic;

  console.warn(`[TopicMapping] No mapping found for UI name: "${uiName}"`);
  return null;
}

/**
 * Получить русское название темы для UI
 */
export function getRussianTopicName(questionTopic: QuestionTopic): string {
  const mapping = TOPIC_MAPPINGS.find(m => m.questionTopic === questionTopic);
  return mapping?.nameRu || questionTopic;
}

/**
 * Получить curriculum ID по QuestionTopic
 */
export function getCurriculumId(questionTopic: QuestionTopic): string | null {
  const mapping = TOPIC_MAPPINGS.find(m => m.questionTopic === questionTopic);
  return mapping?.curriculumId || null;
}

/**
 * Проверить, существует ли маппинг для темы
 */
export function hasTopicMapping(uiName: string): boolean {
  return getQuestionTopicFromUI(uiName) !== null;
}

/**
 * Получить все доступные темы для банка вопросов
 */
export function getAllQuestionTopics(): QuestionTopic[] {
  return TOPIC_MAPPINGS.map(m => m.questionTopic);
}

/**
 * Debug: вывести все маппинги
 */
export function debugPrintMappings() {
  console.log('📚 Topic Mappings:');
  console.table(TOPIC_MAPPINGS.map(m => ({
    'UI (RU)': m.nameRu,
    'Bank (EN)': m.questionTopic,
    'Curriculum ID': m.curriculumId
  })));
}
