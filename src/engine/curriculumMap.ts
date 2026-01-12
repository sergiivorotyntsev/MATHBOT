/**
 * 🎓 Curriculum Map - Common Core alignment by grade
 */

import { GradeLevel, Domain, CCSSStandard } from './types';

// ==================== AGE TO GRADE MAPPING ====================

export function ageToGrade(age: number): GradeLevel {
  if (age <= 5) return 'K';
  if (age === 6) return '1';
  if (age === 7) return '2';
  if (age === 8) return '3';
  if (age === 9) return '4';
  if (age === 10) return '5';
  if (age === 11) return '6';
  if (age === 12) return '7';
  return '8';
}

export function gradeToAgeRange(grade: GradeLevel): [number, number] {
  const map: Record<GradeLevel, [number, number]> = {
    'K': [5, 6],
    '1': [6, 7],
    '2': [7, 8],
    '3': [8, 9],
    '4': [9, 10],
    '5': [10, 11],
    '6': [11, 12],
    '7': [12, 13],
    '8': [13, 14]
  };
  return map[grade];
}

// ==================== DOMAIN AVAILABILITY BY GRADE ====================

export const DOMAINS_BY_GRADE: Record<GradeLevel, Domain[]> = {
  'K': ['OA', 'NBT', 'MD', 'G'],
  '1': ['OA', 'NBT', 'MD', 'G'],
  '2': ['OA', 'NBT', 'MD', 'G'],
  '3': ['OA', 'NBT', 'NF', 'MD', 'G'],  // Fractions start here
  '4': ['OA', 'NBT', 'NF', 'MD', 'G'],
  '5': ['OA', 'NBT', 'NF', 'MD', 'G'],
  '6': ['RP', 'NS', 'EE', 'G', 'SP'],
  '7': ['RP', 'NS', 'EE', 'G', 'SP'],
  '8': ['NS', 'EE', 'G', 'SP']
};

export function isDomainAvailableForGrade(domain: Domain, grade: GradeLevel): boolean {
  return DOMAINS_BY_GRADE[grade].includes(domain);
}

// ==================== TOPIC TREE (Detailed) ====================

export interface TopicNode {
  id: string;
  name: {
    ru: string;
    en: string;
  };
  gradeRange: [GradeLevel, GradeLevel];
  domain: Domain;
  subtopics?: TopicNode[];
  ccssCode?: string;
}

export const CURRICULUM_TREE: TopicNode[] = [
  // ==================== KINDERGARTEN & GRADE 1 ====================
  {
    id: 'counting',
    name: { ru: 'Счёт и числа', en: 'Counting & Numbers' },
    gradeRange: ['K', '2'],
    domain: 'OA',
    subtopics: [
      {
        id: 'count-to-10',
        name: { ru: 'Счёт до 10', en: 'Count to 10' },
        gradeRange: ['K', 'K'],
        domain: 'OA',
        ccssCode: 'K.CC.A.1'
      },
      {
        id: 'count-to-20',
        name: { ru: 'Счёт до 20', en: 'Count to 20' },
        gradeRange: ['K', '1'],
        domain: 'OA',
        ccssCode: '1.NBT.A.1'
      },
      {
        id: 'count-to-100',
        name: { ru: 'Счёт до 100', en: 'Count to 100' },
        gradeRange: ['1', '2'],
        domain: 'NBT',
        ccssCode: '1.NBT.A.1'
      }
    ]
  },

  {
    id: 'addition-subtraction-basic',
    name: { ru: 'Сложение и вычитание', en: 'Addition & Subtraction' },
    gradeRange: ['K', '2'],
    domain: 'OA',
    subtopics: [
      {
        id: 'add-within-10',
        name: { ru: 'Сложение в пределах 10', en: 'Add within 10' },
        gradeRange: ['K', '1'],
        domain: 'OA',
        ccssCode: 'K.OA.A.1'
      },
      {
        id: 'subtract-within-10',
        name: { ru: 'Вычитание в пределах 10', en: 'Subtract within 10' },
        gradeRange: ['K', '1'],
        domain: 'OA',
        ccssCode: 'K.OA.A.2'
      },
      {
        id: 'add-within-20',
        name: { ru: 'Сложение в пределах 20', en: 'Add within 20' },
        gradeRange: ['1', '2'],
        domain: 'OA',
        ccssCode: '1.OA.C.6'
      },
      {
        id: 'subtract-within-20',
        name: { ru: 'Вычитание в пределах 20', en: 'Subtract within 20' },
        gradeRange: ['1', '2'],
        domain: 'OA',
        ccssCode: '1.OA.C.6'
      },
      {
        id: 'add-within-100',
        name: { ru: 'Сложение в пределах 100', en: 'Add within 100' },
        gradeRange: ['2', '3'],
        domain: 'NBT',
        ccssCode: '2.NBT.B.5'
      }
    ]
  },

  // ==================== MULTIPLICATION & DIVISION (Grade 2+) ====================
  {
    id: 'multiplication-division',
    name: { ru: 'Умножение и деление', en: 'Multiplication & Division' },
    gradeRange: ['2', '5'],
    domain: 'OA',
    subtopics: [
      {
        id: 'multiply-within-100',
        name: { ru: 'Умножение в пределах 100', en: 'Multiply within 100' },
        gradeRange: ['3', '4'],
        domain: 'OA',
        ccssCode: '3.OA.C.7'
      },
      {
        id: 'divide-within-100',
        name: { ru: 'Деление в пределах 100', en: 'Divide within 100' },
        gradeRange: ['3', '4'],
        domain: 'OA',
        ccssCode: '3.OA.C.7'
      },
      {
        id: 'multi-digit-multiply',
        name: { ru: 'Многозначное умножение', en: 'Multi-digit Multiplication' },
        gradeRange: ['4', '5'],
        domain: 'NBT',
        ccssCode: '4.NBT.B.5'
      },
      {
        id: 'multi-digit-divide',
        name: { ru: 'Многозначное деление', en: 'Multi-digit Division' },
        gradeRange: ['4', '5'],
        domain: 'NBT',
        ccssCode: '4.NBT.B.6'
      }
    ]
  },

  // ==================== FRACTIONS (Grade 3+) ====================
  {
    id: 'fractions',
    name: { ru: 'Дроби', en: 'Fractions' },
    gradeRange: ['3', '5'],
    domain: 'NF',
    subtopics: [
      {
        id: 'understand-fractions',
        name: { ru: 'Понятие дроби', en: 'Understanding Fractions' },
        gradeRange: ['3', '3'],
        domain: 'NF',
        ccssCode: '3.NF.A.1'
      },
      {
        id: 'compare-fractions',
        name: { ru: 'Сравнение дробей', en: 'Compare Fractions' },
        gradeRange: ['3', '4'],
        domain: 'NF',
        ccssCode: '3.NF.A.3'
      },
      {
        id: 'add-subtract-fractions',
        name: { ru: 'Сложение и вычитание дробей', en: 'Add & Subtract Fractions' },
        gradeRange: ['4', '5'],
        domain: 'NF',
        ccssCode: '4.NF.B.3'
      },
      {
        id: 'multiply-fractions',
        name: { ru: 'Умножение дробей', en: 'Multiply Fractions' },
        gradeRange: ['4', '5'],
        domain: 'NF',
        ccssCode: '4.NF.B.4'
      },
      {
        id: 'divide-fractions',
        name: { ru: 'Деление дробей', en: 'Divide Fractions' },
        gradeRange: ['5', '6'],
        domain: 'NF',
        ccssCode: '5.NF.B.7'
      }
    ]
  },

  // ==================== DECIMALS & PERCENTAGES (Grade 4+) ====================
  {
    id: 'decimals-percentages',
    name: { ru: 'Десятичные и проценты', en: 'Decimals & Percentages' },
    gradeRange: ['4', '6'],
    domain: 'NF',
    subtopics: [
      {
        id: 'decimal-notation',
        name: { ru: 'Десятичная запись', en: 'Decimal Notation' },
        gradeRange: ['4', '5'],
        domain: 'NF',
        ccssCode: '4.NF.C.6'
      },
      {
        id: 'compare-decimals',
        name: { ru: 'Сравнение десятичных', en: 'Compare Decimals' },
        gradeRange: ['4', '5'],
        domain: 'NF',
        ccssCode: '4.NF.C.7'
      },
      {
        id: 'percent-basics',
        name: { ru: 'Основы процентов', en: 'Percent Basics' },
        gradeRange: ['6', '7'],
        domain: 'RP',
        ccssCode: '6.RP.A.3'
      }
    ]
  },

  // ==================== GEOMETRY ====================
  {
    id: 'geometry',
    name: { ru: 'Геометрия', en: 'Geometry' },
    gradeRange: ['K', '8'],
    domain: 'G',
    subtopics: [
      {
        id: 'shapes-basic',
        name: { ru: 'Основные фигуры', en: 'Basic Shapes' },
        gradeRange: ['K', '2'],
        domain: 'G',
        ccssCode: 'K.G.A.2'
      },
      {
        id: 'perimeter',
        name: { ru: 'Периметр', en: 'Perimeter' },
        gradeRange: ['3', '5'],
        domain: 'MD',
        ccssCode: '3.MD.D.8'
      },
      {
        id: 'area',
        name: { ru: 'Площадь', en: 'Area' },
        gradeRange: ['3', '5'],
        domain: 'MD',
        ccssCode: '3.MD.C.7'
      },
      {
        id: 'volume',
        name: { ru: 'Объём', en: 'Volume' },
        gradeRange: ['5', '8'],
        domain: 'MD',
        ccssCode: '5.MD.C.3'
      },
      {
        id: 'angles',
        name: { ru: 'Углы', en: 'Angles' },
        gradeRange: ['4', '8'],
        domain: 'MD',
        ccssCode: '4.MD.C.5'
      }
    ]
  },

  // ==================== PATTERNS & LOGIC ====================
  {
    id: 'patterns-logic',
    name: { ru: 'Паттерны и логика', en: 'Patterns & Logic' },
    gradeRange: ['K', '5'],
    domain: 'OA',
    subtopics: [
      {
        id: 'patterns-ab-abb',
        name: { ru: 'Паттерны AB, ABB', en: 'Patterns AB, ABB' },
        gradeRange: ['K', '1'],
        domain: 'OA'
      },
      {
        id: 'number-sequences',
        name: { ru: 'Числовые последовательности', en: 'Number Sequences' },
        gradeRange: ['1', '4'],
        domain: 'OA',
        ccssCode: '4.OA.C.5'
      },
      {
        id: 'problem-solving',
        name: { ru: 'Решение задач', en: 'Problem Solving' },
        gradeRange: ['1', '8'],
        domain: 'OA'
      }
    ]
  },

  // ==================== WORD PROBLEMS ====================
  {
    id: 'word-problems',
    name: { ru: 'Текстовые задачи', en: 'Word Problems' },
    gradeRange: ['1', '8'],
    domain: 'OA',
    subtopics: [
      {
        id: 'addition-subtraction-word',
        name: { ru: 'Задачи на сложение/вычитание', en: 'Add/Subtract Word Problems' },
        gradeRange: ['1', '3'],
        domain: 'OA',
        ccssCode: '1.OA.A.1'
      },
      {
        id: 'multiplication-division-word',
        name: { ru: 'Задачи на умножение/деление', en: 'Multiply/Divide Word Problems' },
        gradeRange: ['3', '5'],
        domain: 'OA',
        ccssCode: '3.OA.A.3'
      },
      {
        id: 'multi-step-word',
        name: { ru: 'Многошаговые задачи', en: 'Multi-step Word Problems' },
        gradeRange: ['4', '8'],
        domain: 'OA',
        ccssCode: '4.OA.A.3'
      }
    ]
  }
];

// ==================== HELPER FUNCTIONS ====================

export function getAllTopicsForGrade(grade: GradeLevel): TopicNode[] {
  const topics: TopicNode[] = [];

  for (const topic of CURRICULUM_TREE) {
    const [minGrade, maxGrade] = topic.gradeRange;

    if (isGradeInRange(grade, minGrade, maxGrade)) {
      topics.push(topic);
    }
  }

  return topics;
}

export function getAllSubtopicsForGrade(grade: GradeLevel): TopicNode[] {
  const subtopics: TopicNode[] = [];

  for (const topic of CURRICULUM_TREE) {
    if (topic.subtopics) {
      for (const subtopic of topic.subtopics) {
        const [minGrade, maxGrade] = subtopic.gradeRange;

        if (isGradeInRange(grade, minGrade, maxGrade)) {
          subtopics.push(subtopic);
        }
      }
    }
  }

  return subtopics;
}

export function isGradeInRange(grade: GradeLevel, min: GradeLevel, max: GradeLevel): boolean {
  const gradeOrder: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
  const gradeIndex = gradeOrder.indexOf(grade);
  const minIndex = gradeOrder.indexOf(min);
  const maxIndex = gradeOrder.indexOf(max);

  return gradeIndex >= minIndex && gradeIndex <= maxIndex;
}

export function findTopicById(id: string): TopicNode | undefined {
  for (const topic of CURRICULUM_TREE) {
    if (topic.id === id) return topic;

    if (topic.subtopics) {
      for (const subtopic of topic.subtopics) {
        if (subtopic.id === id) return subtopic;
      }
    }
  }

  return undefined;
}

export function canStudentAccessTopic(grade: GradeLevel, topicId: string): boolean {
  const topic = findTopicById(topicId);
  if (!topic) return false;

  const [minGrade, maxGrade] = topic.gradeRange;
  return isGradeInRange(grade, minGrade, maxGrade);
}

console.log('🎓 Curriculum Map loaded');
