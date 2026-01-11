/**
 * 🎨 Avatar View Component
 * Renders animated avatar with cosmetics (SVG-based, K-POP anime style)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AvatarProfile, AVATAR_BASES } from './types';

interface AvatarViewProps {
  avatar: AvatarProfile;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  showAura?: boolean;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  size = 'medium',
  animate = true,
  showAura = true
}) => {
  const baseConfig = AVATAR_BASES[avatar.baseType];

  const sizeMap = {
    small: { container: 64, avatar: 48 },
    medium: { container: 128, avatar: 96 },
    large: { container: 192, avatar: 144 }
  };

  const dimensions = sizeMap[size];

  // Hair style paths
  const getHairPath = () => {
    switch (avatar.cosmetics.hair) {
      case 'short':
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 20,40 30,40 Q 40,40 45,35 L 45,25 Q 45,15 40,20 Q 35,15 30,20 Z';
      case 'long':
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 15,50 20,55 L 25,60 Q 30,65 35,60 L 40,55 Q 45,50 45,35 L 45,25 Q 45,15 40,20 Q 35,15 30,20 Z';
      case 'spiky':
        return 'M 30,10 L 28,20 L 20,15 L 22,25 L 15,22 L 18,30 L 15,35 Q 20,40 30,40 Q 40,40 45,35 L 42,30 L 45,22 L 38,25 L 40,15 L 32,20 Z';
      case 'ponytail':
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 20,40 30,40 Q 40,40 45,35 L 45,25 Q 45,15 40,20 Q 35,15 30,20 M 45,30 Q 50,35 50,45 Q 48,50 45,48';
      case 'buns':
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 20,40 30,40 Q 40,40 45,35 L 45,25 Q 45,15 40,20 Q 35,15 30,20 M 12,18 Q 8,15 8,20 Q 8,25 12,22 M 48,18 Q 52,15 52,20 Q 52,25 48,22';
      case 'braided':
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 15,48 18,52 L 20,56 Q 22,60 25,58 M 30,20 Q 35,15 40,20 Q 45,15 45,25 L 45,35 Q 45,48 42,52 L 40,56 Q 38,60 35,58';
      default:
        return 'M 30,20 Q 25,15 20,20 Q 15,15 15,25 L 15,35 Q 20,40 30,40 Q 40,40 45,35 L 45,25 Q 45,15 40,20 Q 35,15 30,20 Z';
    }
  };

  // Aura effects
  const getAuraElement = () => {
    if (!showAura || avatar.cosmetics.aura === 'none') return null;

    const auraColor = baseConfig.colorScheme.glow;

    switch (avatar.cosmetics.aura) {
      case 'sparkles':
        return (
          <motion.g
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = 30 + Math.cos(angle) * 35;
              const y = 40 + Math.sin(angle) * 35;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={auraColor}
                  opacity="0.6"
                />
              );
            })}
          </motion.g>
        );
      case 'flames':
        return (
          <motion.path
            d="M 30,75 Q 25,70 28,65 Q 26,60 30,58 Q 34,60 32,65 Q 35,70 30,75"
            fill="url(#flameGradient)"
            animate={{
              d: [
                'M 30,75 Q 25,70 28,65 Q 26,60 30,58 Q 34,60 32,65 Q 35,70 30,75',
                'M 30,75 Q 23,68 26,63 Q 24,58 30,55 Q 36,58 34,63 Q 37,68 30,75',
                'M 30,75 Q 25,70 28,65 Q 26,60 30,58 Q 34,60 32,65 Q 35,70 30,75'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        );
      case 'electric':
        return (
          <motion.g
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <path
              d="M 10,20 L 15,30 L 12,30 L 18,45"
              stroke="#60A5FA"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 50,25 L 45,35 L 48,35 L 42,48"
              stroke="#60A5FA"
              strokeWidth="1.5"
              fill="none"
            />
          </motion.g>
        );
      case 'cosmic':
        return (
          <motion.circle
            cx="30"
            cy="40"
            r="40"
            fill="none"
            stroke="url(#cosmicGradient)"
            strokeWidth="2"
            opacity="0.4"
            animate={{
              rotate: 360
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        );
      case 'rainbow':
        return (
          <motion.circle
            cx="30"
            cy="40"
            r="38"
            fill="none"
            stroke="url(#rainbowGradient)"
            strokeWidth="3"
            opacity="0.5"
            animate={{
              rotate: 360,
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              opacity: { duration: 2, repeat: Infinity }
            }}
          />
        );
      default:
        return null;
    }
  };

  // Accessory overlay
  const getAccessory = () => {
    const { accessory } = avatar.cosmetics;
    const accentColor = baseConfig.colorScheme.accent;

    switch (accessory) {
      case 'glasses':
        return (
          <g>
            <rect x="18" y="28" width="8" height="6" rx="1" fill="none" stroke={accentColor} strokeWidth="1.5" />
            <rect x="34" y="28" width="8" height="6" rx="1" fill="none" stroke={accentColor} strokeWidth="1.5" />
            <line x1="26" y1="31" x2="34" y2="31" stroke={accentColor} strokeWidth="1.5" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            <path
              d="M 15,25 Q 15,15 30,15 Q 45,15 45,25"
              fill="none"
              stroke={accentColor}
              strokeWidth="3"
            />
            <rect x="12" y="25" width="6" height="8" rx="2" fill={accentColor} />
            <rect x="42" y="25" width="6" height="8" rx="2" fill={accentColor} />
          </g>
        );
      case 'cap':
        return (
          <ellipse cx="30" cy="18" rx="18" ry="6" fill={accentColor} />
        );
      case 'crown':
        return (
          <g>
            <path
              d="M 15,22 L 18,15 L 22,20 L 30,12 L 38,20 L 42,15 L 45,22 Z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1"
            />
          </g>
        );
      case 'halo':
        return (
          <motion.ellipse
            cx="30"
            cy="12"
            rx="12"
            ry="3"
            fill="none"
            stroke="#FDE047"
            strokeWidth="2"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dimensions.container, height: dimensions.container }}
    >
      <motion.svg
        viewBox="0 0 60 80"
        width={dimensions.avatar}
        height={dimensions.avatar}
        animate={animate ? {
          y: [0, -4, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="20%" stopColor="#F59E0B" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="60%" stopColor="#22C55E" />
            <stop offset="80%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <radialGradient id="bodyGradient">
            <stop offset="0%" stopColor={baseConfig.colorScheme.primary} />
            <stop offset="100%" stopColor={baseConfig.colorScheme.secondary} />
          </radialGradient>
        </defs>

        {/* Aura (background layer) */}
        {getAuraElement()}

        {/* Body */}
        <circle
          cx="30"
          cy="40"
          r="20"
          fill="url(#bodyGradient)"
          stroke={baseConfig.colorScheme.accent}
          strokeWidth="2"
        />

        {/* Face */}
        <g id="face">
          {/* Eyes */}
          <motion.ellipse
            cx="23"
            cy="38"
            rx="2.5"
            ry="3"
            fill="#1F2937"
            animate={animate ? {
              scaleY: [1, 0.1, 1]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
          <motion.ellipse
            cx="37"
            cy="38"
            rx="2.5"
            ry="3"
            fill="#1F2937"
            animate={animate ? {
              scaleY: [1, 0.1, 1]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />

          {/* Smile */}
          <path
            d="M 24,44 Q 30,47 36,44"
            fill="none"
            stroke="#1F2937"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Hair */}
        <path
          d={getHairPath()}
          fill={baseConfig.colorScheme.secondary}
          stroke={baseConfig.colorScheme.primary}
          strokeWidth="1.5"
        />

        {/* Accessory (top layer) */}
        {getAccessory()}
      </motion.svg>

      {/* Level badge (for medium/large) */}
      {size !== 'small' && (
        <div
          className="absolute bottom-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
          style={{
            width: size === 'large' ? 40 : 32,
            height: size === 'large' ? 40 : 32,
            fontSize: size === 'large' ? 16 : 12
          }}
        >
          {avatar.level}
        </div>
      )}
    </div>
  );
};

console.log('🎨 AvatarView component loaded');
