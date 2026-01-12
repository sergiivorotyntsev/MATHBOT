/**
 * 📋 Task Provider - Unified interface for tasks
 *
 * Provides tasks from both:
 * - Original taskBank (legacy)
 * - Task Generator (new, ~10,000 tasks)
 */

import { Task, SkillType, taskBank } from './taskBank';
import { MathSkillKey } from '../types/mathSkills';
import { generateTasksForTopic, getTaskForTopic } from './taskGenerator';

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
 * Check if using generated tasks (can be toggled via feature flag)
 */
export const USE_GENERATED_TASKS = true; // Set to true to use generator, false for original taskBank

/**
 * Get tasks for training session (auto-selects source)
 */
export function getTasksForTraining(
  skillType: SkillType,
  count: number,
  userId: string = 'default'
): Task[] {
  if (USE_GENERATED_TASKS) {
    return getGeneratedTasksForSkill(skillType, count, userId);
  } else {
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
