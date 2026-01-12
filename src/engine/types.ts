/**
 * 🎯 Question Engine Types - Core data models
 * Based on Common Core State Standards (CCSS)
 */

// ==================== COMMON CORE STRUCTURE ====================

export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export type Domain =
  | 'OA'   // Operations & Algebraic Thinking
  | 'NBT'  // Number & Operations in Base Ten
  | 'NF'   // Number & Operations - Fractions (Grade 3+)
  | 'MD'   // Measurement & Data
  | 'G'    // Geometry
  | 'RP'   // Ratios & Proportional Relationships (Grade 6+)
  | 'NS'   // The Number System (Grade 6+)
  | 'EE'   // Expressions & Equations (Grade 6+)
  | 'SP';  // Statistics & Probability (Grade 6+)

export interface CCSSStandard {
  grade: GradeLevel;
  domain: Domain;
  cluster: string;    // e.g., "A", "B", "C"
  standard: string;   // e.g., "1", "2", "3"
  description: string;
}

// ==================== QUESTION STRUCTURE ====================

export interface QuestionMetadata {
  questionId: string;           // Stable hash: templateId + params
  templateId: string;           // Generator template ID
  topic: string;                // Human-readable topic
  subtopic?: string;            // Specific subtopic

  // CCSS alignment
  gradeRange: [GradeLevel, GradeLevel];  // Min-max grades
  domains: Domain[];            // Related CCSS domains
  standards: string[];          // CCSS standard codes (e.g., "3.NF.A.1")

  // Difficulty
  difficulty: 1 | 2 | 3 | 4 | 5;  // 1=easiest, 5=hardest within grade
  cognitiveComplexity: 'recall' | 'application' | 'reasoning';

  // Skills (internal taxonomy)
  skills: string[];             // e.g., ["addition", "place-value"]
  prerequisites: string[];      // Required skills

  // Content tags
  tags: string[];               // e.g., ["word-problem", "visual", "multi-step"]
}

export interface QuestionContent {
  prompt: string;               // Question text
  choices?: string[];           // Multiple choice options
  correctAnswer: string | number;
  explanation: string;          // Why this answer
  hint?: string;                // Optional hint

  // Visuals (future)
  imageUrl?: string;
  diagram?: string;
}

export interface Question {
  metadata: QuestionMetadata;
  content: QuestionContent;

  // Generation params (for reproducibility)
  generationParams?: Record<string, any>;
  generatedAt?: number;
}

// ==================== QUESTION TEMPLATE ====================

export interface QuestionTemplate {
  id: string;                   // Template identifier
  name: string;
  description: string;

  // CCSS metadata
  gradeRange: [GradeLevel, GradeLevel];
  domains: Domain[];
  standards: string[];

  // Generation
  generator: (params: GeneratorParams) => Question;

  // Constraints
  maxVariations: number;        // Max unique questions from this template
  estimatedCount: number;       // Expected unique combinations
}

export interface GeneratorParams {
  seed: number;                 // Random seed
  difficulty: 1 | 2 | 3 | 4 | 5;
  grade: GradeLevel;
  options?: Record<string, any>;
}

// ==================== USER HISTORY ====================

export interface QuestionHistory {
  questionId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  lastSeen: number;             // timestamp
  lastResult: 'correct' | 'incorrect' | 'timeout';
  seenCount: number;

  // Performance
  avgTimeSeconds: number;
  fastestTimeSeconds: number;

  // Spaced repetition
  easeFactor: number;           // 1.3 - 2.5
  nextReviewDue: number;        // timestamp
  intervalDays: number;
}

export interface SkillHistory {
  skillId: string;

  // Rolling stats
  totalAttempts: number;
  correctCount: number;
  currentAccuracy: number;      // 0-100

  // Mastery
  mastery: number;              // 0-100
  level: number;                // Skill level (derived from mastery)
  streak: number;               // Current correct streak
  bestStreak: number;

  // Spaced repetition
  lastPracticed: number;        // timestamp
  nextReviewDue: number;
  decayRate: number;            // How fast mastery decays

  // Progress
  questionsAttempted: string[]; // questionIds
  questionsmastered: string[];  // questionIds with mastery
}

export interface UserHistory {
  userId: string;

  // Question history
  questionHistory: Map<string, QuestionHistory>;

  // Skill history
  skillHistory: Map<string, SkillHistory>;

  // Session tracking
  totalSessions: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;

  // Metadata
  lastActive: number;
  createdAt: number;
  version: number;              // For migrations
}

// ==================== SESSION STATE ====================

export interface SessionState {
  sessionId: string;
  mode: 'training' | 'battle' | 'assessment';

  // Filters
  grade: GradeLevel;
  topicFilter?: string;
  subtopicFilter?: string;
  difficultyBand?: [number, number];

  // Progress
  seenQuestionIds: Set<string>;
  currentQuestion?: Question;
  questionsAnswered: number;
  questionsCorrect: number;

  // Timing
  startedAt: number;
  currentQuestionStartedAt: number;

  // Anti-cheat
  appSwitches: number;
  suspiciousActivity: boolean;
}

// ==================== QUESTION ENGINE OUTPUT ====================

export interface QuestionSelection {
  question: Question;
  reason: 'new' | 'review' | 'weak-skill' | 'spaced-repetition' | 'random';
  confidence: number;           // 0-1, how good this selection is
}

console.log('🎯 Question Engine types loaded');
