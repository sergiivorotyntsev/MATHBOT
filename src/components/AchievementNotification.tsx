/**
 * 🏆 Achievement Notification - Animated popup when achievement unlocks
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Achievement } from '../types/gamification';
import { useI18n } from '../i18n/context';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss,
  autoHideDuration = 5000
}) => {
  const { language } = useI18n();

  useEffect(() => {
    if (achievement && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [achievement, autoHideDuration, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
          onClick={onDismiss}
        >
          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-slate-900 rounded-xl p-6 min-w-[320px] max-w-md">
              {/* Header with animation */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {language === 'ru' ? 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!' : 'ACHIEVEMENT UNLOCKED!'}
                  </div>
                </div>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </motion.div>
              </div>

              {/* Achievement Content */}
              <div className="flex items-start gap-4">
                <div className="text-5xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {language === 'ru' ? achievement.name.ru : achievement.name.en}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {language === 'ru' ? achievement.description.ru : achievement.description.en}
                  </p>
                  <div className="mt-3 text-yellow-400 font-bold text-sm flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    +10 {language === 'ru' ? 'монет' : 'coins'}
                  </div>
                </div>
              </div>

              {/* Tap to dismiss hint */}
              <div className="text-center text-xs text-gray-500 mt-4">
                {language === 'ru' ? 'Нажмите, чтобы закрыть' : 'Tap to dismiss'}
              </div>
            </div>
          </div>

          {/* Sparkle effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (50 + i * 20)],
                  y: [0, -50 - i * 10]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
