/**
 * 🎯 Question Generator Index - All Templates
 */

import { QuestionTemplate } from '../types';
import { GRADE_K2_TEMPLATES } from './gradeK2';
import { GRADE_35_TEMPLATES } from './grade35';
import { LOGIC_PATTERN_TEMPLATES } from './logicPatterns';

// ==================== ALL TEMPLATES ====================

export const ALL_TEMPLATES: QuestionTemplate[] = [
  ...GRADE_K2_TEMPLATES,
  ...GRADE_35_TEMPLATES,
  ...LOGIC_PATTERN_TEMPLATES
];

// ==================== TEMPLATE LOOKUP ====================

export const TEMPLATE_BY_ID: Record<string, QuestionTemplate> = {};
for (const template of ALL_TEMPLATES) {
  TEMPLATE_BY_ID[template.id] = template;
}

// ==================== FILTERS ====================

export function getTemplatesByGrade(grade: string): QuestionTemplate[] {
  return ALL_TEMPLATES.filter(template => {
    const [minGrade, maxGrade] = template.gradeRange;
    return gradeInRange(grade, minGrade, maxGrade);
  });
}

export function getTemplatesByDomain(domain: string): QuestionTemplate[] {
  return ALL_TEMPLATES.filter(template => template.domains.includes(domain as any));
}

export function getTemplatesByDifficulty(minDiff: number, maxDiff: number): QuestionTemplate[] {
  // Templates are difficulty-agnostic; this would filter generated questions
  return ALL_TEMPLATES;
}

function gradeInRange(grade: string, min: string, max: string): boolean {
  const gradeOrder = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
  const gradeIdx = gradeOrder.indexOf(grade);
  const minIdx = gradeOrder.indexOf(min);
  const maxIdx = gradeOrder.indexOf(max);
  return gradeIdx >= minIdx && gradeIdx <= maxIdx;
}

console.log(`🎯 All generators loaded: ${ALL_TEMPLATES.length} templates`);

export { GRADE_K2_TEMPLATES, GRADE_35_TEMPLATES, LOGIC_PATTERN_TEMPLATES };
