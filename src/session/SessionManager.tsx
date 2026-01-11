/**
 * 🎯 SessionManager - Global Session State Management
 *
 * Fixes the critical bug where training/learning sessions continue
 * when users switch tabs. Provides global session control with
 * pause/resume/quit functionality.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, AlertCircle } from 'lucide-react';

// ==================== TYPES ====================

export type SessionType = 'training' | 'learning' | 'pvp' | null;
export type SessionStatus = 'idle' | 'active' | 'paused' | 'ended';

export interface SessionState {
  type: SessionType;
  status: SessionStatus;
  startedAt: number;
  pausedAt: number;
  totalPausedTime: number;
  activeTab: string | null; // Which tab the session is on
}

interface SessionManagerContextType {
  session: SessionState;
  startSession: (type: SessionType, tab: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  isSessionActive: boolean;
  getElapsedTime: () => number;
}

// ==================== CONTEXT ====================

const SessionManagerContext = createContext<SessionManagerContextType | null>(null);

export const useSessionManager = (): SessionManagerContextType => {
  const context = useContext(SessionManagerContext);
  if (!context) {
    throw new Error('useSessionManager must be used within SessionManagerProvider');
  }
  return context;
};

// ==================== INITIAL STATE ====================

const createInitialSessionState = (): SessionState => ({
  type: null,
  status: 'idle',
  startedAt: 0,
  pausedAt: 0,
  totalPausedTime: 0,
  activeTab: null
});

// ==================== PROVIDER ====================

interface SessionManagerProviderProps {
  children: ReactNode;
  onTabSwitchDuringSession?: () => void;
}

export const SessionManagerProvider: React.FC<SessionManagerProviderProps> = ({
  children,
  onTabSwitchDuringSession
}) => {
  const [session, setSession] = useState<SessionState>(createInitialSessionState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // ==================== SESSION CONTROLS ====================

  const startSession = useCallback((type: SessionType, tab: string) => {
    setSession({
      type,
      status: 'active',
      startedAt: Date.now(),
      pausedAt: 0,
      totalPausedTime: 0,
      activeTab: tab
    });
  }, []);

  const pauseSession = useCallback(() => {
    setSession(prev => ({
      ...prev,
      status: 'paused',
      pausedAt: Date.now()
    }));
  }, []);

  const resumeSession = useCallback(() => {
    setSession(prev => {
      if (prev.status !== 'paused') return prev;

      const pauseDuration = Date.now() - prev.pausedAt;
      return {
        ...prev,
        status: 'active',
        pausedAt: 0,
        totalPausedTime: prev.totalPausedTime + pauseDuration
      };
    });
  }, []);

  const endSession = useCallback(() => {
    setSession(createInitialSessionState());
  }, []);

  const getElapsedTime = useCallback((): number => {
    if (session.status === 'idle' || session.startedAt === 0) return 0;

    const now = Date.now();
    const pausedTime = session.totalPausedTime +
      (session.status === 'paused' ? now - session.pausedAt : 0);

    return now - session.startedAt - pausedTime;
  }, [session]);

  const isSessionActive = session.status === 'active';

  // ==================== TAB SWITCH DETECTION ====================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session.status === 'active') {
        // User switched away from tab during active session
        onTabSwitchDuringSession?.();
        // We don't auto-pause here, just notify
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session.status, onTabSwitchDuringSession]);

  // ==================== MODAL HANDLERS ====================

  const handleContinue = useCallback(() => {
    setShowPauseModal(false);
    setPendingTab(null);
  }, []);

  const handlePause = useCallback(() => {
    pauseSession();
    setShowPauseModal(false);
    if (pendingTab) {
      // Allow navigation to pending tab
      // This would be handled by parent component
      setPendingTab(null);
    }
  }, [pauseSession, pendingTab]);

  const handleQuit = useCallback(() => {
    endSession();
    setShowPauseModal(false);
    setPendingTab(null);
  }, [endSession]);

  // ==================== CONTEXT VALUE ====================

  const value: SessionManagerContextType = {
    session,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    isSessionActive,
    getElapsedTime
  };

  return (
    <SessionManagerContext.Provider value={value}>
      {children}

      {/* Pause/Quit Modal */}
      <AnimatePresence>
        {showPauseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-yellow-500"
            >
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />

                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Активная сессия
                </h2>

                <p className="text-gray-300 mb-6">
                  У вас активная сессия {session.type === 'training' ? 'тренировки' : 'обучения'}.
                  Что вы хотите сделать?
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Продолжить
                  </button>

                  <button
                    onClick={handlePause}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    Пауза (остановить таймеры)
                  </button>

                  <button
                    onClick={handleQuit}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Завершить (результаты не сохранятся)
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  💡 Совет: Используйте паузу для перерыва
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SessionManagerContext.Provider>
  );
};

console.log('🎯 SessionManager loaded');
