# 🏗️ MathBot Arena - Архитектура проекта

## 🎯 Цель проекта
Создание увлекательной геймифицированной образовательной платформы для обучения математике детей 6-18 лет с элементами аниме-стилистики, мультиплеером и продвинутой системой прогрессии.

## 📐 Техническая архитектура

### Frontend Stack
- **Framework**: React 18+ с TypeScript
- **State Management**: Zustand (легковесная альтернатива Redux)
- **Анимации**: Framer Motion + GSAP
- **Стилизация**: Tailwind CSS + CSS Modules
- **Роутинг**: React Router v6
- **Формы**: React Hook Form + Zod валидация
- **WebSocket**: Socket.io-client (для реального времени)
- **Оффлайн**: Service Workers + IndexedDB
- **Тестирование**: Vitest + React Testing Library

### Backend Stack
- **Runtime**: Node.js 20+ с TypeScript
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL (основная) + Redis (кэш, сессии)
- **ORM**: Prisma
- **Реальное время**: Socket.io
- **Аутентификация**: JWT + Refresh Tokens
- **Email**: SendGrid / Mailgun
- **Файлы**: AWS S3 / Cloudinary
- **Геолокация**: MaxMind GeoIP2
- **Rate Limiting**: Redis-based
- **Мониторинг**: Sentry + Custom analytics

### DevOps
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend)
- **CI/CD**: GitHub Actions
- **Контейнеризация**: Docker
- **Мониторинг**: Sentry, LogRocket

## 🎮 Модульная архитектура

```
/mathbot-arena
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui (кнопки, карточки, модалы)
│   │   │   ├── /battle (визуализация боя)
│   │   │   ├── /hero (аватар, прогрессия)
│   │   │   ├── /training (тренировочный режим)
│   │   │   ├── /learning (режим обучения)
│   │   │   └── /multiplayer (PvP, турниры)
│   │   ├── /features
│   │   │   ├── /auth
│   │   │   ├── /tasks
│   │   │   ├── /progression
│   │   │   ├── /statistics
│   │   │   └── /social (чат, команды)
│   │   ├── /store (Zustand stores)
│   │   ├── /hooks
│   │   ├── /utils
│   │   ├── /api (клиент для бэкенда)
│   │   └── /data (банк задач)
│   ├── /public
│   └── /tests
├── /backend
│   ├── /src
│   │   ├── /routes
│   │   ├── /controllers
│   │   ├── /services
│   │   ├── /models (Prisma)
│   │   ├── /middleware
│   │   ├── /websocket
│   │   └── /utils
│   └── /tests
└── /shared (типы TypeScript)
```

## 📊 Структура базы данных

### Основные таблицы
```sql
Users
- id, email, username, passwordHash
- age, country, timezone
- createdAt, lastActive
- emailVerified, isPremium

Heroes
- id, userId, name, level, totalXP
- currentXP, skillPoints
- avatar, style (аниме персонаж)

Skills
- id, heroId, skillType (arithmetic, geometry, logic)
- level, xp, masteryPoints
- unlockedSuperSkills[]

Statistics
- id, heroId
- totalQuestions, correctAnswers
- bestCombo, totalPlayTime
- avgResponseTime
- skillBreakdown (JSON)

Sessions
- id, heroId, sessionType (training/learning)
- skillType, startedAt, completedAt
- questionsTotal, correctAnswers
- comboMax, xpGained
- cheatingFlags[]

TaskProgress
- id, heroId, taskId
- attempts, lastAttempt
- firstCorrect, avgTime
- errorTopics[]

Battles (PvP)
- id, player1Id, player2Id
- skillType, status, winnerId
- rounds (JSON), startedAt, endedAt

Teams
- id, name, captainId, country
- members[], totalPoints
- tournamentsWon

Tournaments
- id, name, skillType, status
- startDate, endDate
- participants[], brackets (JSON)

Leaderboards
- id, heroId, skillType
- rank, points, country, age

Messages (Chat)
- id, senderId, receiverId/teamId
- content, timestamp, isRead
```

## 🎯 Ключевые фичи

### 1. Двухрежимная система
**Режим обучения (Learning Mode)**
- Без таймера
- Подробные объяснения после ответа
- Доступ к методическим материалам
- Не влияет на рейтинг
- Награды за изучение тем

**Режим тренировки (Training Mode)**
- Таймер 30-60 секунд
- Система комбо
- Влияет на рейтинг и XP
- Визуализация боя

### 2. Система прогрессии героя
```javascript
// Логарифмическая система уровней
Level = Math.floor(Math.log2(TotalXP / 100 + 1)) + 1

// XP за задачу с модификаторами
BaseXP = 15
ComboBonus = ComboCount * 5
TimeBonus = max(0, (TimeLimit - TimeTaken) / 2)
DifficultyMultiplier = 1.0 + (TaskDifficulty * 0.2)
PremiumBonus = isPremium ? 1.5 : 1.0

FinalXP = (BaseXP + ComboBonus + TimeBonus) * DifficultyMultiplier * PremiumBonus
```

### 3. Супер-скилы
Разблокируются при достижении уровня 10/20/30 в базовом навыке:

**Арифметика:**
- Молниеносный счёт (быстрое решение +50% XP)
- Математический щит (1 ошибка не сбрасывает комбо)
- Цепная реакция (комбо x3 вместо x2)

**Геометрия:**
- Пространственное видение (показ подсказок)
- Архитектор (бонус к сложным задачам)

**Логика:**
- Дедукция (исключение 1 неверного варианта)
- Алгоритмист (паттерны задач)

### 4. Анти-читерская система
```javascript
// Флаги подозрительного поведения
- Приложение сворачивалось > 3 раз
- Время ответа слишком стабильное (бот?)
- Слишком быстрые ответы на сложные задачи
- Внезапное улучшение точности
- Копирование текста задачи (Android/iOS API)

// Действия:
- Уведомление пользователю
- Пометка сессии
- Снижение XP для подозрительных сессий
- Временный бан при повторных нарушениях
```

### 5. Мультиплеер
**Поиск соперника:**
```javascript
// Матчмейкинг по параметрам
- Схожий уровень (±3)
- Аналогичный возраст (±2 года)
- Тот же навык
- Близкий рейтинг (±100 очков)
- Геолокация (приоритет своей стране)
```

**Формат боя:**
- 10 раундов
- Одновременные вопросы
- Очки за скорость и точность
- Визуализация атак/защиты

### 6. Командные турниры
- 2-5 человек в команде
- Общие задачи (решают вместе в чате)
- Сложные многоступенчатые задачи
- Турнирная сетка
- Призы для топ-3 команд

## 🎨 Визуальный стиль (Аниме)

### Цветовая палитра
```css
/* Тёмная тема (основная) */
--bg-primary: #0F0F23
--bg-secondary: #1A1A2E
--accent-purple: #7B2CBF
--accent-blue: #00D9FF
--accent-pink: #FF006E
--success: #06FFA5
--danger: #FF0A54
--warning: #FFB800

/* Градиенты */
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-battle: linear-gradient(45deg, #FF006E 0%, #7B2CBF 50%, #00D9FF 100%)
```

### Анимации
- **Появление героя**: Slide-in + Fade + Scale
- **Атака**: Particle effects + Screen shake
- **Защита**: Shield bubble + Glow
- **Победа**: Confetti + Victory pose
- **Поражение**: Stumble + Dust particles
- **Комбо**: Flame trail + Multiplier popup
- **Левел ап**: Burst animation + Star particles

### Персонажи (выбор аватара)
8 стилизованных аниме-персонажей:
- Математический маг (синий)
- Геометрический самурай (зелёный)
- Логический ниндзя (фиолетовый)
- Арифметический рыцарь (красный)
- И т.д.

Кастомизация:
- Причёска (15 вариантов)
- Цвет волос (12 вариантов)
- Одежда (20 вариантов)
- Аксессуары (30+ вариантов)

## 📚 Расширенный банк задач

### Целевой объём
- **Арифметика**: 300+ задач (6 уровней сложности)
- **Геометрия**: 250+ задач
- **Логика**: 200+ задач
- **Комбинированные**: 150+ задач

### Источники
- LogicLike.com (5500 задач)
- Deti-online.com (математические загадки)
- Олимпиадные задачи
- Авторский контент

### Структура задачи
```typescript
interface Task {
  id: string;
  skillType: SkillType;
  topic: string; // "Сложение", "Периметр" и т.д.
  difficulty: 1-6; // От новичка до мастера
  question: string;
  answer: number | string;
  options?: Array<number | string>;
  explanation: string;
  hints?: string[];
  methodologyLink?: string; // Ссылка на урок
  visualAid?: string; // URL картинки
  timeLimit: number; // секунды
  xpReward: number;
  tags: string[];
}
```

## 📧 Email уведомления

### Типы писем
1. **Приветственное письмо** (при регистрации)
2. **Подтверждение email**
3. **Ежедневный отчёт** (опционально)
4. **Достижения** (новый уровень, супер-скил)
5. **Приглашения в команду**
6. **Напоминания** (не заходил 3+ дня)
7. **Турниры** (начало, результаты)

### Шаблоны
- HTML + Plain text
- Адаптивный дизайн
- Персонализация
- Кнопки CTA

## 🌍 Геолокация и социальные фичи

### Определение страны
```javascript
// Методы (приоритетный порядок):
1. Browser Geolocation API (с разрешением)
2. IP-based (MaxMind GeoIP2)
3. Timezone + Language
4. Ручной выбор пользователем
```

### Чат
- Личные сообщения
- Командный чат
- Глобальный чат (модерируемый)
- Эмодзи реакции
- Стикеры с персонажами
- Автомодерация (плохие слова)

### Лидерборды
Множественные таблицы:
- Глобальная
- По стране
- По возрасту
- По навыку
- Команды
- Недельная/месячная/всё время

## 🧪 Тестирование и QA

### Чеклист перед релизом
- [ ] Unit тесты (80%+ coverage)
- [ ] E2E тесты (критические флоу)
- [ ] Тестирование на устройствах:
  - [ ] iPhone (iOS 15+)
  - [ ] Android (Samsung, Xiaomi)
  - [ ] iPad / планшеты
  - [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Проверка кликабельности всех кнопок
- [ ] Touch targets минимум 44x44px
- [ ] Тестирование с медленным интернетом
- [ ] Проверка работы оффлайн (PWA)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Производительность (Lighthouse 90+)
- [ ] Безопасность (OWASP Top 10)
- [ ] Нагрузочное тестирование (1000+ одновременных)

### Аналитика
Отслеживаемые метрики:
- DAU / MAU (Daily/Monthly Active Users)
- Session length (среднее время)
- Retention (1d, 7d, 30d)
- Completion rate (% завершённых сессий)
- Churn rate (отток)
- Conversion (free → premium)
- Error rates
- Performance metrics

## 🚀 План разработки (MVP → Full)

### Фаза 1: MVP (2-3 недели)
- [x] Базовый UI/UX
- [ ] Регистрация + Email верификация
- [ ] Режим тренировки (1 навык)
- [ ] Система прогрессии (базовая)
- [ ] 100 задач
- [ ] Статистика
- [ ] Локальное хранение (localStorage)

### Фаза 2: Расширение (2-3 недели)
- [ ] Режим обучения
- [ ] Методические материалы
- [ ] 3 навыка с 300+ задачами
- [ ] Супер-скилы
- [ ] Улучшенные анимации
- [ ] Backend + база данных
- [ ] Синхронизация прогресса

### Фаза 3: Мультиплеер (3-4 недели)
- [ ] PvP режим
- [ ] Матчмейкинг
- [ ] Лидерборды
- [ ] Командные турниры
- [ ] Чат
- [ ] Геолокация

### Фаза 4: Полировка (2-3 недели)
- [ ] Анти-чит система
- [ ] Аниме аватары (8+ персонажей)
- [ ] Продвинутые анимации боя
- [ ] Сюжетная кампания
- [ ] Мобильные приложения (React Native)
- [ ] Оптимизация производительности
- [ ] Полное QA тестирование

### Фаза 5: Презентация инвесторам
- [ ] Pitch deck
- [ ] Демо-видео
- [ ] Бизнес-план
- [ ] Метрики и KPI
- [ ] Монетизация (Freemium модель)

## 💰 Модель монетизации

### Free tier
- 50 задач в день
- Базовые аватары
- Реклама (не навязчивая)
- Локальные лидерборды

### Premium ($4.99/месяц)
- Безлимитные задачи
- Без рекламы
- Эксклюзивные аватары
- Приоритетный матчмейкинг
- Детальная аналитика для родителей
- +50% XP бонус
- Ранний доступ к новым фичам

### Family Plan ($9.99/месяц)
- До 5 детских аккаунтов
- Родительская панель
- Общая статистика семьи
- Командные челленджи

## 🎓 Методические материалы

### Структура урока
1. **Введение** (что изучаем)
2. **Теория** (правила, формулы)
3. **Примеры** (3-5 разобранных задач)
4. **Интерактивная практика** (5 задач с подсказками)
5. **Проверка понимания** (мини-тест)
6. **Переход к тренировке**

### Темы (65+ уроков)
**Арифметика** (25 уроков)
- Сложение/вычитание в пределах 20, 100, 1000
- Таблица умножения
- Деление
- Порядок операций
- Проценты
- Дроби
- И т.д.

**Геометрия** (20 уроков)
- Фигуры и их свойства
- Периметр и площадь
- Объём
- Углы
- Координаты
- И т.д.

**Логика** (20 уроков)
- Последовательности
- Паттерны
- Логические цепочки
- Комбинаторика
- Вероятность
- И т.д.

## 📱 Адаптивность и UX

### Touch Targets
- Минимум 44x44px для всех кнопок
- Увеличенные зоны нажатия
- Визуальный feedback (ripple effect)
- Haptic feedback на мобильных

### Загрузка
- Skeleton screens
- Lazy loading изображений
- Code splitting
- Service Worker для быстрого запуска

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Настройка размера шрифта
- Поддержка дислексии (специальный шрифт)

---

## 📊 Success Metrics для презентации

### Образовательные
- Улучшение успеваемости на 15-25%
- Увеличение времени изучения математики на 300%
- Positive sentiment (отзывы родителей)

### Бизнес
- Target: 10,000 пользователей в первые 3 месяца
- Retention: >40% через 30 дней
- Conversion: 5-10% в premium
- LTV: $50-100 per user

### Технические
- Load time < 2s
- Zero critical bugs
- 99.9% uptime
- Response time < 100ms

---

**Версия**: 1.0
**Дата**: 2026-01-09
**Статус**: В разработке (Фаза 1)
