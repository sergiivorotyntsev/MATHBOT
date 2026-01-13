/**
 * API Client for MATHBOT Backend
 *
 * Provides typed methods for interacting with Express backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ==================== TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gradeBand: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  domain: string;
  topic: string;
  subtopic: string | null;
  displayName: string;
  description: string;
  prerequisites: string[];
  gradeMin: string;
  gradeMax: string;
  estimatedMinutes: number;
  priority: number;
  ccssStandards: string[];
}

export interface Question {
  id: string;
  skillId: string;
  domain: string;
  topic: string;
  subtopic: string | null;
  difficulty: number;
  ageMin: number;
  ageMax: number;
  gradeMin: string;
  gradeMax: string;
  locale: string;
  prompt: string;
  choices: string[];
  correct: string;
  explanation: string;
  format: string;
  tags: string[];
  validated: boolean;
}

export interface Session {
  id: string;
  userId: string;
  mode: string;
  selectedSkillIds: string[];
  targetDifficulty: number;
  questionCount: number;
  startedAt: string;
  endedAt: string | null;
  questionsCompleted: number;
  correctCount: number;
  totalTimeMs: number;
  questions: Question[];
}

export interface SessionMetadata {
  dueCount: number;
  newCount: number;
  avgDifficulty: number;
  skillCoverage: string[];
}

export interface CreateSessionRequest {
  mode: string;
  selectedSkillIds: string[];
  targetDifficulty: number;
  questionCount: number;
}

export interface CreateSessionResponse {
  session: Session;
  metadata: SessionMetadata;
}

export interface Attempt {
  id: string;
  userId: string;
  sessionId: string;
  questionId: string;
  skillId: string;
  givenAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  createdAt: string;
}

export interface Mastery {
  id: string;
  userId: string;
  skillId: string;
  masteryScore: number;
  rollingAccuracy: number;
  streak: number;
  totalAttempts: number;
  correctAttempts: number;
  lastSeenAt: string | null;
  dueAt: string | null;
  easeFactor: number;
  repetitions: number;
  intervalDays: number;
  currentDifficulty: number;
}

// ==================== API CLIENT ====================

class APIClient {
  private baseUrl: string;
  private currentUserId: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set current user ID for authenticated requests
   */
  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.currentUserId;
  }

  // ==================== SKILLS ====================

  async getSkills(params?: {
    domain?: string;
    topic?: string;
    gradeMin?: string;
    gradeMax?: string;
  }): Promise<{ skills: Skill[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.domain) query.append('domain', params.domain);
    if (params?.topic) query.append('topic', params.topic);
    if (params?.gradeMin) query.append('gradeMin', params.gradeMin);
    if (params?.gradeMax) query.append('gradeMax', params.gradeMax);

    const url = `${this.baseUrl}/api/skills${query.toString() ? `?${query}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch skills: ${response.statusText}`);
    }

    return response.json();
  }

  async getSkill(skillId: string): Promise<{ skill: Skill; questionCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/skills/${skillId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch skill: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== SESSIONS ====================

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': this.currentUserId, // Simple auth for now
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to create session');
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<{ session: Session }> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`, {
      headers: {
        'X-User-Id': this.currentUserId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSession(sessionId: string, updates: {
    endedAt?: string;
    questionsCompleted?: number;
    correctCount?: number;
    totalTimeMs?: number;
  }): Promise<{ session: Session }> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': this.currentUserId,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== ATTEMPTS ====================

  async recordAttempt(attempt: {
    sessionId: string;
    questionId: string;
    skillId: string;
    givenAnswer: string;
    isCorrect: boolean;
    responseTimeMs: number;
  }): Promise<{ attempt: Attempt }> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const response = await fetch(`${this.baseUrl}/api/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': this.currentUserId,
      },
      body: JSON.stringify(attempt),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to record attempt');
    }

    return response.json();
  }

  // ==================== USERS ====================

  async getUser(userId: string): Promise<{ user: User; sessionCount: number; attemptCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
      headers: {
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  async getMastery(userId: string): Promise<{ mastery: Mastery[] }> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/mastery`, {
      headers: {
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mastery: ${response.statusText}`);
    }

    return response.json();
  }

  async getDueMastery(userId: string): Promise<{ due: Mastery[] }> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/mastery/due`, {
      headers: {
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch due mastery: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalAttempts: number;
    totalCorrect: number;
    accuracy: number;
    averageMastery: number;
    masteredSkills: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/stats`, {
      headers: {
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.statusText}`);
    }

    return response.json();
  }

  async getSkillStats(): Promise<Record<string, { count: number; domain: string; topic: string }>> {
    const response = await fetch(`${this.baseUrl}/api/skills/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch skill stats');
    }

    return response.json();
  }

  // ==================== HEALTH ====================

  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
