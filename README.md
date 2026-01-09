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

- 🎯 **300+ математических задач** по арифметике, геометрии и логике
- 🤖 **Система прогрессии героя** с логарифмическими уровнями
- 📚 **Два режима**: Обучение (без таймера) и Тренировка (с комбо)
- 📖 **Методические материалы** с подробными объяснениями
- 🔥 **Система комбо** для мотивации последовательных правильных ответов
- 💾 **Автоматическое сохранение** прогресса в localStorage
- 📱 **Адаптивный дизайн** для всех устройств (телефон, планшет, компьютер)
- ⚡ **Супер-скилы** разблокируются на высоких уровнях
- 🛡️ **Анти-чит система** отслеживает подозрительную активность
- 🎨 **Аниме-стилистика** с плавными анимациями

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

# 2. Установите зависимости
npm install

# 3. Запустите dev-сервер
npm run dev

# 4. Откройте в браузере
# http://localhost:3000
```

### Доступные команды

```bash
npm run dev        # Запуск dev-сервера
npm run build      # Сборка для production
npm run preview    # Предпросмотр production build
npm run lint       # Проверка кода с ESLint
npm run type-check # Проверка типов TypeScript
```

---

## 🏗️ Архитектура проекта

```
mathbot-arena/
├── src/
│   ├── data/
│   │   ├── taskBank.ts          # 300+ задач
│   │   └── methodologyGuides.ts # Методические материалы
│   ├── MathBotArena.tsx         # Основной компонент
│   ├── main.tsx                 # Точка входа
│   └── index.css                # Глобальные стили
├── public/                      # Статические файлы
├── ARCHITECTURE.md              # Подробная документация
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

Полная документация по архитектуре доступна в [ARCHITECTURE.md](./ARCHITECTURE.md).

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

## 📄 Лицензия

Этот проект лицензирован под MIT License - подробности в [LICENSE](LICENSE).

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

- 📧 Email: support@mathbot-arena.com
- 🐦 Twitter: [@MathBotArena](https://twitter.com/MathBotArena)
- 💬 Discord: [MathBot Community](https://discord.gg/mathbot)
- 📱 Telegram: [@MathBotArena](https://t.me/MathBotArena)

---

## 📊 Статистика проекта

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/yourusername/mathbot-arena?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/mathbot-arena?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/mathbot-arena?style=social)

**Made with ❤️ and ☕ by MathBot Arena Team**

</div>

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

[Начать игру](https://mathbot-arena-demo.vercel.app) • [Документация](./ARCHITECTURE.md) • [GitHub](https://github.com/yourusername/mathbot-arena)

</div>
