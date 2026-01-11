/**
 * 🎨 Avatar Selection Screen
 * Initial avatar selection with base type choice
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarBaseType, AVATAR_BASES, AvatarCosmetics } from './types';
import { AvatarView } from './AvatarView';
import { useI18n } from '../i18n/context';

interface AvatarSelectionProps {
  onSelect: (baseType: AvatarBaseType, cosmetics?: Partial<AvatarCosmetics>) => void;
  onBack?: () => void;
}

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect, onBack }) => {
  const { t, language } = useI18n();
  const [selected, setSelected] = useState<AvatarBaseType | null>(null);
  const [step, setStep] = useState<'selection' | 'customize'>('selection');

  const [customization, setCustomization] = useState<Partial<AvatarCosmetics>>({
    hair: 'short',
    colorPalette: 'default'
  });

  const handleSelect = (type: AvatarBaseType) => {
    setSelected(type);
  };

  const handleConfirm = () => {
    if (selected) {
      setStep('customize');
    }
  };

  const handleFinish = () => {
    if (selected) {
      onSelect(selected, customization);
    }
  };

  if (step === 'customize') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            {t('avatar.customizeTitle')}
          </h2>

          <div className="flex justify-center mb-8">
            <AvatarView
              avatar={{
                baseType: selected!,
                cosmetics: {
                  hair: customization.hair || 'short',
                  outfit: 'casual',
                  aura: 'none',
                  accessory: 'none',
                  colorPalette: customization.colorPalette || 'default'
                },
                coreSkills: { arithmetic: 10, geometry: 10, logic: 10, speed: 10, accuracy: 10, focus: 10 },
                secondarySkills: {} as any,
                uniquePerks: [],
                totalXP: 0,
                level: 1,
                lastTrainingAt: Date.now(),
                lastActiveAt: Date.now(),
                streak: 0,
                streakFrozen: false,
                rating: 1000,
                pvpRank: 0,
                dailyQuestsCompletedToday: 0,
                lastDailyQuestReset: Date.now(),
                skillHistory: []
              }}
              size="large"
            />
          </div>

          {/* Hair style selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Hair Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['short', 'long', 'spiky', 'ponytail'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => setCustomization(prev => ({ ...prev, hair: style }))}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    customization.hair === style
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('selection')}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
            >
              {t('common.back')}
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all"
            >
              {t('avatar.confirm')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{t('avatar.selectTitle')}</h1>
          <p className="text-xl text-gray-300">{t('avatar.selectDescription')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Object.keys(AVATAR_BASES) as AvatarBaseType[]).map(type => {
            const config = AVATAR_BASES[type];
            const isSelected = selected === type;

            return (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(type)}
                className={`cursor-pointer rounded-2xl p-6 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <AvatarView
                    avatar={{
                      baseType: type,
                      cosmetics: {
                        hair: 'short',
                        outfit: 'casual',
                        aura: 'none',
                        accessory: 'none',
                        colorPalette: 'default'
                      },
                      coreSkills: { arithmetic: 10, geometry: 10, logic: 10, speed: 10, accuracy: 10, focus: 10 },
                      secondarySkills: {} as any,
                      uniquePerks: [],
                      totalXP: 0,
                      level: 1,
                      lastTrainingAt: Date.now(),
                      lastActiveAt: Date.now(),
                      streak: 0,
                      streakFrozen: false,
                      rating: 1000,
                      pvpRank: 0,
                      dailyQuestsCompletedToday: 0,
                      lastDailyQuestReset: Date.now(),
                      skillHistory: []
                    }}
                    size="medium"
                  />
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">
                  {config.name[language]}
                </h3>

                <p className="text-sm text-gray-300 text-center mb-4">
                  {config.description[language]}
                </p>

                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold">Ultimate:</span>{' '}
                    {config.ultimateAbility.name[language]}
                  </div>
                  <div className="text-xs text-gray-400">
                    {config.ultimateAbility.description[language]}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex justify-center"
                  >
                    <div className="bg-white/20 rounded-full p-2">
                      ✓
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
            >
              {t('common.back')}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`px-12 py-4 rounded-xl font-bold text-xl transition-all ${
              selected
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {t('avatar.confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

console.log('🎨 AvatarSelection component loaded');
