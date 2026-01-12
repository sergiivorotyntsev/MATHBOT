# 🎮 MathBot Arena

<div align="center">

![MathBot Arena Logo](https://via.placeholder.com/200x200/7B2CBF/FFFFFF?text=MathBot+Arena)

**Геймифицированная образовательная платформа для обучения математике детей 6-18 лет**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Демо](https://mathbot-arena-demo.vercel.app) • [Документация](./ARCHITECTURE.md) • [Отчёт о баге](https://github.com/yourusername/mathbot-arena/issues)

</div>

---

## 📖 Описание

**MathBot Arena** — это увлекательная образовательная платформа, которая превращает изучение математики в захватывающее приключение! Дети прокачивают своих героев, решая математические задачи, и сражаются за место в турнирной таблице.

### ✨ Ключевые особенности

#### 🎨 Avatar System (NEW v2.1)
- 🧑 **4 типа аватаров** - Scholar, Warrior, Artist, Engineer с уникальными бонусами
- ✨ **Визуальная кастомизация** - 6 причесок, 6 аур, 6 аксессуаров (SVG-анимации)
- 📊 **22 прокачиваемых навыка** - 6 основных + 16 дополнительных
- 📈 **Skill Dashboard** - визуализация прогресса с историей изменений
- 🔄 **Система затухания навыков** - 5-дневный grace period, затем 20% decay за 7 дней
- 🌐 **Полная i18n** - переключение RU/EN с сохранением выбора

#### 🎯 Gamification (NEW v2.1)
- ⚡ **Продвинутая система скоринга** - коэффициент скорости (1.00-1.15), сложности, комбо
- 📚 **300+ математических задач** по арифметике, геометрии и логике
- 🎁 **Ежедневные задания** - 14 шаблонов квестов с наградами
- 🔥 **Система серий** - ежедневные тренировки с заморозкой серии
- 📊 **Детальная аналитика** - отслеживание прогресса по каждому навыку

#### ⚔️ PvP Arena
- 🌐 **WebSocket Real-time** - мгновенные PvP батлы с matchmaking
- 🏆 **ELO рейтинг** - 7 рангов от Bronze до Legend
- 💥 **Боевая система** - критические удары, уклонения, блоки, ульты
- 🤖 **Система прогрессии героя** с логарифмическими уровнями

#### 📚 Learning & Training
- **Два режима**: Обучение (без таймера) и Тренировка (с комбо)
- 📖 **Методические материалы** с подробными объяснениями
- 🔥 **Система комбо** для мотивации последовательных правильных ответов
- ⚡ **Супер-скилы** разблокируются на высоких уровнях

#### 💻 Technical Excellence
- 💾 **Автоматическое сохранение** прогресса в localStorage
- 📱 **Адаптивный дизайн** для всех устройств (телефон, планшет, компьютер)
- 🛡️ **Анти-чит система** отслеживает подозрительную активность
- 🎨 **K-POP Аниме-стилистика** с Framer Motion анимациями
- ⚙️ **TypeScript Strict Mode** - 100% type safety

---

## 🚀 Быстрый старт

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0 (или yarn/pnpm)

### Установка

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/yourusername/mathbot-arena.git
cd mathbot-arena

# 2. Установите зависимости для клиента
npm install

# 3. Установите зависимости для сервера (для PvP Arena)
cd server
npm install
cd ..
```

### Запуск приложения

#### Только основной режим (обучение и тренировки)

```bash
# Запустите клиент
npm run dev

# Откройте в браузере
# http://localhost:3000
```

#### С PvP Arena (требуется 2 терминала)

**Терминал 1 - WebSocket сервер:**
```bash
cd server
npm run dev
```

**Терминал 2 - Клиент:**
```bash
npm run dev
```

**Откройте в браузере:**
- Окно 1: http://localhost:3000
- Окно 2: http://localhost:3000 (режим инкогнито для 2-го игрока)

**Тестирование PvP:**
1. Зарегистрируйте героев в обоих окнах
2. Перейдите на вкладку "🎮 PvP Арена"
3. Нажмите "Начать бой!" в обоих окнах
4. Система автоматически найдет матч и начнет бой!

### Доступные команды

```bash
# Клиент
npm run dev         # Запуск Vite dev-сервера (порт 3000)
npm run dev:server  # Запуск WebSocket сервера (порт 3001)
npm run build       # Сборка для production
npm run preview     # Предпросмотр production build
npm run lint        # Проверка кода с ESLint
npm run type-check  # Проверка типов TypeScript

# Сервер (в папке server/)
cd server
npm run dev         # Запуск в режиме разработки
npm run build       # Сборка TypeScript
npm start           # Запуск production сервера
```

### Конфигурация

Создайте файл `.env` в корне проекта (опционально):
```env
VITE_SERVER_URL=http://localhost:3001
```

Для сервера создайте `server/.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🏗️ Архитектура проекта

```
mathbot-arena/
├── src/
│   ├── battle/
│   │   └── battleMechanics.ts    # PvP боевая система
│   ├── components/
│   │   └── BattleArena.tsx       # PvP UI компонент
│   ├── hooks/
│   │   └── useBattleSocket.ts    # WebSocket хук
│   ├── data/
│   │   ├── taskBank.ts           # 300+ задач
│   │   ├── methodologyGuides.ts  # Методические материалы
│   │   └── avatars.ts            # Система аватаров
│   ├── MathBotArena.tsx          # Основной компонент
│   ├── main.tsx                  # Точка входа
│   └── index.css                 # Глобальные стили
├── server/                       # WebSocket сервер для PvP
│   ├── index.ts                  # Express + Socket.io
│   ├── battleManager.ts          # Matchmaking и боевая логика
│   ├── types.ts                  # Типы для сервера
│   └── package.json              # Зависимости сервера
├── public/                       # Статические файлы
├── ARCHITECTURE.md               # Подробная документация
├── PVP_ARENA_DESIGN.md           # Дизайн PvP системы
├── QUICKSTART_PVP.md             # Гайд по запуску PvP
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

**Документация:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Полная архитектура системы
- [PVP_ARENA_DESIGN.md](./PVP_ARENA_DESIGN.md) - Детальный дизайн PvP Arena
- [QUICKSTART_PVP.md](./QUICKSTART_PVP.md) - Быстрый старт для PvP
- [server/README.md](./server/README.md) - Документация WebSocket сервера

---

## 📚 DEV NOTES - Question Engine & Adaptive System

### 🏗️ Core Architecture

MathBot Arena uses a **template-based question generation system** with **adaptive difficulty** and **spaced repetition**. The system ensures:
- ✅ **No duplicate questions** within a session
- ✅ **Grade-aligned content** (K-12 standards)
- ✅ **Prerequisite enforcement** (no fractions before division)
- ✅ **Mastery-based progression** (prove understanding before advancing)
- ✅ **Fair bot battles** (same question pool and difficulty)

### 📦 Key Files

```
src/
├── types/
│   ├── question.ts          # Unified question schema (single source of truth)
│   ├── skillStats.ts        # Per-skill statistics and mastery tracking
│   └── gamification.ts      # Daily goals, streaks, achievements
├── engine/
│   ├── questionGenerator.ts # Template-based question generation (10,000+)
│   ├── sessionBuilder.ts    # Adaptive session builder (60/20/20 algorithm)
│   └── questionService.ts   # Integration layer (bridges old & new code)
└── utils/
    └── xpCalculations.test.ts # XP system tests (8 test cases)
```

### 🎲 How Questions Are Generated

#### 1. Template System

Each question template defines:
- **Domain** (Arithmetic/Geometry/Logic)
- **Topic** (Addition, Perimeter, Patterns, etc.)
- **Grade bands** (K-1, 2-3, 4-5, 6-7, 8-9, 10-12)
- **Difficulty tiers** (1-5 within each topic)
- **Prerequisites** (required skills before attempting)
- **Generate function** (deterministic based on seed)

Example template structure:
```typescript
{
  templateId: 'arithmetic_addition_basic',
  domain: 'Arithmetic',
  topic: 'Addition',
  gradeBands: ['K-1', '2-3', '4-5'],
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [],

  generate({ seed, gradeBand, tier, language }) {
    // Deterministic generation based on seed
    // Same seed = same question every time
    const rng = new SeededRandom(seed);
    const a = rng.nextInt(1, maxNum);
    const b = rng.nextInt(1, maxNum);
    return { prompt: `${a} + ${b}`, correctAnswer: a + b, ... };
  }
}
```

#### 2. Deterministic IDs

Questions have stable IDs: `templateId_variant_gradeBand_tier`

Example: `arithmetic_addition_basic_42_2-3_3`
- Template: addition
- Variant: 42 (0-99)
- Grade: 2-3
- Difficulty: 3

This ensures:
- Same question ID always generates the same question
- Questions can be referenced consistently
- No duplicates within or across sessions

#### 3. Scale: 10,000+ Questions

With current templates:
- 7 templates × 100 variants × 3-5 grade bands × 5 difficulty tiers
- **≈ 10,500 unique questions** generated deterministically
- Adding new templates multiplies question bank size

### 🧠 Adaptive Session Building

#### Algorithm: 60/20/20 Split

Each training session consists of:

1. **60% Focus Skill** - User-selected or weakest skill
   - Starts at appropriate difficulty tier based on mastery
   - Gradually increases difficulty (+1 tier every 3 questions)
   - Caps at user's max difficulty tier

2. **20% Prerequisite Reinforcement** - Foundation skills
   - Easier questions from prerequisite skills
   - Ensures foundational concepts stay fresh
   - Example: multiplication → addition reinforcement

3. **20% Spaced Review** - Previously learned skills
   - Skills not seen in 24 hours (if not mastered)
   - Skills not seen in 7 days (if mastered)
   - Skills with recent mistakes (prioritized)

#### Uniqueness Enforcement

```typescript
const usedQuestionIds = new Set<string>();

// Before adding question to session:
if (!usedIds.has(question.id)) {
  questions.push(question);
  usedIds.add(question.id);
}
```

This **guarantees** no repeats within a session.

#### Difficulty Progression

```typescript
// Start at skill-appropriate tier
let currentTier = determineStartingDifficulty(skillStats);

// Gradually increase (max +1 tier every 3 questions)
if (questionsAdded % 3 === 0 && currentTier < maxTier) {
  currentTier = Math.min(maxTier, currentTier + 1);
}
```

### 📊 Skill Tracking & Mastery

#### Per-Skill Statistics

For each skill, we track:
- `attempts` - Total questions attempted
- `correct` - Correct answers
- `accuracy` - Percentage (0-100)
- `currentStreak` - Consecutive correct
- `bestStreak` - All-time best streak
- `lastSeen` - Timestamp of last attempt
- `lastWrong` - Timestamp of last mistake
- `recentHistory` - Last 20 attempts (boolean array)
- `avgTimeMs` - Average answer time
- `masteryScore` - Computed 0-1 score

#### Mastery Calculation

Mastery score is computed from 4 factors:

```typescript
mastery = accuracy * 0.4      // 40%: Overall accuracy
        + recentPerf * 0.3    // 30%: Recent performance (last 20)
        + streakScore * 0.2   // 20%: Consistency (best streak)
        + recencyScore * 0.1  // 10%: How recent practice was
```

**Mastered** = mastery ≥ 0.7 AND attempts ≥ 5

#### Answer Recording

When user answers a question:

```typescript
const event: AnswerEvent = {
  skillId: question.skillId,
  correct: userAnswer === correctAnswer,
  timeMs: Date.now() - startTime,
  xpGained: calculateXP(...),
  timestamp: Date.now(),
  difficultyTier: question.difficultyTier
};

questionService.recordAnswer(event);
// → Updates stats
// → Checks for mastery
// → Saves to localStorage
// → Updates dashboard
```

### 🎮 Bot Battle Fairness

Bot battles use the **same question pool** as training:

1. **Session generation** - Build session with user's grade band
2. **Bot difficulty** - Matches user's level (±2 levels)
3. **Bot accuracy model** - Based on question difficulty:
   ```typescript
   botAccuracy = baseBotAccuracy * (1 - difficultyTier * 0.1);
   ```
4. **Bot timing** - Realistic answer delays (2-8 seconds)
5. **No cheating** - Bot doesn't know answer instantly

### ➕ Adding New Skills/Topics

#### Step 1: Create Template

```typescript
// src/engine/questionGenerator.ts

const myNewTemplate: QuestionTemplate = {
  templateId: 'domain_topic_variant',
  domain: 'Arithmetic', // or Geometry, Logic
  topic: 'My New Topic',
  gradeBands: ['4-5', '6-7'], // Which grades?
  difficultyTiers: [1, 2, 3, 4, 5],
  prerequisites: [createSkillId('Arithmetic', 'Addition')],
  tags: ['arithmetic', 'my-topic'],

  generate({ seed, gradeBand, tier, language }) {
    const rng = new SeededRandom(seed);

    // Generate question content based on tier and grade
    // Tier 1 = easiest, Tier 5 = hardest
    // Grade band affects number ranges

    return {
      language,
      prompt: "Your question text",
      choices: ["A", "B", "C", "D"],
      correctAnswer: "B",
      explanation: "Why this is correct",
      domain: 'Arithmetic',
      topic: 'My New Topic',
      gradeBand,
      ageBand: gradeBandToAgeBand(gradeBand),
      difficultyTier: tier,
      globalDifficulty: calculateGlobalDifficulty(gradeBand, tier),
      prerequisites: [...],
      tags: [...]
    };
  }
};

// Step 2: Register template
const ALL_TEMPLATES = [
  ...existingTemplates,
  myNewTemplate // Add here
];
```

#### Step 2: Generate Questions

```typescript
// Questions are auto-generated on first load
// Or regenerate manually:
localStorage.removeItem('mathbot_question_bank_v1');
// Refresh page → generates new bank with your template
```

#### Step 3: Test

```typescript
// In browser console:
const service = await import('./engine/questionService');
const session = await service.questionService.createSession(
  10, // age
  'arithmetic_my_new_topic', // your skill ID
  10 // questions
);
console.log(session.questions);
```

### 🐛 Debugging Stats/Dashboard Issues

If skill dashboard shows zeros after playing:

#### 1. Check Answer Recording

```typescript
// Browser console during session:
window.addEventListener('questionAnswered', (e) => {
  console.log('Answer recorded:', e.detail);
});
```

#### 2. Inspect Stats Store

```typescript
// Browser console:
const service = await import('./engine/questionService');
const stats = await service.questionService.exportStats();
console.table(stats.skills);
```

#### 3. Verify LocalStorage

```typescript
// Browser console:
const statsJson = localStorage.getItem('mathbot_skill_stats_v1');
console.log(JSON.parse(statsJson));
```

#### 4. Clear & Restart

```typescript
// Browser console:
const service = await import('./engine/questionService');
await service.questionService.clearAllData();
location.reload();
```

### 🧪 Running Tests

#### XP Calculation Tests

```bash
npx tsx src/utils/xpCalculations.test.ts
```

Tests verify:
- ✅ Progress never exceeds 100%
- ✅ XP requirements increase monotonically
- ✅ Level boundaries are correct
- ✅ Progress percentage is accurate

Expected output:
```
🧪 Running XP Calculation Tests...

✅ Level 1 at start
✅ Monotonic XP requirements
✅ Progress never exceeds 100%
✅ Progress at level boundary
✅ Level calculation matches boundary
✅ XP to next level decreases
✅ Known values
✅ Progress percentage correctness

📊 Results: 8 passed, 0 failed
```

### 🔑 Key Principles

1. **Single Source of Truth** - All questions conform to unified schema
2. **Deterministic Generation** - Same seed = same question
3. **No Repeats** - Set-based uniqueness enforcement
4. **Prerequisites First** - Can't attempt fractions without division
5. **Mastery-Based** - Progress only after demonstrating understanding
6. **Fair Competition** - Bot uses same pool, appropriate difficulty
7. **Spaced Review** - Brings back old topics at optimal intervals
8. **Adaptive Difficulty** - Matches user skill level dynamically

### 🚀 Performance Notes

- **Question Bank**: Generated once, cached in localStorage (≈2MB)
- **Stats Store**: Updated on each answer, saved to localStorage
- **Session Building**: O(n) where n = question count (typically <100ms)
- **Mastery Calculation**: O(1) per skill
- **No Backend Required**: Fully client-side (scales infinitely)

---

## 🎯 Основные функции

### Режимы игры

#### 📚 Режим обучения
- Без ограничения по времени
- Подробные объяснения после каждого ответа
- Подсказки для сложных задач
- Не влияет на рейтинг (идеально для изучения новых тем)

#### ⚔️ Режим тренировки
- Таймер на каждый вопрос (30-60 секунд)
- Система комбо за последовательные правильные ответы
- Бонусы XP за скорость
- Влияет на рейтинг и статистику

### Система прогрессии

```javascript
// Логарифмическая формула уровней
Level = floor(log2(TotalXP / 100 + 1)) + 1

// Расчёт XP с модификаторами
FinalXP = (BaseXP + ComboBonus + TimeBonus) × DifficultyMultiplier × SuperSkillMultiplier
```

| Уровень | Требуется XP | Описание |
|---------|--------------|----------|
| 1-5     | 0-1500       | Новичок |
| 6-10    | 1500-6300    | Ученик (разблокировка 1-го супер-скила) |
| 11-20   | 6300-52000   | Мастер (разблокировка 2-го супер-скила) |
| 21-30   | 52000-200K   | Эксперт (разблокировка 3-го супер-скила) |
| 31+     | 200K+        | Легенда |

### Супер-скилы

#### Арифметика ➕
- ⚡ **Молниеносный счёт** (Ур. 10): +50% XP за быстрые ответы
- 🛡️ **Математический щит** (Ур. 20): 1 ошибка не сбрасывает комбо
- 🔗 **Цепная реакция** (Ур. 30): Комбо x3 вместо x2

#### Геометрия 📐
- 👁️ **Пространственное видение** (Ур. 10): Показ подсказок
- 🏛️ **Архитектор** (Ур. 20): +30% XP за геометрические задачи
- ✨ **Золотое сечение** (Ур. 30): Бонус времени +15 сек

#### Логика 🧩
- 🔍 **Дедукция** (Ур. 10): Исключение 1 неверного варианта
- 🎯 **Мастер паттернов** (Ур. 20): Подсветка паттернов
- ⏰ **Временной варп** (Ур. 30): Заморозка таймера на 10 сек

---

## 📊 База данных задач

### Статистика

| Навык      | Задач | Уровни сложности | Темы |
|------------|-------|------------------|------|
| Арифметика | 100+  | 1-6              | 15   |
| Геометрия  | 80+   | 1-6              | 12   |
| Логика     | 120+  | 1-6              | 18   |
| **Всего**  | **300+** | **6**          | **45** |

### Источники

- [LogicLike.com](https://logiclike.com/math-logic) (5500 задач)
- [Deti-online.com](https://deti-online.com/zagadki/matematicheskie/) (математические загадки)
- Программа начальной и средней школы РФ
- Олимпиадные задачи
- Авторский контент

---

## 🎨 Технологический стек

### Frontend
- **React 18.3** с TypeScript
- **Framer Motion** для анимаций
- **Tailwind CSS** для стилизации
- **Lucide React** для иконок
- **Vite 5** в качестве сборщика

### Возможности
- ✅ **Полностью типизированный** код
- ✅ **Иммутабельные** обновления состояния
- ✅ **Оптимизированные** рендеры с useMemo/useCallback
- ✅ **Адаптивный** дизайн (Mobile First)
- ✅ **Accessibility** (WCAG 2.1 AA)
- ✅ **Touch targets** минимум 44x44px
- ✅ **Progressive Web App** ready

---

## 🐛 Исправленные баги (из оригинального кода)

### ✅ Критические исправления

1. **Мутации состояния** → Полностью иммутабельные обновления
2. **Зависимости useEffect** → Правильные dependencies arrays
3. **Бесконечный цикл генерации** → Безопасная генерация с fallback
4. **Устаревшие замыкания** → useCallback с правильными deps
5. **Alert вместо UI** → Красивые модальные окна
6. **Отсутствие сохранения** → localStorage persistence
7. **Плохие touch targets** → Минимум 44x44px
8. **Нет проверки userData** → Защита от undefined

### 🔧 Улучшения

- Адаптивный дизайн для всех устройств
- Режим обучения vs режим тренировки
- Система прогрессии с логарифмическими уровнями
- Супер-скилы для продвинутых игроков
- Анти-чит система (отслеживание переключений приложения)
- Плавные анимации с Framer Motion
- Оптимизация производительности

---

## 📱 Адаптивность

Приложение полностью оптимизировано для:

- 📱 **Мобильные телефоны** (320px+)
- 📱 **Планшеты** (768px+)
- 💻 **Десктопы** (1024px+)
- 🖥️ **Большие экраны** (1920px+)

### Touch-friendly дизайн

- Все кнопки минимум 44x44px (стандарт Apple HIG)
- Увеличенные зоны нажатия
- Haptic feedback (на поддерживаемых устройствах)
- Отключение системного zoom на iOS
- Оптимизированная прокрутка

---

## 🧪 Тестирование

```bash
# Unit тесты (TODO)
npm run test

# E2E тесты (TODO)
npm run test:e2e

# Coverage (TODO)
npm run test:coverage
```

### Чек-лист QA

- [x] Все кнопки кликабельны (минимум 44x44px)
- [x] Адаптивный дизайн на всех устройствах
- [x] localStorage работает корректно
- [x] Нет консольных ошибок
- [x] Таймер работает без багов
- [x] Генерация вариантов ответа безопасна
- [x] Состояние обновляется иммутабельно
- [ ] Unit тесты покрывают 80%+ кода
- [ ] E2E тесты для критических флоу

---

## 🌐 Deployment

### Vercel (рекомендуется)

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Deploy
vercel
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

### GitHub Pages

```bash
# Добавьте в vite.config.ts:
base: '/mathbot-arena/'

# Build и deploy
npm run build
gh-pages -d dist
```

---

## 📈 Roadmap

### Фаза 1: MVP (✅ Completed)
- [x] Базовый UI/UX
- [x] Режим тренировки
- [x] Система прогрессии
- [x] 300+ задач
- [x] Методические материалы
- [x] localStorage persistence

### Фаза 2: Расширение (🚧 In Progress)
- [ ] Режим PvP (мультиплеер)
- [ ] Командные турниры
- [ ] Лидерборды (глобальные, по стране)
- [ ] Чат между игроками
- [ ] Email уведомления

### Фаза 3: Backend
- [ ] REST API (Node.js + Express)
- [ ] PostgreSQL база данных
- [ ] WebSocket для реального времени
- [ ] Аутентификация (JWT)
- [ ] Геолокация игроков

### Фаза 4: Визуализация
- [ ] Анимации боя (атака/защита)
- [ ] Аниме аватары (8+ персонажей)
- [ ] Particle effects
- [ ] Victory/defeat animations
- [ ] Сюжетная кампания

### Фаза 5: Монетизация
- [ ] Freemium модель
- [ ] Premium подписка ($4.99/мес)
- [ ] Family Plan ($9.99/мес)
- [ ] In-app purchases (косметика)

---

## 🤝 Contributing

Мы приветствуем вклад сообщества! Пожалуйста:

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Стайл-гайд

- Используйте TypeScript для всего кода
- Следуйте ESLint правилам
- Пишите комментарии для сложной логики
- Добавляйте тесты для новых функций
- Touch targets минимум 44x44px
- Иммутабельные обновления состояния

---

## 👥 Авторы

- **MathBot Arena Team** - *Разработка и дизайн*

### Благодарности

- [LogicLike.com](https://logiclike.com) за вдохновение и задачи
- [Deti-online.com](https://deti-online.com) за методические материалы
- Сообщество React за отличные инструменты
- Всем тестировщикам и контрибьюторам

---

## 📞 Контакты

- 📧 Email: info@y7agency.com
- 📱 Telegram: [@MathBotArena](https://t.me/sergiivoo)
---

## 🎓 Образовательный impact

### Цели проекта

- 🎯 Увеличить время изучения математики на **300%**
- 📈 Улучшить успеваемость на **15-25%**
- 😊 Сделать математику **веселой и увлекательной**
- 🌍 Охватить **10,000+** учеников в первый год
- ⭐ Retention rate **>40%** через 30 дней

### Метрики успеха

- **DAU/MAU**: Daily/Monthly Active Users
- **Session length**: Среднее время сессии
- **Completion rate**: % завершённых сессий
- **Learning outcomes**: Улучшение результатов тестов
- **Parent satisfaction**: Отзывы родителей (Net Promoter Score)

---

<div align="center">

**🚀 Готовы начать математическое приключение?**

</div>
