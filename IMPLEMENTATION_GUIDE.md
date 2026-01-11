# 🚀 MathBot Arena - Implementation Guide

## ✅ Completed (Phase 1)

### 1. Core Infrastructure
- [x] React 18 + TypeScript setup
- [x] Vite 5 build configuration
- [x] Tailwind CSS styling
- [x] Framer Motion animations
- [x] Project structure and architecture

### 2. Content & Game Design
- [x] **300+ Mathematical Tasks** (arithmetic, geometry, logic)
- [x] **20+ Methodology Guides** with examples
- [x] **Comprehensive Game Design Document** (based on Duolingo/Khan Academy research)
- [x] Age-differentiated content (6-18 years)

### 3. Avatar System
- [x] **4 K-POP Anime Archetypes** (Scholar, Warrior, Artist, Engineer)
- [x] **60+ Customization Items** (hairstyles, colors, outfits, accessories, effects)
- [x] Rarity system (Common, Rare, Epic, Legendary)
- [x] Unlock mechanics (level, achievements, premium)
- [x] Data structures and helper functions

### 4. Internationalization
- [x] **i18n Framework** (EN/RU)
- [x] **500+ Translated Strings**
- [x] Auto-detect browser language
- [x] Language switcher
- [x] Ready for expansion (6+ languages planned)

### 5. Game Mechanics (Basic)
- [x] Training mode vs Learning mode
- [x] Timer system
- [x] XP calculation with modifiers
- [x] Combo system
- [x] Lives system
- [x] localStorage persistence
- [x] Basic skill progression

### 6. Bug Fixes
- [x] Immutable state updates
- [x] Proper useEffect dependencies
- [x] Safe answer generation
- [x] Touch-friendly UI (44x44px targets)
- [x] Responsive design

---

## 🔨 In Progress (Phase 2)

### Task List for Next Steps

#### 1. **Avatar Animation System** ⏳

**File**: `src/components/Avatar/AvatarDisplay.tsx`

```typescript
/**
 * Create animated avatar component with:
 * - Idle animation (breathing, blinking, floating)
 * - Victory animation (jump, confetti, glow)
 * - Defeat animation (stumble, sweat, tired)
 * - Level up animation (star burst, ascension)
 * - Skill activation animations
 *
 * Use Framer Motion variants for smooth animations
 * K-POP style: dynamic poses, particle effects, vibrant colors
 */

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  customization,
  state, // 'idle' | 'victory' | 'defeat' | 'levelup' | 'skill'
  size
}) => {
  // TODO: Implement
  // 1. SVG-based avatar rendering
  // 2. Layered composition (body, hair, outfit, accessories, effects)
  // 3. Framer Motion animations for each state
  // 4. Particle effects (use particles.js or custom Canvas)
  // 5. Responsive sizing (mobile, tablet, desktop)
};
```

**Animation Requirements:**
- **Idle**: Subtle bounce (2s loop), occasional blink (every 3-5s)
- **Victory**: Jump + spin (0.8s), confetti burst, +XP popup
- **Defeat**: Stumble back (0.5s), sweat drop, red flash
- **Level Up**: Float up (1s), gold glow, star burst, "LEVEL UP!" text
- **Skill**: Custom per archetype (lightning, holograms, etc.)

**References**:
- [Framer Motion docs](https://www.framer.com/motion/)
- [particles.js](https://vincentgarreau.com/particles.js/)
- K-POP MV aesthetics (dynamic, colorful, energetic)

---

#### 2. **Avatar Customization UI** ⏳

**File**: `src/components/Avatar/CustomizationPanel.tsx`

```typescript
/**
 * Create interactive customization panel:
 * - Tabs for each category (hair, color, outfit, etc.)
 * - Grid of items with rarity indicators
 * - Live preview of changes
 * - Lock/unlock indicators
 * - Purchase buttons for premium items
 * - Save/cancel functionality
 */

const CustomizationPanel: React.FC = () => {
  // TODO: Implement
  // 1. Category tabs (hair, hairColor, outfit, accessory, effect)
  // 2. Item grid with rarity colors/glows
  // 3. Real-time avatar preview
  // 4. Filter by unlocked/locked/premium
  // 5. Purchase flow for premium items
  // 6. Save to localStorage + backend (future)
};
```

---

#### 3. **Skill Dashboard** ⏳

**File**: `src/components/Skills/SkillDashboard.tsx`

```typescript
/**
 * Comprehensive skill view showing:
 * - Primary skills (Arithmetic, Geometry, Logic) with levels
 * - Secondary skills (Speed, Concentration, Adaptability, Resilience)
 * - Unique/Ultimate skills with unlock status
 * - Visual skill tree (interactive)
 * - Progress bars and XP indicators
 * - Unlock notifications
 */

interface SkillNode {
  id: string;
  name: { en: string; ru: string };
  type: 'primary' | 'secondary' | 'unique';
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  unlocked: boolean;
  dependencies: string[]; // Prerequisite skills
  effects: {
    description: { en: string; ru: string };
    value: number;
  }[];
}

const SkillDashboard: React.FC = () => {
  // TODO: Implement
  // 1. Interactive skill tree visualization
  // 2. Skill cards with progress bars
  // 3. Unlock animations
  // 4. Tooltips with detailed info
  // 5. Skill activation UI for ultimate skills
};
```

---

#### 4. **Adaptive Difficulty Engine** ⏳

**File**: `src/utils/adaptiveDifficulty.ts`

```typescript
/**
 * AI-driven difficulty adjustment based on:
 * - Recent accuracy (last 20 questions)
 * - Average response time
 * - Consecutive correct/wrong streaks
 * - Topic mastery levels
 * - Age and current level
 *
 * Algorithm from GAME_DESIGN.md
 */

interface PlayerPerformance {
  recentAccuracy: number;
  averageTime: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  topicMastery: Record<string, number>;
  currentLevel: number;
  age: number;
}

function calculateNextDifficulty(perf: PlayerPerformance): number {
  // TODO: Implement algorithm from GAME_DESIGN.md
  // 1. Base difficulty from level
  // 2. Accuracy adjustments
  // 3. Speed adjustments
  // 4. Streak modifiers
  // 5. Clamp between 1-6

  // Return difficulty level (1-6)
}

function selectNextTask(
  skillType: SkillType,
  difficulty: number,
  usedTasks: number[]
): Task {
  // TODO: Implement
  // 1. Filter tasks by difficulty
  // 2. Exclude recently used tasks
  // 3. Prefer topics with lower mastery
  // 4. Random selection from filtered pool
}
```

---

#### 5. **Skill Degradation System** ⏳

**File**: `src/utils/skillDegradation.ts`

```typescript
/**
 * Decay mechanics:
 * - Grace period: 5 days (no decay)
 * - Decay period: 7 days (gradual 20% loss)
 * - Recovery boost: 2x XP for degraded skills
 * - Welcome back bonus after 7+ days
 */

interface SkillState {
  level: number;
  xp: number;
  lastActive: Date;
}

function calculateDecay(skill: SkillState): SkillState {
  const now = new Date();
  const daysSince = (now.getTime() - skill.lastActive.getTime()) / (1000 * 60 * 60 * 24);

  // TODO: Implement
  // 1. Check if within grace period (5 days) → no decay
  // 2. Calculate decay progress (5-12 days)
  // 3. Apply 20% max decay gradually
  // 4. Return updated skill state
}

function getRecoveryMultiplier(skill: SkillState): number {
  // TODO: Return 2.0 for degraded skills, 1.0 for normal
}
```

---

#### 6. **Enhanced Training Types** ⏳

**File**: `src/components/Training/TrainingTypeSelector.tsx`

```typescript
/**
 * 6 Training types with different configurations:
 * 1. Quick Practice (5 questions, 1.0x coef)
 * 2. Standard Training (10-20 questions, 1.15x coef)
 * 3. Topic Mastery (15 questions, single topic, 1.3x coef)
 * 4. Mixed Challenge (20 questions, all topics, 1.5x coef)
 * 5. Blitz Mode (30 questions, 20s each, 1.8x coef)
 * 6. Marathon (50 questions, adaptive, 2.0x coef)
 */

interface TrainingType {
  id: string;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  questionCount: number;
  timePerQuestion: number;
  xpMultiplier: number;
  difficultyMode: 'fixed' | 'adaptive';
  topicMode: 'single' | 'mixed';
  icon: string;
  unlockLevel: number;
}

const TRAINING_TYPES: TrainingType[] = [
  // TODO: Define all 6 types from GAME_DESIGN.md
];
```

---

#### 7. **Speed Coefficient System** ⏳

**File**: Update `src/MathBotArena.tsx` → `calculateXPReward()`

```typescript
/**
 * Speed coefficient formula:
 * - First quarter (0-25% of time): 1.15x
 * - Second quarter (25-50%): 1.10x
 * - Third quarter (50-75%): 1.05x
 * - Final quarter (75-100%): 1.00x
 */

function calculateSpeedCoefficient(timeTaken: number, timeLimit: number): number {
  const ratio = timeTaken / timeLimit;

  if (ratio <= 0.25) return 1.15;
  if (ratio <= 0.50) return 1.10;
  if (ratio <= 0.75) return 1.05;
  return 1.00;
}

// Update calculateXPReward to use this
```

---

#### 8. **Pause Penalty & Quit Mechanics** ⏳

**File**: Update `src/MathBotArena.tsx`

```typescript
/**
 * Pause penalties:
 * - < 30s: No penalty
 * - 30s-2min: -5% XP
 * - 2-5min: -15% XP, lose combo
 * - > 5min: -30% XP, lose combo + 1 life
 *
 * Quit early:
 * - -50% XP for session
 * - No skill gains
 * - Warning modal
 */

const [pausedAt, setPausedAt] = useState<number | null>(null);
const [totalPauseTime, setTotalPauseTime] = useState(0);

const handlePause = () => {
  setPausedAt(Date.now());
  setIsTimerActive(false);
};

const handleResume = () => {
  if (pausedAt) {
    const pauseDuration = (Date.now() - pausedAt) / 1000;
    setTotalPauseTime(prev => prev + pauseDuration);
    setPausedAt(null);

    // Apply penalties
    if (pauseDuration > 300) { // 5 minutes
      setLives(prev => Math.max(0, prev - 1));
      setCombo(0);
    } else if (pauseDuration > 120) { // 2 minutes
      setCombo(0);
    }
  }
  setIsTimerActive(true);
};

const handleQuit = () => {
  if (confirm(t('quitWarning'))) {
    // Apply -50% penalty to earned XP
    const earnedXP = /* calculate */;
    const penalizedXP = Math.floor(earnedXP * 0.5);

    // Save with penalty
    finishSession(penalizedXP);
  }
};
```

---

#### 9. **Monetization Implementation** ⏳

**File**: `src/components/Shop/ShopSystem.tsx`

```typescript
/**
 * Shop features:
 * - Cosmetics (one-time purchases)
 * - Power-ups (consumables)
 * - Subscriptions (Premium, Family)
 * - In-app purchase integration (Stripe/PayPal for web)
 * - Restore purchases
 * - Premium feature gates
 */

interface ShopItem {
  id: string;
  type: 'cosmetic' | 'powerup' | 'subscription';
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  price: number; // USD
  currency: 'USD' | 'RUB';
  icon: string;
  preview?: string; // Image URL
}

const ShopSystem: React.FC = () => {
  // TODO: Implement
  // 1. Shop categories (Cosmetics, Power-Ups, Subscriptions)
  // 2. Item cards with purchase buttons
  // 3. Payment integration (Stripe, PayPal)
  // 4. Receipt validation
  // 5. Grant items to user
  // 6. Premium feature unlocks
};
```

**Premium Features to Gate:**
- [ ] Ad removal
- [ ] Unlimited sessions (free: 20/day)
- [ ] Extra lives (free: 2, premium: 5)
- [ ] Advanced customization items
- [ ] Detailed analytics dashboard
- [ ] Offline mode
- [ ] Early access features

---

#### 10. **Ad Integration (Free Tier)** ⏳

**File**: `src/components/Ads/AdSystem.tsx`

```typescript
/**
 * Ad strategy (non-intrusive):
 * - Frequency: Every 3rd session
 * - Type: Skippable video (5s skip)
 * - Placement: After session results
 * - Reward option: Watch ad for bonus XP
 *
 * Ad networks: Google AdMob (for future mobile apps)
 * For web: Google AdSense or custom video ads
 */

const AdSystem: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [skippable, setSkippable] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);

  useEffect(() => {
    // Make skippable after 5 seconds
    const timer = setTimeout(() => setSkippable(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // TODO: Implement
  // 1. Load ad from network
  // 2. Show countdown (5s)
  // 3. Show skip button after 5s
  // 4. Track completion
  // 5. Grant rewards
};
```

---

#### 11. **Expanded Task Bank** ⏳

**File**: `src/data/expandedTaskBank.ts`

**Target**: 1650+ tasks (current: 300)

**Age-based distribution:**
- 6-7 years: 150 tasks (numbers 1-20, basic shapes)
- 8-9 years: 200 tasks (numbers to 100, basic ×÷)
- 10-11 years: 250 tasks (fractions, geometry basics)
- 12-13 years: 300 tasks (algebra intro, advanced geometry)
- 14-15 years: 350 tasks (equations, proofs)
- 16+ years: 400 tasks (advanced algebra, calculus)

**New topics to add:**
```typescript
// Arithmetic
- Decimals (ages 9+)
- Percentages advanced
- Ratios and proportions
- Scientific notation
- Powers and roots
- Negative numbers

// Geometry
- 3D shapes (volume, surface area)
- Transformations (rotation, reflection)
- Trigonometry basics (sin, cos, tan)
- Coordinate geometry
- Vectors

// Logic
- Sets and Venn diagrams
- Basic probability
- Statistics (graphs, charts)
- Sequences and patterns
- Basic coding logic

// New Categories
- Measurement (time, money, units)
- Data Handling (tables, graphs)
- Algebra (variables, equations)
- Number Theory (primes, factors)
```

**Source for tasks:**
- Singapore Math textbooks
- Khan Academy problem sets
- Common Core standards
- Oxford Mathematics
- Mathletics
- AoPS (Art of Problem Solving)
- Olympiad preparation books

**TODO**:
1. Research and collect 1300+ new tasks
2. Categorize by age, topic, difficulty
3. Write explanations and hints
4. Add to `expandedTaskBank.ts`
5. Test age-appropriate filtering

---

#### 12. **QA Testing Checklist** ⏳

Create `QA_TEST_PLAN.md`:

**Functional Testing:**
- [ ] Registration flow (name, age, email validation)
- [ ] Avatar selection (all 4 archetypes)
- [ ] Customization (all items, unlock logic)
- [ ] Training mode (all 6 types)
- [ ] Learning mode (no timer, explanations)
- [ ] Timer accuracy (countdown, timeout)
- [ ] XP calculation (base + modifiers)
- [ ] Combo system (increment, reset)
- [ ] Lives system (lose, regenerate)
- [ ] Level up (correct XP threshold)
- [ ] Skill progression (primary, secondary)
- [ ] Adaptive difficulty (adjustment logic)
- [ ] Skill degradation (5 days grace, 20% max)
- [ ] Pause/resume (penalties apply)
- [ ] Quit (50% penalty)
- [ ] Language switch (EN ↔ RU)
- [ ] localStorage persistence
- [ ] Statistics accuracy
- [ ] Methodology guides display
- [ ] Error topics tracking

**UI/UX Testing:**
- [ ] All buttons clickable (44x44px min)
- [ ] Touch targets work on mobile
- [ ] Responsive layout (320px to 1920px)
- [ ] Animations smooth (60fps)
- [ ] Loading states
- [ ] Error messages clear
- [ ] Modals closeable
- [ ] Forms validate correctly

**Cross-Platform:**
- [ ] iPhone (Safari, Chrome)
- [ ] Android (Chrome, Samsung Browser)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Landscape/portrait modes

**Performance:**
- [ ] Load time < 3s
- [ ] No memory leaks
- [ ] Smooth scroll
- [ ] No layout shifts (CLS < 0.1)
- [ ] Offline mode works (PWA)

**Accessibility:**
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Font size adjustable
- [ ] Color blind friendly

---

## 📅 Implementation Timeline

### Week 1: Avatar Animations & Customization
- [ ] Day 1-2: Avatar animation component
- [ ] Day 3-4: Customization UI
- [ ] Day 5: Integration testing
- [ ] Day 6-7: Polish and bug fixes

### Week 2: Advanced Game Mechanics
- [ ] Day 1-2: Skill dashboard
- [ ] Day 3: Adaptive difficulty
- [ ] Day 4: Skill degradation
- [ ] Day 5: Training types
- [ ] Day 6-7: Speed coefficients & penalties

### Week 3: Content Expansion
- [ ] Day 1-3: Research and collect 1300+ new tasks
- [ ] Day 4-5: Implement expanded task bank
- [ ] Day 6-7: Age-based filtering & testing

### Week 4: Monetization & Polish
- [ ] Day 1-2: Shop system
- [ ] Day 3: Premium feature gates
- [ ] Day 4: Ad integration
- [ ] Day 5-6: QA testing (full checklist)
- [ ] Day 7: Final polish

### Week 5: Deployment & Launch
- [ ] Day 1-2: Production build optimization
- [ ] Day 3: Deploy to Vercel
- [ ] Day 4: Marketing materials (screenshots, videos)
- [ ] Day 5: Beta testing with real users
- [ ] Day 6-7: Bug fixes & iteration

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Testing (when tests are added)
npm run test
```

---

## 📦 Required Dependencies (Add to package.json)

```json
{
  "dependencies": {
    // Already installed
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",

    // Need to add
    "zustand": "^4.5.0", // State management
    "react-router-dom": "^6.22.0", // Routing (if multi-page)
    "react-hook-form": "^7.50.0", // Forms
    "zod": "^3.22.0", // Validation
    "@stripe/stripe-js": "^3.0.0", // Payments (premium)
    "react-hot-toast": "^2.4.1", // Notifications
    "chart.js": "^4.4.1", // Statistics charts
    "react-chartjs-2": "^5.2.0"
  }
}
```

---

## 🎯 Success Criteria

Before marking as "Done":

### Must Have
- [x] 300+ tasks (basic)
- [ ] 1650+ tasks (complete)
- [ ] 4 animated avatars
- [ ] Full customization (60+ items)
- [ ] EN/RU languages working
- [ ] Adaptive difficulty functional
- [ ] Skill degradation working
- [ ] All 6 training types
- [ ] Shop & monetization
- [ ] QA test plan 100% passed
- [ ] Mobile-friendly (tested on real devices)
- [ ] Performance: Lighthouse 90+

### Nice to Have
- [ ] Battle animations (advanced)
- [ ] PvP mode (multiplayer)
- [ ] Leaderboards
- [ ] Chat system
- [ ] Parent dashboard
- [ ] Email notifications
- [ ] Push notifications (PWA)

---

## 📖 Documentation

**For developers:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [GAME_DESIGN.md](./GAME_DESIGN.md) - Game mechanics & best practices
- [README.md](./README.md) - Setup instructions
- This file - Implementation guide

**For users:**
- Create `USER_GUIDE.md` with tutorials
- Create video tutorials (screen recordings)
- FAQs

---

## 🆘 Troubleshooting

### Common Issues

**1. i18n not working:**
```bash
# Check language initialization
console.log(getLanguage()); // Should be 'en' or 'ru'

# Force reload after language change
window.location.reload();
```

**2. Animations laggy:**
```typescript
// Reduce motion for low-end devices
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Use simpler animations
const variants = prefersReducedMotion ? simpleVariants : fullVariants;
```

**3. localStorage quota exceeded:**
```typescript
try {
  localStorage.setItem(key, value);
} catch (e) {
  // Clear old data
  if (e.name === 'QuotaExceededError') {
    localStorage.clear();
    localStorage.setItem(key, value);
  }
}
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables set
- [ ] API keys secured (never in git)
- [ ] Build errors: 0
- [ ] TypeScript errors: 0
- [ ] Lighthouse score: 90+
- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Analytics integrated
- [ ] Error tracking (Sentry)
- [ ] CDN configured
- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] SEO optimized (meta tags)

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
```

---

## 📞 Support & Resources

**Research Sources:**
- [Duolingo Gamification](https://strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [EdTech Best Practices](https://prodwrks.com/gamification-in-edtech-lessons-from-duolingo-khan-academy-ixl-and-kahoot/)
- [RPG Character Progression](https://medium.com/@carol.reed.597/designing-meaningful-character-progression-in-rpgs-a11ec3e73e4e)
- [Adaptive Learning](https://www.coursera.org/articles/adaptive-learning-platforms)

**Design Inspiration:**
- K-POP MVs (dynamic, colorful aesthetics)
- Genshin Impact (character design)
- Honkai: Star Rail (UI/UX)
- Among Us (customization system)

**Math Content:**
- [LogicLike.com](https://logiclike.com/math-logic)
- [Khan Academy](https://www.khanacademy.org/)
- [Brilliant.org](https://brilliant.org/)
- [AoPS](https://artofproblemsolving.com/)

---

**Last Updated**: 2026-01-11
**Version**: 2.0
**Status**: Phase 1 Complete, Phase 2 In Progress

**Next Milestone**: Avatar Animations + Customization UI (Week 1)
