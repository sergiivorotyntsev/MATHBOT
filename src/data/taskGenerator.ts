/**
 * 🎲 Task Generator - Deterministic math problem generation
 *
 * Generates ~10,000+ tasks from templates
 * - Seeded random generation (userId + day + topic)
 * - School-level math only (ages 6-16)
 * - Distribution: Arithmetic 55%, Geometry 25%, Logic 20%
 */

import { MathSkillKey } from '../types/mathSkills';
import { Task } from './taskBank';

// ==================== SEEDED RANDOM NUMBER GENERATOR ====================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Create seed from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ==================== TASK TEMPLATES ====================

interface TaskTemplate {
  generate: (rng: SeededRandom, difficulty: number) => Task;
}

// Helper to create variations
const createVariations = (
  topic: string,
  templates: TaskTemplate[],
  count: number,
  seed: number
): Task[] => {
  const rng = new SeededRandom(seed);
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const templateIndex = i % templates.length;
    const difficulty = Math.min(5, Math.max(1, Math.floor(i / templates.length) + 1));
    const task = templates[templateIndex].generate(rng, difficulty);
    tasks.push(task);
  }

  return tasks;
};

// ==================== ARITHMETIC TEMPLATES (55%) ====================

const additionTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(1, 10 * diff);
      const b = rng.nextInt(1, 10 * diff);
      return {
        q: `${a} + ${b}`,
        a: a + b,
        t: 'Сложение',
        d: diff,
        hint: `Сложи ${a} и ${b}`,
        e: `${a} + ${b} = ${a + b}`,
        time: 30 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(10, 50 * diff);
      const b = rng.nextInt(10, 50 * diff);
      return {
        q: `${a} + ${b} = ?`,
        a: a + b,
        t: 'Сложение',
        d: diff,
        hint: `Разложи по разрядам: ${Math.floor(a/10)*10}+${a%10} и ${Math.floor(b/10)*10}+${b%10}`,
        e: `${a} + ${b} = ${a + b}`,
        time: 35 + diff * 5
      };
    }
  }
];

const subtractionTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const b = rng.nextInt(1, 10 * diff);
      const a = rng.nextInt(b, 20 * diff);
      return {
        q: `${a} - ${b}`,
        a: a - b,
        t: 'Вычитание',
        d: diff,
        hint: `Вычти ${b} из ${a}`,
        e: `${a} - ${b} = ${a - b}`,
        time: 30 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const b = rng.nextInt(10, 30 * diff);
      const a = rng.nextInt(b + 10, 100 * diff);
      return {
        q: `${a} - ${b} = ?`,
        a: a - b,
        t: 'Вычитание',
        d: diff,
        hint: `Вычитай по разрядам`,
        e: `${a} - ${b} = ${a - b}`,
        time: 35 + diff * 5
      };
    }
  }
];

const multiplicationTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(2, 9);
      const b = rng.nextInt(2, Math.min(12, 2 + diff * 2));
      return {
        q: `${a} × ${b}`,
        a: a * b,
        t: 'Умножение',
        d: diff,
        hint: `Таблица умножения: ${a} × ${b}`,
        e: `${a} × ${b} = ${a * b}`,
        time: 25 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(10, 20 * diff);
      const b = rng.nextInt(2, 9);
      return {
        q: `${a} × ${b} = ?`,
        a: a * b,
        t: 'Умножение',
        d: diff,
        hint: `Разложи ${a} = ${Math.floor(a/10)*10} + ${a%10}`,
        e: `${a} × ${b} = ${a * b}`,
        time: 35 + diff * 5
      };
    }
  }
];

const divisionTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const b = rng.nextInt(2, 9);
      const q = rng.nextInt(2, 10 * diff);
      const a = b * q;
      return {
        q: `${a} ÷ ${b}`,
        a: q,
        t: 'Деление',
        d: diff,
        hint: `${b} умножить на сколько = ${a}?`,
        e: `${a} ÷ ${b} = ${q}`,
        time: 30 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const b = rng.nextInt(4, 12);
      const q = rng.nextInt(5, 15 * diff);
      const a = b * q;
      return {
        q: `${a} ÷ ${b} = ?`,
        a: q,
        t: 'Деление',
        d: diff,
        hint: `Раздели ${a} на ${b} частей`,
        e: `${a} ÷ ${b} = ${q}`,
        time: 35 + diff * 5
      };
    }
  }
];

const fractionsTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const denominators = [2, 3, 4, 5, 8, 10];
      const denom = denominators[rng.nextInt(0, Math.min(diff + 1, denominators.length - 1))];
      const num = rng.nextInt(1, denom - 1);
      const whole = rng.nextInt(10, 50 * diff);
      const result = Math.floor(whole * num / denom);
      return {
        q: `${num}/${denom} от ${whole}`,
        a: result,
        t: 'Дроби',
        d: diff,
        hint: `${whole} ÷ ${denom} × ${num}`,
        e: `${whole} ÷ ${denom} = ${whole/denom}, затем × ${num} = ${result}`,
        time: 40 + diff * 10
      };
    }
  }
];

const decimalsTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(1, 20) / 10;
      const b = rng.nextInt(1, 20) / 10;
      const result = Math.round((a + b) * 10) / 10;
      return {
        q: `${a.toFixed(1)} + ${b.toFixed(1)}`,
        a: result,
        t: 'Десятичные',
        d: diff,
        hint: `Сложи десятые доли`,
        e: `${a.toFixed(1)} + ${b.toFixed(1)} = ${result.toFixed(1)}`,
        time: 35 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(10, 100) / 10;
      const mult = [2, 5, 10][rng.nextInt(0, 2)];
      const result = a * mult;
      return {
        q: `${a.toFixed(1)} × ${mult}`,
        a: result,
        t: 'Десятичные',
        d: diff,
        hint: `Умножь на ${mult}`,
        e: `${a.toFixed(1)} × ${mult} = ${result}`,
        time: 35 + diff * 5
      };
    }
  }
];

const percentagesTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const percents = [10, 20, 25, 50];
      const percent = percents[rng.nextInt(0, Math.min(diff, percents.length - 1))];
      const whole = rng.nextInt(20, 200);
      const result = Math.floor(whole * percent / 100);
      return {
        q: `${percent}% от ${whole}`,
        a: result,
        t: 'Проценты',
        d: diff,
        hint: `${whole} ÷ 100 × ${percent}`,
        e: `${whole} × ${percent}/100 = ${result}`,
        time: 40 + diff * 5
      };
    }
  }
];

// ==================== GEOMETRY TEMPLATES (25%) ====================

const shapesTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const shapes = [
        { name: 'треугольник', sides: 3 },
        { name: 'квадрат', sides: 4 },
        { name: 'пятиугольник', sides: 5 },
        { name: 'шестиугольник', sides: 6 }
      ];
      const shape = shapes[rng.nextInt(0, Math.min(diff, shapes.length - 1))];
      return {
        q: `Сколько сторон у ${shape.name}а?`,
        a: shape.sides,
        t: 'Фигуры',
        d: diff,
        hint: `Посчитай стороны ${shape.name}а`,
        e: `У ${shape.name}а ${shape.sides} сторон${shape.sides === 3 ? 'ы' : ''}`,
        time: 25
      };
    }
  }
];

const perimeterTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const side = rng.nextInt(3, 15 * diff);
      const perimeter = side * 4;
      return {
        q: `Периметр квадрата со стороной ${side}`,
        a: perimeter,
        t: 'Периметр',
        d: diff,
        hint: `P = 4 × ${side}`,
        e: `P = 4 × ${side} = ${perimeter}`,
        time: 30 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(5, 20 * diff);
      const b = rng.nextInt(3, 15 * diff);
      const perimeter = 2 * (a + b);
      return {
        q: `Периметр прямоугольника ${a}×${b}`,
        a: perimeter,
        t: 'Периметр',
        d: diff,
        hint: `P = 2(${a}+${b})`,
        e: `P = 2 × (${a} + ${b}) = ${perimeter}`,
        time: 35 + diff * 5
      };
    }
  }
];

const areaTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const side = rng.nextInt(3, 12 * diff);
      const area = side * side;
      return {
        q: `Площадь квадрата со стороной ${side}`,
        a: area,
        t: 'Площадь',
        d: diff,
        hint: `S = ${side}²`,
        e: `S = ${side} × ${side} = ${area}`,
        time: 30 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(4, 15 * diff);
      const b = rng.nextInt(3, 12 * diff);
      const area = a * b;
      return {
        q: `Площадь прямоугольника ${a}×${b}`,
        a: area,
        t: 'Площадь',
        d: diff,
        hint: `S = ${a} × ${b}`,
        e: `S = ${a} × ${b} = ${area}`,
        time: 30 + diff * 5
      };
    }
  }
];

const volumeTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const side = rng.nextInt(2, 8 * diff);
      const volume = side * side * side;
      return {
        q: `Объём куба с ребром ${side}`,
        a: volume,
        t: 'Объём',
        d: diff,
        hint: `V = ${side}³`,
        e: `V = ${side} × ${side} × ${side} = ${volume}`,
        time: 35 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(3, 10 * diff);
      const b = rng.nextInt(2, 8 * diff);
      const c = rng.nextInt(2, 6 * diff);
      const volume = a * b * c;
      return {
        q: `Объём коробки ${a}×${b}×${c}`,
        a: volume,
        t: 'Объём',
        d: diff,
        hint: `V = ${a} × ${b} × ${c}`,
        e: `V = ${a} × ${b} × ${c} = ${volume}`,
        time: 40 + diff * 5
      };
    }
  }
];

const anglesTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const angles = [
        { q: 'Прямой угол', a: 90 },
        { q: 'Развёрнутый угол', a: 180 },
        { q: 'Полный угол', a: 360 }
      ];
      const angle = angles[rng.nextInt(0, Math.min(diff, angles.length - 1))];
      return {
        q: `${angle.q} = ? градусов`,
        a: angle.a,
        t: 'Углы',
        d: diff,
        hint: `Вспомни основные углы`,
        e: `${angle.q} = ${angle.a}°`,
        time: 25
      };
    }
  }
];

// ==================== LOGIC TEMPLATES (20%) ====================

const patternsTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const start = rng.nextInt(1, 10);
      const step = [1, 2, 3, 5][rng.nextInt(0, Math.min(diff, 3))];
      const sequence = [start, start + step, start + 2*step, start + 3*step];
      const answer = start + 4*step;
      return {
        q: `${sequence.join(', ')}, ?`,
        a: answer,
        t: 'Паттерны',
        d: diff,
        hint: `Шаг +${step}`,
        e: `${sequence.join(', ')}, ${answer}`,
        time: 35 + diff * 5
      };
    }
  }
];

const sequencesTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const start = rng.nextInt(2, 10);
      const step = rng.nextInt(2, 5);
      const n = 3 + diff;
      const answer = start + (n - 1) * step;
      return {
        q: `${start}, ${start+step}, ${start+2*step}... ${n}-й член?`,
        a: answer,
        t: 'Последовательности',
        d: diff,
        hint: `Арифметическая прогрессия с шагом ${step}`,
        e: `a₁ = ${start}, d = ${step}, a${n} = ${answer}`,
        time: 40 + diff * 10
      };
    }
  }
];

const problemSolvingTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const a = rng.nextInt(5, 20 * diff);
      const b = rng.nextInt(3, 15 * diff);
      const total = a + b;
      return {
        q: `У Маши ${a}, у Пети ${b}. Сколько всего?`,
        a: total,
        t: 'Решение задач',
        d: diff,
        hint: `Сложи ${a} + ${b}`,
        e: `${a} + ${b} = ${total}`,
        time: 35 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const total = rng.nextInt(10, 50 * diff);
      const given = rng.nextInt(5, total - 5);
      const left = total - given;
      return {
        q: `Было ${total}, отдали ${given}. Осталось?`,
        a: left,
        t: 'Решение задач',
        d: diff,
        hint: `${total} - ${given}`,
        e: `${total} - ${given} = ${left}`,
        time: 35 + diff * 5
      };
    }
  }
];

const wordProblemsTemplates: TaskTemplate[] = [
  {
    generate: (rng, diff) => {
      const price = rng.nextInt(10, 100) * 5;
      const count = rng.nextInt(2, 8);
      const total = price * count;
      return {
        q: `Книга ${price}₽. Купили ${count} книги. Сколько заплатили?`,
        a: total,
        t: 'Текстовые задачи',
        d: diff,
        hint: `${price} × ${count}`,
        e: `${price} × ${count} = ${total}₽`,
        time: 40 + diff * 5
      };
    }
  },
  {
    generate: (rng, diff) => {
      const total = rng.nextInt(12, 60);
      const groups = [2, 3, 4, 5][rng.nextInt(0, Math.min(diff, 3))];
      if (total % groups !== 0) return wordProblemsTemplates[0].generate(rng, diff);
      const perGroup = total / groups;
      return {
        q: `${total} конфет разделили на ${groups} детей. Сколько каждому?`,
        a: perGroup,
        t: 'Текстовые задачи',
        d: diff,
        hint: `${total} ÷ ${groups}`,
        e: `${total} ÷ ${groups} = ${perGroup}`,
        time: 40 + diff * 5
      };
    }
  }
];

// ==================== TASK GENERATOR ====================

const TEMPLATES_MAP: Record<MathSkillKey, TaskTemplate[]> = {
  // Arithmetic (55%)
  addition: additionTemplates,
  subtraction: subtractionTemplates,
  multiplication: multiplicationTemplates,
  division: divisionTemplates,
  fractions: fractionsTemplates,
  decimals: decimalsTemplates,
  percentages: percentagesTemplates,

  // Geometry (25%)
  shapes: shapesTemplates,
  perimeter: perimeterTemplates,
  area: areaTemplates,
  volume: volumeTemplates,
  angles: anglesTemplates,

  // Logic (20%)
  patterns: patternsTemplates,
  sequences: sequencesTemplates,
  problemSolving: problemSolvingTemplates,
  wordProblems: wordProblemsTemplates
};

// Tasks per topic (total ~10,000)
const TASKS_PER_TOPIC: Record<MathSkillKey, number> = {
  // Arithmetic: 55% ≈ 5,500 tasks
  addition: 900,
  subtraction: 900,
  multiplication: 900,
  division: 800,
  fractions: 700,
  decimals: 700,
  percentages: 600,

  // Geometry: 25% ≈ 2,500 tasks
  shapes: 400,
  perimeter: 500,
  area: 600,
  volume: 500,
  angles: 500,

  // Logic: 20% ≈ 2,000 tasks
  patterns: 500,
  sequences: 500,
  problemSolving: 500,
  wordProblems: 500
};

/**
 * Generate tasks for a specific topic
 * @param topic - MathSkillKey topic
 * @param userId - User ID for seed (optional, uses default)
 * @param day - Day number for variation (optional, uses current day)
 */
export function generateTasksForTopic(
  topic: MathSkillKey,
  userId: string = 'default',
  day: number = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
): Task[] {
  const templates = TEMPLATES_MAP[topic];
  const count = TASKS_PER_TOPIC[topic];
  const seed = hashString(`${userId}-${day}-${topic}`);

  return createVariations(topic, templates, count, seed);
}

/**
 * Generate ALL tasks (~10,000)
 */
export function generateAllTasks(
  userId: string = 'default',
  day: number = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
): Record<MathSkillKey, Task[]> {
  const allTasks: Partial<Record<MathSkillKey, Task[]>> = {};

  for (const topic of Object.keys(TEMPLATES_MAP) as MathSkillKey[]) {
    allTasks[topic] = generateTasksForTopic(topic, userId, day);
  }

  return allTasks as Record<MathSkillKey, Task[]>;
}

/**
 * Get a random task for a topic (deterministic based on seed)
 */
export function getTaskForTopic(
  topic: MathSkillKey,
  taskIndex: number,
  userId: string = 'default',
  day: number = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
): Task {
  const tasks = generateTasksForTopic(topic, userId, day);
  return tasks[taskIndex % tasks.length];
}

console.log(`🎲 Task Generator initialized: ${Object.values(TASKS_PER_TOPIC).reduce((a, b) => a + b, 0)} total tasks`);
