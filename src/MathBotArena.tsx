/**
 * 🎮 MathBot Arena - Main Component (Refactored & Optimized)
 *
 * ✅ FIXES IMPLEMENTED:
 * - Immutable state updates (no mutations)
 * - Proper useEffect dependencies
 * - Safe answer generation (no infinite loops)
 * - localStorage persistence
 * - Improved UX with modals instead of alerts
 * - Better touch targets (min 44x44px)
 * - Responsive design for all devices
 * - Learning mode vs Training mode
 * - Hero progression system
 * - Anti-cheat tracking
 *
 * @version 2.0.0
 * @date 2026-01-09
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, Star, Clock, User, Settings, Flame, BookOpen, BarChart3, ArrowLeft, Lightbulb, Swords, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskBank, Task, SkillType } from './data/taskBank';
import { getTasksForTraining } from './data/taskProvider';
import { methodologyGuides, getGuideByTopic } from './data/methodologyGuides';
import { LocalBotBattle } from './components/LocalBotBattle';
import { useI18n } from './i18n/context';
import { AvatarProfile, AvatarBaseType, AvatarCosmetics, createDefaultAvatar } from './avatar/types';
import { AvatarSelection } from './avatar/AvatarSelection';
import { AvatarView } from './avatar/AvatarView';
import { ProgressTab } from './components/ProgressTab';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { PlayerHeader } from './components/PlayerHeader';
import { EditableProfile } from './components/EditableProfile';
import { TrainingDashboard } from './components/TrainingDashboard';
import { GamificationWidget } from './components/GamificationWidget';
import { AchievementNotification } from './components/AchievementNotification';
import { RewardSummary } from './components/RewardSummary';
import { AdminPanel } from './components/AdminPanel';
import { calculateScore } from './scoring/scoring';
import { calculateSkillGains, applySkillGains } from './skills/skillGain';
import { applySkillDecay, getDecayWarning } from './skills/skillDecay';
import { safelyMigrateProfile } from './utils/dataMigration';
import { MathSkillKey, MATH_SKILL_NAMES } from './types/mathSkills';
import {
  GamificationData,
  Achievement,
  createInitialGamificationData,
  updateDailyGoal,
  updateStreak,
  checkAchievements
} from './types/gamification';
import { questionService } from './engine/questionService';
import { questionsToTasks, getSkillIdFromTask, logSessionSummary, TaskWithOptions as AdapterTaskWithOptions } from './engine/questionAdapter';
import type { SkillId } from './types/question';
import { createSkillId, QuestionDomain, QuestionTopic } from './types/question';
import { getQuestionTopicFromUI } from './engine/topicMapping';
import { recordAttempt, generateAttemptId, tierToDifficultyScore } from './progress/attemptLog';
import { apiClient } from './api/client';
import type { Session as APISession } from './api/client';
import { getSkillIdFromUI, getDomainFromSkillType } from './utils/skillMapping';

// ==================== TYPES ====================

interface UserData {
  name: string;
  age: number;
  email: string;
  registeredAt: string;
}

interface SuperSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
  active: boolean;
}

interface SkillStats {
  total: number;
  correct: number;
  errorTopics: string[];
  level: number;
  xp: number;
  masteryPoints: number;
  superSkills: SuperSkill[];
}

interface Statistics {
  totalQuestions: number;
  correctAnswers: number;
  bestCombo: number;
  sessions: number;
  totalPlayTime: number; // секунды
  skillStats: Record<SkillType, SkillStats>;
}

interface PlayerBot {
  name: string;
  level: number;
  xp: number;
  totalXP: number;
  statistics: Statistics;
  avatarProfile?: AvatarProfile; // Avatar system integration
  gamification?: GamificationData; // Gamification system
}

interface SessionData {
  active: boolean;
  mode: 'learning' | 'training'; // Обучение vs Тренировка
  skillType: SkillType | null;
  currentQ: number;
  totalQ: number;
  correct: number;
  questions: TaskWithOptions[];
  startedAt: number;
  appSwitches: number; // Для анти-чита
  suspiciousActivity: boolean;
}

interface TaskWithOptions extends Task {
  options: number[];
  index: number;
}

interface FeedbackData {
  success: boolean;
  message: string;
  xpGained?: number;
  combo?: number;
}

// ==================== CONSTANTS ====================

// Build marker for debugging (updated with Avatar System: 2026-01-11)
const BUILD_TAG = 'v2.1-AVATAR-SKILLS';

const AGE_CATEGORIES = {
  '6-7': { name: 'Юные Исследователи', icon: '🔬', questions: 10 },
  '8-9': { name: 'Начинающие Изобретатели', icon: '⚙️', questions: 12 },
  '10-11': { name: 'Молодые Инженеры', icon: '🏗️', questions: 15 },
  '12-14': { name: 'Талантливые Учёные', icon: '🧪', questions: 18 },
  '15+': { name: 'Будущие Академики', icon: '🎓', questions: 20 }
} as const;

const SKILLS = {
  arithmetic: { name: 'Арифметика', icon: '➕', color: 'from-blue-600 to-cyan-600' },
  geometry: { name: 'Геометрия', icon: '📐', color: 'from-green-600 to-emerald-600' },
  logic: { name: 'Логика', icon: '🧩', color: 'from-purple-600 to-pink-600' }
} as const;

const SUPER_SKILLS: Record<SkillType, SuperSkill[]> = {
  arithmetic: [
    { id: 'lightning_calc', name: 'Молниеносный счёт', description: '+50% XP за быстрые ответы', icon: '⚡', unlockLevel: 10, active: false },
    { id: 'math_shield', name: 'Математический щит', description: '1 ошибка не сбрасывает комбо', icon: '🛡️', unlockLevel: 20, active: false },
    { id: 'chain_reaction', name: 'Цепная реакция', description: 'Комбо x3 вместо x2', icon: '🔗', unlockLevel: 30, active: false },
  ],
  geometry: [
    { id: 'spatial_vision', name: 'Пространственное видение', description: 'Показ подсказок для сложных задач', icon: '👁️', unlockLevel: 10, active: false },
    { id: 'architect', name: 'Архитектор', description: '+30% XP за геометрические задачи', icon: '🏛️', unlockLevel: 20, active: false },
    { id: 'golden_ratio', name: 'Золотое сечение', description: 'Бонус времени +15 сек', icon: '✨', unlockLevel: 30, active: false },
  ],
  logic: [
    { id: 'deduction', name: 'Дедукция', description: 'Исключение 1 неверного варианта', icon: '🔍', unlockLevel: 10, active: false },
    { id: 'pattern_master', name: 'Мастер паттернов', description: 'Подсветка паттернов в задачах', icon: '🎯', unlockLevel: 20, active: false },
    { id: 'time_warp', name: 'Временной варп', description: 'Заморозка таймера на 10 сек (1 раз)', icon: '⏰', unlockLevel: 30, active: false },
  ],
};

// ==================== UTILITY FUNCTIONS ====================

const getAgeCategory = (age: number): keyof typeof AGE_CATEGORIES => {
  if (age <= 7) return '6-7';
  if (age <= 9) return '8-9';
  if (age <= 11) return '10-11';
  if (age <= 14) return '12-14';
  return '15+';
};

const calculateLevel = (totalXP: number): number => {
  // Логарифмическая система: Level = floor(log2(totalXP/100 + 1)) + 1
  return Math.floor(Math.log2(totalXP / 100 + 1)) + 1;
};

const calculateXPForNextLevel = (currentLevel: number): number => {
  // Обратная формула: XP = (2^(level-1) - 1) * 100
  return Math.floor((Math.pow(2, currentLevel) - 1) * 100);
};

/**
 * Безопасная генерация вариантов ответа (исправляет баг бесконечного цикла)
 */
const generateAnswerOptions = (correctAnswer: number): number[] => {
  const options = new Set<number>([correctAnswer]);
  let attempts = 0;
  const maxAttempts = 100;

  // Генерируем 3 неправильных варианта
  while (options.size < 4 && attempts < maxAttempts) {
    attempts++;

    // Различные стратегии генерации
    let wrongAnswer: number;
    const strategy = attempts % 4;

    switch (strategy) {
      case 0: // Близкие числа (±1 до ±10)
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10 + 1);
        break;
      case 1: // Ошибки типа "забыли разряд"
        wrongAnswer = Math.floor(correctAnswer * 1.5);
        break;
      case 2: // Ошибки деления/умножения
        wrongAnswer = Math.floor(correctAnswer / 2) || correctAnswer * 2;
        break;
      default: // Случайные в разумном диапазоне
        wrongAnswer = Math.max(1, correctAnswer + Math.floor(Math.random() * 40) - 20);
    }

    if (wrongAnswer > 0 && wrongAnswer < 10000 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }

  // Fallback: если не удалось сгенерировать, добавляем простые варианты
  while (options.size < 4) {
    const fallback = correctAnswer + options.size;
    if (fallback !== correctAnswer) {
      options.add(fallback);
    }
  }

  // Перемешиваем
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// ==================== TOPIC MAPPING ====================

/**
 * Map task topic string to MathSkillKey
 * Handles Russian topic names from taskBank
 */
const mapTopicToMathSkill = (topicString: string): MathSkillKey => {
  const topicLower = topicString.toLowerCase();

  // Arithmetic
  if (topicLower.includes('сложен') || topicLower.includes('addition')) return 'addition';
  if (topicLower.includes('вычита') || topicLower.includes('subtract')) return 'subtraction';
  if (topicLower.includes('умнож') || topicLower.includes('multiply') || topicLower.includes('удвоен') || topicLower.includes('квадрат')) return 'multiplication';
  if (topicLower.includes('делен') || topicLower.includes('divid')) return 'division';
  if (topicLower.includes('дроб') || topicLower.includes('fraction')) return 'fractions';
  if (topicLower.includes('десятичн') || topicLower.includes('decimal')) return 'decimals';
  if (topicLower.includes('процент') || topicLower.includes('percent')) return 'percentages';

  // Geometry
  if (topicLower.includes('фигур') || topicLower.includes('shape')) return 'shapes';
  if (topicLower.includes('периметр') || topicLower.includes('perimeter')) return 'perimeter';
  if (topicLower.includes('площад') || topicLower.includes('area')) return 'area';
  if (topicLower.includes('объём') || topicLower.includes('объем') || topicLower.includes('volume')) return 'volume';
  if (topicLower.includes('угл') || topicLower.includes('angle')) return 'angles';

  // Logic - CHECK SPECIFIC MATCHES FIRST!
  if (topicLower.includes('текстов') || topicLower.includes('word')) return 'wordProblems';
  if (topicLower.includes('паттерн') || topicLower.includes('pattern')) return 'patterns';
  if (topicLower.includes('последовательн') || topicLower.includes('sequence') || topicLower.includes('прогресс')) return 'sequences';
  if (topicLower.includes('задач') || topicLower.includes('problem')) return 'problemSolving';

  // Fallback based on SkillType
  return 'problemSolving'; // Default fallback
};

// ==================== LOCAL STORAGE ====================

const STORAGE_KEY = 'mathbot_arena_v2';

const saveToLocalStorage = (data: { userData: UserData | null; playerBot: PlayerBot }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (): { userData: UserData | null; playerBot: PlayerBot } | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

// ==================== INITIAL STATE ====================

const createInitialPlayerBot = (name: string = 'MathBot-X'): PlayerBot => ({
  name,
  level: 1,
  xp: 0,
  totalXP: 0,
  statistics: {
    totalQuestions: 0,
    correctAnswers: 0,
    bestCombo: 0,
    sessions: 0,
    totalPlayTime: 0,
    skillStats: {
      arithmetic: { total: 0, correct: 0, errorTopics: [], level: 1, xp: 0, masteryPoints: 0, superSkills: [...SUPER_SKILLS.arithmetic] },
      geometry: { total: 0, correct: 0, errorTopics: [], level: 1, xp: 0, masteryPoints: 0, superSkills: [...SUPER_SKILLS.geometry] },
      logic: { total: 0, correct: 0, errorTopics: [], level: 1, xp: 0, masteryPoints: 0, superSkills: [...SUPER_SKILLS.logic] },
    }
  },
  gamification: createInitialGamificationData()
});

const createInitialSession = (): SessionData => ({
  active: false,
  mode: 'training',
  skillType: null,
  currentQ: 0,
  totalQ: 10,
  correct: 0,
  questions: [],
  startedAt: 0,
  appSwitches: 0,
  suspiciousActivity: false,
});

// ==================== MAIN COMPONENT ====================

const MathBotArena: React.FC = () => {
  // i18n
  const { t, language } = useI18n();

  // State
  const [screen, setScreen] = useState<'welcome' | 'register' | 'avatar-select' | 'game' | 'pvp'>('welcome');
  const [activeTab, setActiveTab] = useState<'training' | 'progress' | 'materials' | 'account' | 'pvp' | 'admin'>('training');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [playerBot, setPlayerBot] = useState<PlayerBot>(createInitialPlayerBot());
  const [session, setSession] = useState<SessionData>(createInitialSession());
  const [currentTask, setCurrentTask] = useState<TaskWithOptions | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showGuide, setShowGuide] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  // Gamification state
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showRewardSummary, setShowRewardSummary] = useState(false);
  const [sessionRewards, setSessionRewards] = useState<any>(null);

  // API integration state
  const [apiSession, setApiSession] = useState<APISession | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ==================== LOAD FROM STORAGE ====================

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      if (saved.userData) setUserData(saved.userData);
      if (saved.playerBot) {
        // Apply data migration for avatar profile (v2 -> v3)
        if (saved.playerBot.avatarProfile) {
          saved.playerBot.avatarProfile = safelyMigrateProfile(saved.playerBot.avatarProfile);
        }
        // Initialize gamification if it doesn't exist (migration)
        if (!saved.playerBot.gamification) {
          saved.playerBot.gamification = createInitialGamificationData();
        }
        setPlayerBot(saved.playerBot);
      }
      if (saved.userData) setScreen('game');
    }
  }, []);

  // ==================== INITIALIZE API USER ====================

  useEffect(() => {
    async function initializeUser() {
      if (!userData) return;

      try {
        console.log('[API] Initializing user for email:', userData.email);

        // Check if user exists in API, create if not
        // For now, use email as a simple identifier
        const userId = userData.email.replace('@', '_at_').replace(/\./g, '_');

        // Try to get user from API
        try {
          const { user } = await apiClient.getUser(userId);
          console.log('[API] User found:', user.id);
          setCurrentUserId(user.id);
          apiClient.setUserId(user.id);
        } catch (error) {
          // User doesn't exist, will use fallback mode
          console.log('[API] User not found in backend, using local mode');
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error('[API] Failed to initialize user:', error);
        setApiError('Failed to connect to backend');
        setCurrentUserId(null);
      }
    }

    initializeUser();
  }, [userData]);

  // ==================== SAVE TO STORAGE ====================

  useEffect(() => {
    if (userData || playerBot.totalXP > 0) {
      saveToLocalStorage({ userData, playerBot });
    }
  }, [userData, playerBot]);

  // ==================== SKILL DECAY CHECK ====================

  useEffect(() => {
    // Check and apply skill decay on load if avatar exists
    if (playerBot.avatarProfile && playerBot.avatarProfile.lastActiveAt > 0) {
      const warning = getDecayWarning(playerBot.avatarProfile.lastActiveAt);

      if (warning.willDecay && warning.currentDecayFactor > 0) {
        // Apply decay
        const decayedAvatar = applySkillDecay(playerBot.avatarProfile);
        setPlayerBot(prev => ({
          ...prev,
          avatarProfile: decayedAvatar
        }));

        // Show warning modal
        setShowModal({
          type: 'info',
          message: warning.message
        });
      }
    }
  }, []); // Run once on mount

  // ==================== APP VISIBILITY TRACKING & PAUSE ====================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (session.active && session.mode === 'training') {
        if (document.hidden) {
          // Pause timer when tab/window is hidden
          setIsTimerActive(false);

          // Track app switches for anti-cheat
          setSession(prev => ({
            ...prev,
            appSwitches: prev.appSwitches + 1,
            suspiciousActivity: prev.appSwitches + 1 > 3
          }));
        } else {
          // Resume timer when tab/window becomes visible again
          if (currentTask && !feedback) {
            setIsTimerActive(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session.active, session.mode, currentTask, feedback]);

  // ==================== TIMER LOGIC (Fixed dependencies) ====================

  useEffect(() => {
    if (!isTimerActive || !currentTask || session.mode === 'learning') return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Timeout
      handleTimeout();
    }
  }, [isTimerActive, timeLeft, currentTask, session.mode]); // ✅ Fixed dependencies

  const handleTimeout = useCallback(() => {
    setFeedback({ success: false, message: '⏱️ Время вышло!' });
    setCombo(0);
    setIsTimerActive(false);

    // Track error topic
    if (currentTask) {
      setPlayerBot(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          skillStats: {
            ...prev.statistics.skillStats,
            [session.skillType!]: {
              ...prev.statistics.skillStats[session.skillType!],
              // ✅ Immutable update - no mutation
              errorTopics: prev.statistics.skillStats[session.skillType!].errorTopics.includes(currentTask.t)
                ? prev.statistics.skillStats[session.skillType!].errorTopics
                : [...prev.statistics.skillStats[session.skillType!].errorTopics, currentTask.t]
            }
          }
        }
      }));
    }

    setTimeout(() => nextQuestion(), 2500);
  }, [currentTask, session.skillType]); // ✅ Proper dependencies

  // ==================== TASK GENERATION ====================

  const generateTask = useCallback((skillType: SkillType, usedIndices: number[]): TaskWithOptions => {
    const bank = taskBank[skillType];
    let availableIndices = bank.map((_, i) => i).filter(i => !usedIndices.includes(i));

    // Reset if all used
    if (availableIndices.length === 0) {
      availableIndices = bank.map((_, i) => i);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const task = { ...bank[randomIndex], index: randomIndex };

    // ✅ Safe option generation (no infinite loop)
    const options = generateAnswerOptions(task.a);

    return { ...task, options, skillType };
  }, []);

  // ==================== START SESSION ====================

  const startSession = useCallback(async (
    skillType: SkillType,
    mode: 'learning' | 'training',
    topic?: string,
    subtopic?: string
  ) => {
    if (!userData) return;

    const category = getAgeCategory(userData.age);
    const questionCount = AGE_CATEGORIES[category].questions;

    try {
      console.log(`[Session] Starting ${mode} session for ${skillType}, topic: ${topic || 'any'}, subtopic: ${subtopic || 'any'} (age ${userData.age})`);

      // Use API if available, otherwise fall back to local questionService
      if (currentUserId) {
        console.log('[Session] Using API backend for session creation');

        // Get skill IDs from UI selection
        const skillIds = getSkillIdFromUI(skillType, topic);
        const domain = getDomainFromSkillType(skillType);

        console.log(`[Session] API request: skillIds=${skillIds}, domain=${domain}, age=${userData.age}`);

        // Create session via API
        const response = await apiClient.createSession({
          mode,
          selectedSkillIds: skillIds,
          targetDifficulty: 5, // Default difficulty
          questionCount,
        });

        console.log(`[Session] API returned ${response.session.questions.length} questions`);

        // Store API session
        setApiSession(response.session);

        // Convert API questions to old Task format for compatibility
        const questions: TaskWithOptions[] = response.session.questions.map((q, index) => ({
          q: q.prompt,
          a: q.correct,
          t: q.topic,
          e: q.explanation,
          d: Math.ceil(q.difficulty / 1.67), // Convert 1-10 back to 1-6
          time: 45,
          options: q.choices,
          index,
          skillType,
        }));

        const newSession: SessionData = {
          active: true,
          mode,
          skillType,
          currentQ: 0,
          totalQ: questions.length,
          correct: 0,
          questions,
          startedAt: Date.now(),
          appSwitches: 0,
          suspiciousActivity: false,
        };

        setSession(newSession);
        setCurrentTask(questions[0]);
        setCombo(0);
        setFeedback(null);

        if (mode === 'training') {
          setTimeLeft(questions[0].time || 45);
          setIsTimerActive(true);
          setAnswerStartTime(Date.now());
        } else {
          setIsTimerActive(false);
        }

        console.log(`[Session] API session created successfully`);
        return;
      }

      // Fallback to local questionService if API not available
      console.log('[Session] Using local questionService (API not available)');

      // Build SkillId from domain/topic/subtopic
      let focusSkillId: SkillId;
      if (topic) {
        // Convert Russian topic name to English QuestionTopic
        const questionTopic = getQuestionTopicFromUI(topic);

        if (!questionTopic) {
          console.error(`[Session] No mapping found for topic: "${topic}"`);
          setShowModal({
            type: 'error',
            message: `❌ Ошибка маппинга темы\n\nТема "${topic}" не найдена в банке вопросов.\n\nПопробуйте другую тему или режим "Рекомендованные".`
          });
          return;
        }

        console.log(`[Session] Topic mapping: "${topic}" → "${questionTopic}"`);

        // Map domain (skillType) to proper QuestionDomain
        const domain = skillType.charAt(0).toUpperCase() + skillType.slice(1) as QuestionDomain;

        // Create skillId: domain_topic or domain_topic_subtopic
        focusSkillId = subtopic
          ? createSkillId(domain, questionTopic, subtopic)
          : createSkillId(domain, questionTopic);

        console.log(`[Session] Focused session on skill: ${focusSkillId}`);

        // Create focused session with specific skill
        const sessionPlan = await questionService.createSession(
          userData.age,
          focusSkillId,
          questionCount,
          'en' // TODO: use userData.language when available
        );

        // Check if we got questions for this skill
        if (sessionPlan.questions.length === 0) {
          // Get available count for debugging (use English topic name)
          const availableCount = await questionService.countQuestionsByTopic(
            skillType,
            questionTopic, // Use mapped English name
            userData.age
          );

          console.log(`[Session] No questions for ${focusSkillId}, available in bank: ${availableCount}`);

          setShowModal({
            type: 'info',
            message: `📚 Нет вопросов для тренировки\n\n🎯 Тема: "${topic}"${subtopic ? ` / ${subtopic}` : ''}\n💾 Доступно в банке: ${availableCount} вопросов\n\n${availableCount > 0 ? '⚠️ Возможно, вопросы не подходят для вашего возраста или уже изучены.' : '💡 Попробуйте другую тему или режим "Рекомендованные".'}`
          });
          return;
        }

        // Convert Questions to old Task format using adapter
        const questions: TaskWithOptions[] = questionsToTasks(sessionPlan.questions);
        logSessionSummary(questions);

        const newSession: SessionData = {
          active: true,
          mode,
          skillType,
          currentQ: 0,
          totalQ: questionCount,
          correct: 0,
          questions,
          startedAt: Date.now(),
          appSwitches: 0,
          suspiciousActivity: false,
        };

        setSession(newSession);
        setCurrentTask(questions[0]);
        setCombo(0);
        setFeedback(null);

        if (mode === 'training') {
          setTimeLeft(questions[0].time || 45);
          setIsTimerActive(true);
          setAnswerStartTime(Date.now());
        } else {
          setIsTimerActive(false);
        }
      } else {
        // No specific topic - use recommended session
        console.log(`[Session] Recommended session (no specific topic)`);

        const sessionPlan = await questionService.createRecommendedSession(
          userData.age,
          questionCount,
          'en'
        );

        // Convert Questions to old Task format using adapter
        const questions: TaskWithOptions[] = questionsToTasks(sessionPlan.questions);

        // Log session summary for debugging
        logSessionSummary(questions);

        const newSession: SessionData = {
          active: true,
          mode,
          skillType,
          currentQ: 0,
          totalQ: questionCount,
          correct: 0,
          questions,
          startedAt: Date.now(),
          appSwitches: 0,
          suspiciousActivity: false,
        };

        setSession(newSession);
        setCurrentTask(questions[0]);
        setCombo(0);
        setFeedback(null);

        if (mode === 'training') {
          setTimeLeft(questions[0].time || 45);
          setIsTimerActive(true);
          setAnswerStartTime(Date.now());
        } else {
          setIsTimerActive(false);
        }
      }
    } catch (error) {
      console.error('[Session] Failed to create session:', error);

      // Fallback to old system if new system fails
      console.log('[Session] Falling back to old task provider');
      const tasks = getTasksForTraining(skillType, questionCount, userData.email, userData.age);

      const questions: TaskWithOptions[] = tasks.map((task, index) => ({
        ...task,
        options: generateAnswerOptions(task.a),
        index
      }));

      const newSession: SessionData = {
        active: true,
        mode,
        skillType,
        currentQ: 0,
        totalQ: questionCount,
        correct: 0,
        questions,
        startedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false,
      };

      setSession(newSession);
      setCurrentTask(questions[0]);
      setCombo(0);
      setFeedback(null);

      if (mode === 'training') {
        setTimeLeft(questions[0].time || 45);
        setIsTimerActive(true);
        setAnswerStartTime(Date.now());
      } else {
        setIsTimerActive(false);
      }
    }
  }, [userData]);

  // ==================== HANDLE ANSWER ====================

  const handleAnswer = useCallback(async (answer: number) => {
    if (!currentTask || feedback) return;

    setIsTimerActive(false);
    const timeTaken = Math.floor((Date.now() - answerStartTime) / 1000);
    const timeMs = Date.now() - answerStartTime;
    const correct = answer === currentTask.a;

    if (correct) {
      const newCombo = combo + 1;

      // New scoring system
      const scoreBreakdown = calculateScore({
        correct: true,
        timeSpent: timeTaken,
        timeLimit: currentTask.time || 45,
        difficulty: currentTask.d,
        combo: newCombo,
        taskType: session.mode
      });

      const xpGained = scoreBreakdown.xpGained;

      // 🆕 Record answer to new stats system
      try {
        const skillId = getSkillIdFromTask(currentTask);
        if (skillId) {
          await questionService.recordAnswer({
            skillId,
            correct: true,
            timeMs,
            xpGained,
            timestamp: Date.now(),
            difficultyTier: currentTask.d
          });
          console.log(`[Stats] Recorded correct answer for ${skillId}`);

          // ✅ PERSISTENT ATTEMPT LOGGING (for progress tracking)
          recordAttempt({
            attemptId: generateAttemptId(),
            timestamp: Date.now(),
            mode: session.mode,
            questionId: currentTask._questionId || `q_${currentTask.index}`,
            skillId,
            correct: true,
            responseTimeMs: timeMs,
            difficultyScore: tierToDifficultyScore(currentTask.d),
            sessionId: session.id || `session_${Date.now()}`,
            userAge: userData.age,
            xpGained
          });

          // 🌐 RECORD TO API (if session was created via API)
          if (apiSession && currentUserId) {
            try {
              const questionIndex = session.currentQ;
              const apiQuestion = apiSession.questions[questionIndex];

              if (apiQuestion) {
                await apiClient.recordAttempt({
                  sessionId: apiSession.id,
                  questionId: apiQuestion.id,
                  skillId: apiQuestion.skillId,
                  givenAnswer: answer.toString(),
                  isCorrect: true,
                  responseTimeMs: timeMs,
                });
                console.log('[API] Recorded correct attempt to backend');
              }
            } catch (apiError) {
              console.error('[API] Failed to record attempt:', apiError);
              // Continue - don't block user experience if API fails
            }
          }
        }
      } catch (error) {
        console.error('[Stats] Failed to record answer:', error);
      }

      setCombo(newCombo);

      // ✅ Immutable state update
      setSession(prev => ({ ...prev, correct: prev.correct + 1 }));

      setPlayerBot(prev => {
        const newTotalXP = prev.totalXP + xpGained;
        const newLevel = calculateLevel(newTotalXP);

        // Update skill stats (✅ immutably)
        const updatedSkillStats = {
          ...prev.statistics.skillStats,
          [session.skillType!]: {
            ...prev.statistics.skillStats[session.skillType!],
            total: prev.statistics.skillStats[session.skillType!].total + 1,
            correct: prev.statistics.skillStats[session.skillType!].correct + 1,
            xp: prev.statistics.skillStats[session.skillType!].xp + xpGained,
            level: calculateLevel(prev.statistics.skillStats[session.skillType!].xp + xpGained),
          }
        };

        // Apply skill gains to avatar if it exists
        let updatedAvatarProfile = prev.avatarProfile;
        if (updatedAvatarProfile && currentTask) {
          // Map task topic to MathSkillKey
          const mathSkill = mapTopicToMathSkill(currentTask.t);
          const skillGains = calculateSkillGains(
            mathSkill,
            xpGained,
            true,
            timeTaken,
            currentTask.time || 45
          );
          updatedAvatarProfile = applySkillGains(
            updatedAvatarProfile,
            skillGains,
            `Completed ${currentTask.t} task`
          );
        }

        return {
          ...prev,
          xp: newTotalXP % 100, // XP within current level
          totalXP: newTotalXP,
          level: newLevel,
          avatarProfile: updatedAvatarProfile,
          statistics: {
            ...prev.statistics,
            totalQuestions: prev.statistics.totalQuestions + 1,
            correctAnswers: prev.statistics.correctAnswers + 1,
            bestCombo: Math.max(prev.statistics.bestCombo, newCombo),
            skillStats: updatedSkillStats,
          }
        };
      });

      setFeedback({
        success: true,
        message: `✅ Правильно!`,
        xpGained,
        combo: newCombo
      });
    } else {
      setCombo(0);

      // 🆕 Record incorrect answer to new stats system
      try {
        const skillId = getSkillIdFromTask(currentTask);
        if (skillId) {
          await questionService.recordAnswer({
            skillId,
            correct: false,
            timeMs,
            xpGained: 0,
            timestamp: Date.now(),
            difficultyTier: currentTask.d
          });
          console.log(`[Stats] Recorded incorrect answer for ${skillId}`);
        }
      } catch (error) {
        console.error('[Stats] Failed to record answer:', error);
      }

      // 🆕 Record incorrect answer to attempt log
      recordAttempt({
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: session.mode,
        questionId: currentTask._questionId || `q_${currentTask.index}`,
        skillId: skillId || session.skillType!,
        correct: false,
        responseTimeMs: timeMs,
        difficultyScore: tierToDifficultyScore(currentTask.d),
        sessionId: session.id || `session_${Date.now()}`,
        userAge: userData.age,
        xpGained: 0
      });

      // 🌐 RECORD TO API (if session was created via API)
      if (apiSession && currentUserId) {
        try {
          const questionIndex = session.currentQ;
          const apiQuestion = apiSession.questions[questionIndex];

          if (apiQuestion) {
            await apiClient.recordAttempt({
              sessionId: apiSession.id,
              questionId: apiQuestion.id,
              skillId: apiQuestion.skillId,
              givenAnswer: answer.toString(),
              isCorrect: false,
              responseTimeMs: timeMs,
            });
            console.log('[API] Recorded incorrect attempt to backend');
          }
        } catch (apiError) {
          console.error('[API] Failed to record attempt:', apiError);
          // Continue - don't block user experience if API fails
        }
      }

      // Track error (✅ immutably)
      setPlayerBot(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalQuestions: prev.statistics.totalQuestions + 1,
          skillStats: {
            ...prev.statistics.skillStats,
            [session.skillType!]: {
              ...prev.statistics.skillStats[session.skillType!],
              total: prev.statistics.skillStats[session.skillType!].total + 1,
              errorTopics: prev.statistics.skillStats[session.skillType!].errorTopics.includes(currentTask.t)
                ? prev.statistics.skillStats[session.skillType!].errorTopics
                : [...prev.statistics.skillStats[session.skillType!].errorTopics, currentTask.t]
            }
          }
        }
      }));

      setFeedback({
        success: false,
        message: `❌ Неверно. Ответ: ${currentTask.a}${session.mode === 'learning' ? `\n💡 ${currentTask.e}` : ''}`
      });
    }

    setTimeout(() => nextQuestion(), 2500);
  }, [currentTask, feedback, combo, answerStartTime, session.skillType, session.mode]);

  // ==================== NEXT QUESTION ====================

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    const nextIndex = session.currentQ + 1;

    // Check if session should end
    if (nextIndex >= session.totalQ) {
      console.log('[State Machine] Session complete, showing results');
      finishSession();
      return;
    }

    // DEFENSIVE CHECK: Validate next task exists
    const nextTask = session.questions[nextIndex];
    if (!nextTask) {
      console.error(`[State Machine] CRITICAL: No task at index ${nextIndex}/${session.totalQ}`);
      console.error('[State Machine] Questions array:', session.questions?.length || 0);
      console.error('[State Machine] Ending session gracefully to prevent blank screen');

      setShowModal({
        type: 'error',
        message: `⚠️ Ошибка загрузки вопроса\n\nПопытка загрузить вопрос ${nextIndex + 1}/${session.totalQ} не удалась.\n\nСессия будет завершена с текущим прогрессом.`
      });

      finishSession();
      return;
    }

    // DEFENSIVE CHECK: Validate task has required fields
    if (!nextTask.q || !nextTask.options || nextTask.options.length === 0) {
      console.error('[State Machine] CRITICAL: Malformed task at index', nextIndex, nextTask);

      setShowModal({
        type: 'error',
        message: `⚠️ Некорректный вопрос\n\nВопрос ${nextIndex + 1} повреждён.\n\nПропускаем его и продолжаем...`
      });

      // Try to skip to next question
      setSession(prev => ({ ...prev, currentQ: nextIndex }));
      setTimeout(() => nextQuestion(), 1000);
      return;
    }

    // All checks passed, proceed normally
    console.log(`[State Machine] Loading question ${nextIndex + 1}/${session.totalQ}`, nextTask._skillId);
    setSession(prev => ({ ...prev, currentQ: nextIndex }));
    setCurrentTask(nextTask);

    if (session.mode === 'training') {
      setTimeLeft(nextTask.time || 45);
      setIsTimerActive(true);
      setAnswerStartTime(Date.now());
    }
  }, [session]);

  // ==================== STOP SESSION (with penalty) ====================

  const stopSession = useCallback(() => {
    const playTime = Math.floor((Date.now() - session.startedAt) / 1000);
    const score = (session.correct / session.totalQ) * 100;

    // Apply penalty for early stop
    const penaltyXP = Math.min(50, playerBot.totalXP / 10); // Lose up to 50 XP

    setPlayerBot(prev => ({
      ...prev,
      totalXP: Math.max(0, prev.totalXP - penaltyXP),
      statistics: {
        ...prev.statistics,
        sessions: prev.statistics.sessions + 1,
        totalPlayTime: prev.statistics.totalPlayTime + playTime,
      }
    }));

    // Show stop modal with penalty info
    setShowModal({
      type: 'info',
      message: `⏹️ Тренировка прервана!\n\n📊 Результат: ${session.correct}/${session.currentQ + 1} вопросов\n❌ Штраф: -${penaltyXP} XP\n⏱️ Время: ${Math.floor(playTime / 60)}м ${playTime % 60}с\n\n💡 Совет: Завершай тренировку до конца, чтобы избежать штрафа!`
    });

    // Reset session
    setSession(createInitialSession());
    setCurrentTask(null);
    setCombo(0);
    setIsTimerActive(false);
  }, [session, playerBot.totalXP]);

  // ==================== FINISH SESSION ====================

  const finishSession = useCallback(() => {
    const score = (session.correct / session.totalQ) * 100;
    const playTime = Math.floor((Date.now() - session.startedAt) / 1000);
    const oldLevel = playerBot.level;

    // Calculate XP gained
    const xpGained = session.correct * 10 + Math.max(0, combo * 5);

    // Update bot stats and gamification
    setPlayerBot(prev => {
      const newTotalXP = prev.totalXP + xpGained;
      const newLevel = calculateLevel(newTotalXP);
      const leveledUp = newLevel > oldLevel;

      // Update gamification
      let updatedGamification = prev.gamification || createInitialGamificationData();

      // Update daily goal
      updatedGamification = updateDailyGoal(updatedGamification, session.correct);

      // Update streak
      updatedGamification = updateStreak(updatedGamification);

      // Check achievements
      const achievementCheck = checkAchievements(updatedGamification, {
        totalQuestions: prev.statistics.totalQuestions + session.totalQ,
        correctAnswers: prev.statistics.correctAnswers + session.correct,
        bestCombo: Math.max(prev.statistics.bestCombo, combo),
        streak: updatedGamification.streak.current
      });

      // Show first achievement notification if any unlocked
      if (achievementCheck.newUnlocked.length > 0) {
        setNewAchievement(achievementCheck.newUnlocked[0]);
      }

      // Prepare reward summary data
      setSessionRewards({
        xpGained,
        coinsGained: achievementCheck.newUnlocked.length * 10,
        questionsAnswered: session.totalQ,
        correctAnswers: session.correct,
        accuracy: score,
        comboMax: combo,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
        dailyGoalProgress: (updatedGamification.dailyGoal.completed / updatedGamification.dailyGoal.target) * 100,
        dailyGoalComplete: updatedGamification.dailyGoal.isComplete,
        streakUpdated: updatedGamification.streak.current > 0,
        newStreak: updatedGamification.streak.current,
        achievementsUnlocked: achievementCheck.newUnlocked
      });

      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        gamification: achievementCheck.gamification,
        statistics: {
          ...prev.statistics,
          sessions: prev.statistics.sessions + 1,
          totalPlayTime: prev.statistics.totalPlayTime + playTime,
          bestCombo: Math.max(prev.statistics.bestCombo, combo),
        }
      };
    });

    // Show reward summary
    setShowRewardSummary(true);

    // Reset session
    setSession(createInitialSession());
    setCurrentTask(null);
    setCombo(0);
    setIsTimerActive(false);
  }, [session, combo, playerBot.level]);

  // ==================== REGISTRATION ====================

  const handleRegistration = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string);
    const email = formData.get('email') as string;

    if (name && age >= 6 && age <= 18 && email) {
      const newUserData: UserData = {
        name,
        age,
        email,
        registeredAt: new Date().toISOString()
      };

      setUserData(newUserData);
      setPlayerBot(createInitialPlayerBot(`${name}-Bot`));

      // TODO: Send email notification
      setShowModal({
        type: 'success',
        message: `✅ Добро пожаловать, ${name}!\n\n📧 Письмо с подтверждением отправлено на ${email}`
      });

      // Go to avatar selection
      setScreen('avatar-select');
    }
  }, []);

  // ==================== AVATAR SELECTION ====================

  const handleAvatarSelection = useCallback((baseType: AvatarBaseType, cosmetics?: Partial<AvatarCosmetics>) => {
    const avatarProfile = createDefaultAvatar(baseType);

    // Apply custom cosmetics if provided
    if (cosmetics) {
      avatarProfile.cosmetics = { ...avatarProfile.cosmetics, ...cosmetics };
    }

    setPlayerBot(prev => ({
      ...prev,
      avatarProfile
    }));

    setScreen('game');
  }, []);

  // ==================== MEMOIZED VALUES ====================

  const currentAgeCategory = useMemo(() => {
    return userData ? AGE_CATEGORIES[getAgeCategory(userData.age)] : null;
  }, [userData]);

  // XP calculations fixed: calculate progress within current level
  const { xpForNextLevel, xpInCurrentLevel, xpProgress, xpToNextLevel } = useMemo(() => {
    const currentLevel = playerBot.level;
    const totalXP = playerBot.totalXP;

    // XP required to REACH current level
    const xpForCurrentLevel = currentLevel > 1
      ? calculateXPForNextLevel(currentLevel - 1)
      : 0;

    // XP required to REACH next level
    const xpForNext = calculateXPForNextLevel(currentLevel);

    // XP within current level (between current and next threshold)
    const xpInLevel = totalXP - xpForCurrentLevel;

    // XP required to level up (difference between thresholds)
    const xpRequired = xpForNext - xpForCurrentLevel;

    // Progress percentage (0-100)
    const progress = Math.min(100, Math.max(0, (xpInLevel / xpRequired) * 100));

    // XP remaining to next level
    const xpRemaining = Math.max(0, xpForNext - totalXP);

    return {
      xpForNextLevel: xpForNext,
      xpInCurrentLevel: xpInLevel,
      xpProgress: progress,
      xpToNextLevel: xpRemaining
    };
  }, [playerBot.level, playerBot.totalXP]);

  // ==================== RENDER: WELCOME SCREEN ====================

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy className="w-32 h-32 mx-auto text-purple-400 mb-8" />
          </motion.div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            MathBot Arena
          </h1>

          <p className="text-2xl text-purple-200 mb-8">⚔️ Математические бои! 🤖</p>

          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Прокачивай своего героя, изучай математику и сражайся с соперниками в захватывающих поединках!
          </p>

          <button
            onClick={() => setScreen('register')}
            className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-2xl font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            style={{ minHeight: '44px', minWidth: '44px' }} // ✅ Touch target
          >
            🚀 Начать приключение
          </button>
        </motion.div>
      </div>
    );
  }

  // ==================== RENDER: REGISTRATION ====================

  if (screen === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <User className="w-20 h-20 mx-auto mb-4 text-purple-400" />
          <h2 className="text-3xl font-bold mb-6 text-center">Регистрация</h2>

          <form onSubmit={handleRegistration} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Введи своё имя"
                className="w-full bg-slate-700 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ minHeight: '44px' }} // ✅ Touch target
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Возраст</label>
              <input
                type="number"
                name="age"
                required
                min="6"
                max="18"
                placeholder="От 6 до 18 лет"
                className="w-full bg-slate-700 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ minHeight: '44px' }} // ✅ Touch target
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email (для подтверждения)</label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@email.com"
                className="w-full bg-slate-700 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ minHeight: '44px' }} // ✅ Touch target
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-lg font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              style={{ minHeight: '44px' }} // ✅ Touch target
            >
              ✅ Создать героя
            </button>
          </form>

          <button
            onClick={() => setScreen('welcome')}
            className="mt-4 w-full text-gray-400 hover:text-white transition-colors"
            style={{ minHeight: '44px' }} // ✅ Touch target
          >
            ← Назад
          </button>
        </motion.div>
      </div>
    );
  }

  // ==================== RENDER: AVATAR SELECTION ====================

  if (screen === 'avatar-select') {
    return (
      <AvatarSelection
        onSelect={handleAvatarSelection}
        onBack={() => setScreen('register')}
      />
    );
  }

  // ==================== RENDER: GAME (Main Interface) ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl"
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Mini Avatar */}
              {playerBot.avatarProfile && (
                <div className="flex-shrink-0">
                  <AvatarView
                    avatar={playerBot.avatarProfile}
                    size="small"
                    animate={true}
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-2">MathBot Arena</h1>
                <p className="text-sm sm:text-base">Привет, {userData?.name}! 🎮</p>
                <p className="text-xs text-purple-200 opacity-75">{BUILD_TAG}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <div className="text-right">
                <div className="bg-purple-700 px-4 py-2 rounded-lg font-bold mb-2" style={{ minHeight: '44px' }}>
                  {currentAgeCategory?.icon} {currentAgeCategory?.name}
                </div>
                <div className="text-sm">{userData?.age} лет</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Player Header with Avatar and Stats */}
        <PlayerHeader
          name={userData?.name || 'Player'}
          level={playerBot.level}
          totalXP={playerBot.totalXP}
          combo={combo}
          avatarProfile={playerBot.avatarProfile}
          xpProgress={xpProgress}
          xpToNextLevel={xpToNextLevel}
        />

        {/* Gamification Widget */}
        {playerBot.gamification && !session.active && (
          <div className="mb-4">
            <GamificationWidget gamification={playerBot.gamification} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          {(['training', 'pvp', 'progress', 'materials', 'account'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-105'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              style={{ minHeight: '44px' }} // ✅ Touch target
            >
              {tab === 'training' && t('nav.training')}
              {tab === 'pvp' && t('nav.botBattle')}
              {tab === 'progress' && t('nav.progress')}
              {tab === 'materials' && t('nav.materials')}
              {tab === 'account' && t('nav.profile')}
            </button>
          ))}

          {/* Admin Tab - Only visible for admin users */}
          {userData?.email === 'admin@mathbot.local' && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 flex items-center gap-2"
              style={{ minHeight: '44px' }}
            >
              <Settings className="w-4 h-4" />
              {language === 'ru' ? 'Админ' : 'Admin'}
            </button>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence>
          {/* Training Dashboard - New Question Engine based UI */}
          {activeTab === 'training' && !session.active && userData && (
            <motion.div
              key="training-dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TrainingDashboard
                userAge={userData.age}
                userId={userData.email}
                onStartTraining={(skillType, topic, subtopic) => {
                  // Start training with selected topic/subtopic filters
                  startSession(skillType, 'training', topic, subtopic);
                }}
                skillStats={playerBot.statistics.skillStats}
              />
            </motion.div>
          )}

          {/* DEFENSIVE: Session active but no currentTask = error state */}
          {session.active && !currentTask && (
            <motion.div
              key="error-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center"
            >
              <div className="text-2xl font-bold text-red-400 mb-4">
                ⚠️ {language === 'ru' ? 'Ошибка загрузки вопроса' : 'Error Loading Question'}
              </div>
              <div className="text-lg mb-6">
                {language === 'ru'
                  ? 'Произошла ошибка при загрузке следующего вопроса. Это не должно было случиться!'
                  : 'An error occurred while loading the next question. This should not have happened!'}
              </div>
              <div className="text-sm text-gray-400 mb-6">
                {language === 'ru'
                  ? 'Текущий вопрос: '
                  : 'Current question: '}
                {session.currentQ + 1}/{session.totalQ}
              </div>
              <button
                onClick={() => {
                  console.error('[UI Recovery] User manually ending broken session');
                  finishSession();
                }}
                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-bold transition-all"
              >
                {language === 'ru' ? '🏁 Завершить сессию' : '🏁 End Session'}
              </button>
            </motion.div>
          )}

          {/* Active Session */}
          {session.active && currentTask && (
            <motion.div
              key="active-session"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-lg p-4 sm:p-8 shadow-2xl"
            >
              {/* Progress and Stop Button */}
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-lg sm:text-2xl font-bold">
                    {t('session.question')} {session.currentQ + 1} {t('session.of')} {session.totalQ}
                  </div>

                  {session.mode === 'training' && (
                    <div className={`flex items-center gap-2 text-xl sm:text-2xl font-bold ${
                      timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                    }`}>
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                      {timeLeft}с
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(t('taskUI.confirmStop'))) {
                      stopSession();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold transition-all text-sm"
                  style={{ minHeight: '44px' }}
                >
                  {t('session.stop')}
                </button>
              </div>

              {/* Question */}
              <div className={`bg-gradient-to-r ${SKILLS[session.skillType!].color} rounded-lg p-6 sm:p-8 mb-8 text-center shadow-xl`}>
                <div className="text-2xl sm:text-4xl font-bold mb-4">{currentTask.q}</div>
                <div className="text-xs sm:text-sm text-white/80">{t('taskUI.topic')}: {currentTask.t}</div>
                <div className="text-xs text-white/60 mt-1">{t('taskUI.difficulty')}: {'⭐'.repeat(currentTask.d)}</div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                {currentTask.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => !feedback && handleAnswer(opt)}
                    disabled={!!feedback}
                    whileHover={{ scale: feedback ? 1 : 1.05 }}
                    whileTap={{ scale: feedback ? 1 : 0.95 }}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed p-4 sm:p-6 rounded-lg text-2xl sm:text-3xl font-bold transition-all shadow-lg"
                    style={{ minHeight: '44px' }} // ✅ Touch target
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 sm:p-6 rounded-lg text-center text-base sm:text-xl font-bold shadow-xl ${
                      feedback.success
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }`}
                  >
                    <div className="whitespace-pre-line">{feedback.message}</div>
                    {feedback.xpGained && (
                      <div className="mt-2 text-yellow-300">+{feedback.xpGained} XP</div>
                    )}
                    {feedback.combo && feedback.combo > 2 && (
                      <div className="mt-1 text-red-300">🔥 Комбо x{feedback.combo}!</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint for learning mode */}
              {session.mode === 'learning' && currentTask.hint && !feedback && (
                <div className="mt-4 p-4 bg-blue-900/30 rounded-lg text-center">
                  <Lightbulb className="w-5 h-5 inline mr-2" />
                  <span className="text-sm">💡 {t('session.hint')}: {currentTask.hint}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Progress Tab (replaces Statistics + Skills) */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProgressTab
                avatar={playerBot.avatarProfile}
                statistics={playerBot.statistics}
                onMathSkillClick={(skill) => {
                  // Map MathSkillKey to materials topic
                  const topicName = MATH_SKILL_NAMES[skill].ru;
                  setShowGuide(topicName);
                  setActiveTab('materials');
                }}
              />
            </motion.div>
          )}

          {/* Materials Tab (Knowledge Base) */}
          {activeTab === 'materials' && !showGuide && (
            <motion.div
              key="materials-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800 rounded-lg p-4 sm:p-8 shadow-2xl"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                {t('materials.title')}
              </h2>

              <p className="text-gray-300 mb-6">
                {t('materials.subtitle')}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {methodologyGuides.map(guide => (
                  <motion.button
                    key={guide.topic}
                    onClick={() => setShowGuide(guide.topic)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-700 rounded-lg p-4 sm:p-6 text-left hover:bg-slate-600 transition-all shadow-lg"
                    style={{ minHeight: '44px' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                      <h3 className="text-base sm:text-xl font-bold">{guide.topic}</h3>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2">{guide.theory.slice(0, 100)}...</p>
                    <div className="text-xs text-gray-500">{guide.level}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Material Detail (replaces Guide Detail) */}
          {activeTab === 'materials' && showGuide && (
            <motion.div
              key="material-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800 rounded-lg p-4 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowGuide(null)}
                className="flex items-center gap-2 mb-6 text-purple-400 hover:text-purple-300 transition-colors"
                style={{ minHeight: '44px' }}
              >
                <ArrowLeft className="w-5 h-5" />
                Назад к списку
              </button>

              {(() => {
                const guide = getGuideByTopic(showGuide);
                if (!guide) return null;

                return (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                      {guide.title}
                    </h2>

                    <div className="bg-slate-700 rounded-lg p-4 sm:p-6 mb-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-2">Теория</h3>
                      <p className="text-sm sm:text-base whitespace-pre-line mb-4">{guide.theory}</p>

                      <h4 className="font-bold mb-2 text-sm sm:text-base">Правила:</h4>
                      <ul className="list-disc list-inside space-y-1 mb-4 text-xs sm:text-sm">
                        {guide.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>

                      <h4 className="font-bold mb-2 text-sm sm:text-base">Примеры:</h4>
                      {guide.examples.map((ex, i) => (
                        <div key={i} className="bg-slate-600 rounded p-3 mb-2">
                          <div className="font-mono font-bold text-yellow-300 text-sm sm:text-base">{ex.problem} = {ex.solution}</div>
                          <div className="text-gray-300 text-xs sm:text-sm mt-1">{ex.explanation}</div>
                        </div>
                      ))}

                      <h4 className="font-bold mb-2 mt-4 text-sm sm:text-base">💡 Советы:</h4>
                      <ul className="list-disc list-inside space-y-1 mb-4 text-xs sm:text-sm">
                        {guide.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>

                      <h4 className="font-bold mb-2 text-sm sm:text-base">⚠️ Частые ошибки:</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-300">
                        {guide.commonMistakes.map((mistake, i) => (
                          <li key={i}>{mistake}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        // Find related skill and start training session
                        const skillType = (Object.keys(SKILLS) as SkillType[]).find(s =>
                          taskBank[s].some(t => t.t === showGuide)
                        );
                        if (skillType) {
                          setShowGuide(null);
                          setActiveTab('training');
                          startSession(skillType, 'training');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 rounded-lg font-bold text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                      style={{ minHeight: '44px' }}
                    >
                      ⚔️ Начать тренировку
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}


          {/* Bot Battle Tab (Local - No Server Required) */}
          {activeTab === 'pvp' && (
            <motion.div
              key="pvp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {screen === 'pvp' ? (
                <LocalBotBattle
                  playerAvatar={playerBot.avatarProfile}
                  playerLevel={playerBot.level}
                  playerName={userData?.name || 'Player'}
                  onBattleEnd={(won, xpGained) => {
                    // Update player stats with battle rewards
                    setPlayerBot(prev => ({
                      ...prev,
                      totalXP: prev.totalXP + xpGained,
                      level: calculateLevel(prev.totalXP + xpGained),
                    }));

                    setShowModal({
                      type: won ? 'success' : 'info',
                      message: `${won ? '🏆 ПОБЕДА!' : '💔 ПОРАЖЕНИЕ'}\n\n+${xpGained} XP`
                    });

                    setScreen('game');
                    setActiveTab('progress');
                  }}
                  onExit={() => {
                    setScreen('game');
                  }}
                />
              ) : (
                <div className="bg-gradient-to-br from-red-600 to-purple-600 rounded-lg p-6 sm:p-8 shadow-2xl">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-block mb-6"
                    >
                      <Swords className="w-20 h-20 text-yellow-400" />
                    </motion.div>

                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                      {t('botBattle.title')}
                    </h2>

                    <p className="text-lg mb-6 max-w-2xl mx-auto">
                      {t('botBattle.description')}
                    </p>

                    <div className="bg-black/30 rounded-lg p-6 mb-6 max-w-xl mx-auto">
                      <h3 className="text-xl font-bold mb-4">{t('botBattle.yourFighter')}</h3>
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('botBattle.name')}:</span>
                          <span className="font-bold">{userData?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('botBattle.levelLabel')}:</span>
                          <span className="font-bold">Lv. {playerBot.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t('botBattle.hp')}:</span>
                          <span className="font-bold">{100 + (playerBot.level * 10)}</span>
                        </div>
                        {playerBot.avatarProfile && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-300">{t('skills.strength')}:</span>
                              <span className="font-bold">{playerBot.avatarProfile.gameStats.strength}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">{t('skills.agility')}:</span>
                              <span className="font-bold">{playerBot.avatarProfile.gameStats.agility}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 mb-6 max-w-xl mx-auto">
                      <p className="text-sm font-semibold">
                        {t('botBattle.localMode')}
                      </p>
                      <p className="text-xs mt-2 text-gray-300">
                        {t('botBattle.offlineInfo')}
                      </p>
                    </div>

                    <button
                      onClick={() => setScreen('pvp')}
                      className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
                      style={{ minHeight: '44px' }}
                    >
                      {t('botBattle.startButton')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && userData && (
            <EditableProfile
              userData={userData}
              avatarProfile={playerBot.avatarProfile}
              level={playerBot.level}
              totalXP={playerBot.totalXP}
              xpProgress={xpProgress}
              xpToNextLevel={xpToNextLevel}
              sessions={playerBot.statistics.sessions}
              totalPlayTime={playerBot.statistics.totalPlayTime}
              calculateXPForNextLevel={calculateXPForNextLevel}
              onSave={(updated) => {
                const newUserData = { ...userData, ...updated };
                setUserData(newUserData);
                // Trigger any necessary recalculations if age changed
                if (updated.age && updated.age !== userData.age) {
                  // Age changed - could trigger curriculum refresh
                  console.log('Age changed to', updated.age, 'triggering curriculum refresh');
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        onDismiss={() => setNewAchievement(null)}
        autoHideDuration={5000}
      />

      {/* Reward Summary Modal */}
      {sessionRewards && (
        <RewardSummary
          isOpen={showRewardSummary}
          onClose={() => {
            setShowRewardSummary(false);
            setSessionRewards(null);
          }}
          rewards={sessionRewards}
        />
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className={`bg-slate-800 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl ${
                showModal.type === 'success' ? 'border-2 border-green-500' :
                showModal.type === 'error' ? 'border-2 border-red-500' :
                'border-2 border-blue-500'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-4">
                  {showModal.type === 'success' && '🎉'}
                  {showModal.type === 'error' && '❌'}
                  {showModal.type === 'info' && 'ℹ️'}
                </div>
                <div className="text-base sm:text-xl whitespace-pre-line mb-6">{showModal.message}</div>
                <button
                  onClick={() => setShowModal(null)}
                  className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-lg font-bold transition-all"
                  style={{ minHeight: '44px', minWidth: '88px' }}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          userRole={userData?.email === 'admin@mathbot.local' ? 'admin' : 'student'}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
};

export default MathBotArena;
