/**
 * 📋 Task Provider - Unified interface for tasks
 *
 * Provides tasks from:
 * - Original taskBank (legacy)
 * - Task Generator (intermediate, ~10,000 tasks)
 * - Question Engine (new, CCSS-aligned, 40,000+ questions)
 */

import { Task, SkillType, taskBank } from './taskBank';
import { MathSkillKey } from '../types/mathSkills';
import { generateTasksForTopic, getTaskForTopic } from './taskGenerator';
import { getQuestionEngineAdapter } from '../engine/questionEngineAdapter';

// Map SkillType to MathSkillKey topics
const SKILL_TO_TOPICS: Record<SkillType, MathSkillKey[]> = {
  arithmetic: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'percentages'],
  geometry: ['shapes', 'perimeter', 'area', 'volume', 'angles'],
  logic: ['patterns', 'sequences', 'problemSolving', 'wordProblems']
};

/**
 * Get tasks for a SkillType using the task generator
 * Returns a mix of tasks from all related topics
 */
export function getGeneratedTasksForSkill(
  skillType: SkillType,
  count: number = 20,
  userId: string = 'default'
): Task[] {
  const topics = SKILL_TO_TOPICS[skillType];
  const tasksPerTopic = Math.ceil(count / topics.length);
  const allTasks: Task[] = [];

  for (const topic of topics) {
    const topicTasks = generateTasksForTopic(topic, userId);
    // Take a varied sample from the topic
    for (let i = 0; i < tasksPerTopic && allTasks.length < count; i++) {
      const taskIndex = Math.floor((i / tasksPerTopic) * topicTasks.length);
      allTasks.push(topicTasks[taskIndex]);
    }
  }

  // Shuffle tasks
  return allTasks
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

/**
 * Get a single task for a specific MathSkillKey topic
 */
export function getTaskForMathSkill(
  topic: MathSkillKey,
  taskIndex: number,
  userId: string = 'default'
): Task {
  return getTaskForTopic(topic, taskIndex, userId);
}

/**
 * Task source selection
 */
export type TaskSource = 'legacy' | 'generator' | 'question-engine';

/**
 * Current task source (can be toggled via feature flag)
 */
export const TASK_SOURCE: TaskSource = 'question-engine'; // 'legacy' | 'generator' | 'question-engine'

/**
 * Get tasks for training session using Question Engine
 */
export function getTasksFromQuestionEngine(
  skillType: SkillType,
  count: number,
  userId: string = 'default',
  userAge: number = 8
): Task[] {
  try {
    const adapter = getQuestionEngineAdapter(userId, userAge);
    return adapter.getTasksForTraining(skillType, count);
  } catch (error) {
    console.error('Question Engine failed, falling back to generator:', error);
    return getGeneratedTasksForSkill(skillType, count, userId);
  }
}

/**
 * Get tasks for training session (auto-selects source)
 */
export function getTasksForTraining(
  skillType: SkillType,
  count: number,
  userId: string = 'default',
  userAge?: number
): Task[] {
  switch (TASK_SOURCE) {
    case 'question-engine':
      return getTasksFromQuestionEngine(skillType, count, userId, userAge || 8);

    case 'generator':
      return getGeneratedTasksForSkill(skillType, count, userId);

    case 'legacy':
    default:
      // Use original taskBank
      const bank = taskBank[skillType];
      const tasks: Task[] = [];
      const usedIndices = new Set<number>();

      while (tasks.length < count && usedIndices.size < bank.length) {
        const randomIndex = Math.floor(Math.random() * bank.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          tasks.push(bank[randomIndex]);
        }
      }

      return tasks;
  }
}
