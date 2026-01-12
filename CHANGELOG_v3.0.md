# MathBot Arena v3.0 - GAME STATS REFACTOR

## 🚀 Статус рефакторинга: В ПРОЦЕССЕ (60% завершено)

Это масштабный рефакторинг системы прогресса с заменой CoreSkills/SecondarySkills на GameStats/MathSkills.

---

## ✅ ЗАВЕРШЕНО (PHASE 1-2)

### PHASE 1: Core Infrastructure (3 коммита)

**Созданные файлы:**

1. **`src/types/gameStats.ts`** (159 строк)
   - 7 новых RPG-статов: Strength, Agility, Defense, Magic, Wisdom, Luck, Focus
   - Icons, colors, descriptions (RU/EN)
   - Helper functions: createDefaultGameStats, clampStat, applyStatChanges

2. **`src/types/mathSkills.ts`** (195 строк)
   - 16 математических навыков (темы школьной математики)
   - Categories: Arithmetic (7), Geometry (5), Logic (4)
   - Age bands, prerequisites
   - Helper functions: createDefaultMathSkills, clampSkill, applySkillChanges

3. **`src/config/skillWeights.ts`** (352 строки)
   - Mapping: каждая тема → math skills + game stats
   - Пример: Addition → +60% addition, +40% strength, +30% focus
   - calculateSkillGains() с учетом difficulty, speed bonus

4. **`src/utils/dataMigration.ts`** (248 строк)
   - Миграция старых профилей БЕЗ ПОТЕРИ ПРОГРЕССА
   - arithmetic → strength, geometry → defense, logic → magic
   - wisdom = avg(arithmetic, geometry, logic)
   - Функции: migrateAvatarProfile, needsMigration, safelyMigrateProfile

5. **`src/avatar/types.ts`** (полностью переписан, 405 строк)
   - NEW: gameStats: GameStats вместо coreSkills
   - NEW: mathSkills: MathSkills вместо secondarySkills
   - Avatar bases теперь дают bonuses к gameStats
   - Backup сохранён: types.ts.backup

6. **`src/avatar/SkillsDashboard.v3.tsx`** (новый, 288 строк)
   - Раздельные панели: Game Stats (purple) vs Math Skills (blue)
   - Math skills — кликабельные кнопки → Materials
   - Fixed NaN issues с safeValue() clamping
   - Bilingual support для всех stat names

### PHASE 2: Skill Systems Update

7. **`src/skills/skillGain.ts`** (полностью переписан, 204 строки)
   - Использует skillWeights config
   - calculateSkillGains(topic: MathSkillKey, ...) → {mathSkills, gameStats}
   - applySkillGains() применяет к обеим системам
   - Helpers: getTotalMathProgress, getTotalGamePower, getSkillLevel
   - Backup: skillGain.ts.backup

8. **`src/skills/skillDecay.ts`** (полностью переписан, 251 строка)
   - Раздельные decay rates для game stats и math skills
   - Game stats: luck/agility decay fastest, wisdom slowest
   - Math skills: fractions/decimals fastest, patterns/problemSolving slowest
   - Те же 5-day grace period, 20% max decay
   - Backup: skillDecay.ts.backup

---

## ⏳ ОСТАЛОСЬ СДЕЛАТЬ (PHASE 3-5)

### 🔴 КРИТИЧЕСКИ ВАЖНО (для компиляции)

#### **A) Интеграция в MathBotArena.tsx** (БЛОКИРУЕТ компиляцию)

**Необходимые изменения:**

```typescript
// 1. Добавить импорты
import { safelyMigrateProfile } from './utils/dataMigration';

// 2. Применить миграцию в useEffect при загрузке
useEffect(() => {
  const saved = loadFromLocalStorage();
  if (saved) {
    // ДОБАВИТЬ МИГРАЦИЮ ЗДЕСЬ
    if (saved.playerBot.avatarProfile) {
      saved.playerBot.avatarProfile = safelyMigrateProfile(saved.playerBot.avatarProfile);
    }
    setUserData(saved.userData);
    setPlayerBot(saved.playerBot);
  }
}, []);

// 3. Обновить вызовы calculateSkillGains
// СТАРОЕ:
const gains = calculateSkillGains(taskType: SkillType, xp, correct, time, limit);
// НОВОЕ:
const gains = calculateSkillGains(topic: MathSkillKey, xp, correct, time, limit);

// 4. Обновить импорт SkillsDashboard
import { SkillsDashboard } from './avatar/SkillsDashboard.v3';

// 5. Добавить prop onMathSkillClick
<SkillsDashboard
  avatar={playerBot.avatarProfile}
  onMathSkillClick={(skill) => {
    // Navigate to Materials for this skill
    setCurrentView('materials');
    setSelectedMathSkill(skill);
  }}
/>
```

**Файлы для изменения:**
- `src/MathBotArena.tsx` (1569 строк) — основная интеграция

**Сложность:** HIGH (большой файл, много зависимостей)

#### **B) Обновить переводы** (БЛОКИРУЕТ UI)

**Добавить в `src/i18n/translations.ts`:**

```typescript
skills: {
  // ... existing ...

  // NEW: Game stats
  strength: string;
  agility: string;
  defense: string;
  magic: string;
  wisdom: string;
  luck: string;
  // focus already exists

  strengthDesc: string;
  agilityDesc: string;
  // ... etc
}
```

**Файлы для изменения:**
- `src/i18n/translations.ts` — добавить ~50 новых ключей

**Сложность:** LOW (простое добавление строк)

---

### 🟡 ВАЖНО (для функциональности)

#### **C) Создать Progress Tab** (объединить Skills + Statistics)

**Создать:**
- `src/components/ProgressTab.tsx` — новый tab с 3 блоками:
  1. BattleSummaryPanel (была Statistics)
  2. GameStatsPanel (новая)
  3. MathSkillsPanel (кликабельная)

**Удалить/объединить:**
- Старую вкладку "Statistics"
- Старую вкладку "Skills"

**Файлы:**
- NEW: `src/components/ProgressTab.tsx`
- MODIFY: `src/MathBotArena.tsx` — navigation tabs

**Сложность:** MEDIUM

#### **D) Создать Materials System** (заменить Learning Mode)

**Создать:**
- `src/components/MaterialsView.tsx` — база знаний по темам
- `src/data/materialsContent.ts` — контент (RU/EN) для каждой темы

**Структура контента:**
```typescript
interface MaterialContent {
  topic: MathSkillKey;
  title: { ru: string; en: string };
  ageRecommendation: string;
  content: {
    explanation: string;
    examples: string[];
    commonMistakes: string[];
    tips: string[];
  };
  references: { source: string; license: string }[];
}
```

**Удалить:**
- Learning Mode tab и вся логика

**Файлы:**
- NEW: `src/components/MaterialsView.tsx`
- NEW: `src/data/materialsContent.ts`
- MODIFY: `src/MathBotArena.tsx` — удалить learning mode

**Сложность:** HIGH (большой объем контента)

#### **E) Генератор задач** (~10,000 задач)

**Создать:**
- `src/data/taskGenerator.ts` — template-based generator

**Шаблоны по темам:**
- Addition: `{a} + {b}` где a, b зависят от age band
- Multiplication: `{a} × {b}`
- Area: `Площадь прямоугольника {w}×{h}`
- Patterns: `{seq}, ?` где seq — последовательность

**Детерминированность:** seed = userId + date + topic

**Файлы:**
- NEW: `src/data/taskGenerator.ts` (~500 строк)
- MODIFY: `src/data/taskBank.ts` — использовать generator

**Сложность:** HIGH (нужно много шаблонов)

---

### 🟢 ДОПОЛНИТЕЛЬНО (UX улучшения)

#### **F) SessionManager Integration**

**Интегрировать:**
- Pause/resume при переключении вкладок
- Stop button с penalty

**Файлы:**
- `src/session/SessionManager.tsx` уже существует
- MODIFY: `src/MathBotArena.tsx` — wrap app в SessionManagerProvider

**Сложность:** MEDIUM

#### **G) Bot Battle System** (заменить Real PvP)

**Создать:**
- `src/battle/botOpponent.ts` — локальная модель бота
- `src/components/BotBattleArena.tsx` — UI для боя с ботом

**Удалить:**
- Real PvP matchmaking UI
- WebSocket требование в PvP

**Файлы:**
- NEW: `src/battle/botOpponent.ts`
- NEW: `src/components/BotBattleArena.tsx`
- MODIFY: `src/components/BattleArena.tsx` — убрать real PvP

**Сложность:** MEDIUM

---

## 📊 Текущая статистика

**Созданные файлы:** 8 новых файлов
**Строк кода добавлено:** ~2,500 строк
**Backup файлов:** 3 (types.ts, skillGain.ts, skillDecay.ts)
**Коммитов:** 3
**Статус компиляции:** ❌ НЕ КОМПИЛИРУЕТСЯ (старые импорты сломаны)

---

## 🎯 Приоритетный план завершения

### Минимум для компиляции (2-3 часа работы):

1. **Интеграция в MathBotArena.tsx**
   - Добавить миграцию в loadFromLocalStorage
   - Обновить импорты skillGain/skillDecay
   - Обновить вызовы API
   - Заменить SkillsDashboard на v3

2. **Обновить переводы**
   - Добавить game stats names/descriptions
   - Добавить UI strings

3. **Type check и build**
   - Исправить все ошибки типов
   - Убедиться что npm run build проходит

### Полный функционал (1-2 дня работы):

4. **Progress Tab** — объединить Skills + Stats
5. **Materials System** — заменить Learning Mode
6. **Task Generator** — ~10k задач
7. **SessionManager** — pause/stop integration
8. **Bot Battle** — заменить real PvP

---

## 🔍 Для тестирования миграции

**Создать тестовый профиль со старой структурой:**

```typescript
const oldProfile = {
  coreSkills: {
    arithmetic: 50,
    geometry: 40,
    logic: 60,
    speed: 30,
    accuracy: 70,
    focus: 55
  },
  secondarySkills: {
    addition: 40,
    // ... etc
  }
};

const migrated = safelyMigrateProfile(oldProfile);
console.log(migrated.gameStats.strength); // Should be ~50 (from arithmetic)
console.log(migrated.gameStats.defense); // Should be ~40 (from geometry)
```

---

## 📝 Замет ки

- Все изменения обратно совместимы через миграцию
- Старые save файлы НЕ потеряют прогресс
- NaN issues исправлены через clamp functions
- Новая система полностью типизирована (TypeScript strict mode)

---

**Дата начала:** 2026-01-12
**Последнее обновление:** 2026-01-12
**Текущая ветка:** `claude/review-math-bot-arena-OLrBM`
**Коммиты:** 1faa9b4, 8db9cee, 63a49cb

