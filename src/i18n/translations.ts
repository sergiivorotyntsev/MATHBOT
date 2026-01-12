/**
 * 🌐 Translation Dictionaries
 * RU/EN translations for all UI strings
 */

import { Language } from './config';

export interface Translations {
  // App
  appName: string;
  buildTag: string;

  // Welcome screen
  welcome: {
    title: string;
    subtitle: string;
    description: string;
    start: string;
  };

  // Registration
  register: {
    title: string;
    name: string;
    age: string;
    email: string;
    submit: string;
    back: string;
    namePlaceholder: string;
    agePlaceholder: string;
    emailPlaceholder: string;
  };

  // Avatar selection
  avatar: {
    selectTitle: string;
    selectDescription: string;
    confirm: string;
    customize: string;
    customizeTitle: string;
    cosmetics: string;
    unlockAt: string;
    equipped: string;
    equip: string;
    locked: string;
  };

  // Main navigation
  nav: {
    training: string;
    learning: string;
    pvp: string;
    botBattle: string;
    progress: string;
    materials: string;
    skills: string;
    statistics: string;
    guides: string;
    profile: string;
  };

  // Header
  header: {
    greeting: string;
    level: string;
    xp: string;
    combo: string;
    streak: string;
    days: string;
  };

  // Training/Learning modes
  session: {
    training: string;
    learning: string;
    trainingMode: string;
    learningMode: string;
    trainingDesc: string;
    learningDesc: string;
    selectSkill: string;
    start: string;
    pause: string;
    resume: string;
    quit: string;
    stop: string;
    skip: string;
    exitWarning: string;
    exitWarningDesc: string;
    exitPenalty: string;
    continueSession: string;
    pauseSession: string;
    quitSession: string;
    question: string;
    of: string;
    timeLeft: string;
    correct: string;
    incorrect: string;
    timeout: string;
    nextQuestion: string;
    sessionComplete: string;
    results: string;
    accuracy: string;
    avgTime: string;
    xpGained: string;
    skillsImproved: string;
    backToMenu: string;
    showHint: string;
    hint: string;
    showExplanation: string;
    explanation: string;
  };

  // Skills
  skills: {
    title: string;
    core: string;
    coreSkills: string;
    secondary: string;
    secondarySkills: string;
    perks: string;
    uniquePerks: string;
    history: string;
    skillHistory: string;
    level: string;
    progress: string;
    arithmetic: string;
    geometry: string;
    logic: string;
    speed: string;
    accuracy: string;
    focus: string;
    // NEW: Game stats
    strength: string;
    agility: string;
    defense: string;
    magic: string;
    wisdom: string;
    luck: string;
    // Math skills
    addition: string;
    subtraction: string;
    multiplication: string;
    division: string;
    fractions: string;
    decimals: string;
    percentages: string;
    shapes: string;
    perimeter: string;
    area: string;
    volume: string;
    angles: string;
    patterns: string;
    sequences: string;
    problemSolving: string;
    wordProblems: string;
    unlocked: string;
    locked: string;
    common: string;
    rare: string;
    epic: string;
    legendary: string;
    noPerksYet: string;
    earnPerksHint: string;
    noHistoryYet: string;
    historyHint: string;
    summary: string;
    streak: string;
    rating: string;
    pvpRank: string;
  };

  // Statistics
  stats: {
    title: string;
    totalQuestions: string;
    correctAnswers: string;
    bestCombo: string;
    sessions: string;
    playTime: string;
    hours: string;
    minutes: string;
    skillBreakdown: string;
    recentActivity: string;
    achievements: string;
  };

  // PvP
  pvp: {
    title: string;
    arena: string;
    findMatch: string;
    vsBot: string;
    yourHero: string;
    opponent: string;
    rank: string;
    hp: string;
    ultimate: string;
    round: string;
    victory: string;
    defeat: string;
    draw: string;
    rewards: string;
    rankChange: string;
    coins: string;
    serverRequired: string;
    searching: string;
    matchFound: string;
    getReady: string;
    answered: string;
    critical: string;
    dodge: string;
    block: string;
  };

  // Bot Battle (Local)
  botBattle: {
    title: string;
    description: string;
    startButton: string;
    playerInfo: string;
    yourFighter: string;
    name: string;
    levelLabel: string;
    hp: string;
    localMode: string;
    offlineInfo: string;
    exit: string;
    exitConfirm: string;
    exitWarning: string;
    round: string;
    solveToAttack: string;
    battleLog: string;
    timeOut: string;
    botAttacks: string;
    youAttack: string;
    correctAnswer: string;
    wrongAnswer: string;
    botDealt: string;
    youDealt: string;
    damage: string;
    botMissed: string;
    aiOpponent: string;
    won: string;
    lost: string;
    youDefeated: string;
    defeated: string;
  };

  // Materials/Knowledge base
  materials: {
    title: string;
    subtitle: string;
    selectTopic: string;
  };

  // Task UI
  taskUI: {
    topic: string;
    difficulty: string;
    solved: string;
    accuracy: string;
    needsAttention: string;
    level: string;
    tasks: string;
    confirmStop: string;
    stopPenalty: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    confirm: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    back: string;
    next: string;
    finish: string;
    retry: string;
    continue: string;
  };

  // Errors
  errors: {
    generic: string;
    network: string;
    timeout: string;
    notFound: string;
    unauthorized: string;
    server: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    appName: 'MathBot Arena',
    buildTag: 'Сборка',

    welcome: {
      title: 'MathBot Arena',
      subtitle: '⚔️ Математические бои! 🤖',
      description: 'Прокачивай своего героя, изучай математику и сражайся с соперниками в захватывающих поединках!',
      start: '🚀 Начать приключение'
    },

    register: {
      title: 'Регистрация',
      name: 'Имя',
      age: 'Возраст',
      email: 'Email (для подтверждения)',
      submit: '✅ Создать героя',
      back: '← Назад',
      namePlaceholder: 'Введи своё имя',
      agePlaceholder: 'От 6 до 18 лет',
      emailPlaceholder: 'example@email.com'
    },

    avatar: {
      selectTitle: 'Выбери своего героя',
      selectDescription: 'Каждый герой обладает уникальными способностями и стилем обучения',
      confirm: 'Выбрать героя',
      customize: 'Кастомизация',
      customizeTitle: 'Настрой внешность',
      cosmetics: 'Косметика',
      unlockAt: 'Откроется на {level} уровне',
      equipped: 'Надето',
      equip: 'Надеть',
      locked: 'Заблокировано'
    },

    nav: {
      training: '⚔️ Тренировка',
      learning: '📚 Обучение',
      pvp: '🎮 PvP Арена',
      botBattle: '🎮 Бой с ботом',
      progress: '📊 Прогресс',
      materials: '📖 Материалы',
      skills: '✨ Навыки',
      statistics: '📊 Статистика',
      guides: '📖 Материалы',
      profile: '👤 Профиль'
    },

    header: {
      greeting: 'Привет',
      level: 'Ур.',
      xp: 'XP',
      combo: 'Комбо',
      streak: 'Серия',
      days: 'дней'
    },

    session: {
      training: 'Тренировка',
      learning: 'Обучение',
      trainingMode: '⚔️ Тренировочный режим',
      learningMode: '📚 Режим обучения',
      trainingDesc: 'Проверь свои навыки! Вопросы с таймером и комбо.',
      learningDesc: 'Изучай спокойно, без таймера. Подробные объяснения после каждого ответа.',
      selectSkill: 'Выбери тему',
      start: 'Начать',
      pause: 'Пауза',
      resume: 'Продолжить',
      quit: 'Выйти',
      stop: '⏹️ Стоп',
      skip: 'Пропустить',
      exitWarning: 'Выйти из сессии?',
      exitWarningDesc: 'Прогресс будет потерян, комбо сбросится.',
      exitPenalty: 'Потеря {xp} XP и сброс комбо',
      continueSession: 'Продолжить',
      pauseSession: 'Пауза',
      quitSession: 'Выйти (штраф)',
      question: 'Вопрос',
      of: 'из',
      timeLeft: 'Осталось',
      correct: '✅ Правильно!',
      incorrect: '❌ Неверно',
      timeout: '⏱️ Время вышло!',
      nextQuestion: 'Следующий вопрос',
      sessionComplete: '🎉 Сессия завершена!',
      results: 'Результаты',
      accuracy: 'Точность',
      avgTime: 'Среднее время',
      xpGained: 'Получено XP',
      skillsImproved: 'Улучшены навыки',
      backToMenu: 'В главное меню',
      showHint: '💡 Показать подсказку',
      hint: 'Подсказка',
      showExplanation: '📖 Показать объяснение',
      explanation: 'Объяснение'
    },

    skills: {
      title: 'Навыки и умения',
      core: 'Основные навыки',
      coreSkills: 'Основные навыки',
      secondary: 'Дополнительные навыки',
      secondarySkills: 'Дополнительные навыки',
      perks: 'Уникальные перки',
      uniquePerks: 'Уникальные перки',
      history: 'История изменений',
      skillHistory: 'История навыков',
      level: 'Уровень',
      progress: 'Прогресс',
      arithmetic: 'Арифметика',
      geometry: 'Геометрия',
      logic: 'Логика',
      speed: 'Скорость',
      accuracy: 'Точность',
      focus: 'Фокус',
      // NEW: Game stats
      strength: 'Сила',
      agility: 'Ловкость',
      defense: 'Броня',
      magic: 'Магия',
      wisdom: 'Мудрость',
      luck: 'Удача',
      // Math skills
      addition: 'Сложение',
      subtraction: 'Вычитание',
      multiplication: 'Умножение',
      division: 'Деление',
      fractions: 'Дроби',
      decimals: 'Десятичные',
      percentages: 'Проценты',
      shapes: 'Фигуры',
      perimeter: 'Периметр',
      area: 'Площадь',
      volume: 'Объём',
      angles: 'Углы',
      patterns: 'Паттерны',
      sequences: 'Последовательности',
      problemSolving: 'Решение задач',
      wordProblems: 'Текстовые задачи',
      unlocked: 'Открыто',
      locked: 'Заблокировано',
      common: 'Обычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный',
      noPerksYet: 'Пока нет уникальных перков',
      earnPerksHint: 'Достигайте целей и выполняйте задания, чтобы разблокировать перки',
      noHistoryYet: 'История навыков пуста',
      historyHint: 'Прогресс будет отображаться здесь по мере тренировок',
      summary: 'Сводка',
      streak: 'Серия',
      rating: 'Рейтинг',
      pvpRank: 'PvP ранг'
    },

    stats: {
      title: 'Статистика',
      totalQuestions: 'Всего вопросов',
      correctAnswers: 'Правильных ответов',
      bestCombo: 'Лучшее комбо',
      sessions: 'Сессий',
      playTime: 'Время игры',
      hours: 'ч',
      minutes: 'мин',
      skillBreakdown: 'Распределение навыков',
      recentActivity: 'Последняя активность',
      achievements: 'Достижения'
    },

    pvp: {
      title: 'PvP Арена',
      arena: 'Арена',
      findMatch: 'Найти соперника',
      vsBot: 'Бой с компьютером',
      yourHero: 'Твой герой',
      opponent: 'Соперник',
      rank: 'Ранг',
      hp: 'HP',
      ultimate: 'Ульта',
      round: 'Раунд',
      victory: 'ПОБЕДА!',
      defeat: 'ПОРАЖЕНИЕ',
      draw: 'НИЧЬЯ',
      rewards: 'Награды',
      rankChange: 'Изменение ранга',
      coins: 'Монет',
      serverRequired: '⚠️ Внимание: Требуется запущенный сервер!',
      searching: 'Поиск соперника...',
      matchFound: 'Соперник найден!',
      getReady: 'Приготовься...',
      answered: '✓ Ответил',
      critical: 'КРИТИЧЕСКИЙ УДАР!',
      dodge: 'УКЛОНЕНИЕ!',
      block: 'БЛОК!'
    },

    botBattle: {
      title: '🤖 Бой с ботом',
      description: 'Сражайся с AI-противником в математических поединках! Отвечай на вопросы правильно и наноси урон.',
      startButton: '🤖 Начать бой с ботом!',
      playerInfo: 'Твой герой',
      yourFighter: 'Твой боец:',
      name: 'Имя',
      levelLabel: 'Уровень',
      hp: 'HP',
      localMode: '✅ Локальный режим - сервер не требуется!',
      offlineInfo: 'Бой с AI-ботом работает полностью офлайн',
      exit: 'Выход',
      exitConfirm: 'Выйти из боя?',
      exitWarning: 'Прогресс боя будет потерян',
      round: 'Раунд',
      solveToAttack: 'Реши задачу чтобы атаковать!',
      battleLog: '📜 Лог боя:',
      timeOut: '⏱️ Время вышло',
      botAttacks: 'Бот атакует!',
      youAttack: 'Вы атакуете!',
      correctAnswer: '✅ Правильный ответ',
      wrongAnswer: '❌ Ошибка',
      botDealt: 'Бот нанёс',
      youDealt: 'Вы нанесли',
      damage: 'урона',
      botMissed: 'Бот промахнулся!',
      aiOpponent: '🤖 AI Противник',
      won: 'ПОБЕДА!',
      lost: 'ПОРАЖЕНИЕ',
      youDefeated: 'Вы победили',
      defeated: 'победил!'
    },

    materials: {
      title: '📚 База знаний - Материалы для обучения',
      subtitle: 'Выберите тему для изучения теории, примеров и советов. После изучения нажмите "Тренировка" чтобы закрепить материал!',
      selectTopic: 'Выберите тему'
    },

    taskUI: {
      topic: 'Тема',
      difficulty: 'Сложность',
      solved: 'Решено',
      accuracy: 'Точность',
      needsAttention: '⚠️ Требует внимания',
      level: 'Ур.',
      tasks: 'задач',
      confirmStop: '⚠️ Остановить тренировку? Вы получите штраф -50 XP за досрочное завершение.',
      stopPenalty: 'Штраф -50 XP'
    },

    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Внимание',
      info: 'Информация',
      yes: 'Да',
      no: 'Нет',
      ok: 'ОК',
      back: 'Назад',
      next: 'Далее',
      finish: 'Завершить',
      retry: 'Повторить',
      continue: 'Продолжить'
    },

    errors: {
      generic: 'Произошла ошибка',
      network: 'Ошибка сети',
      timeout: 'Превышено время ожидания',
      notFound: 'Не найдено',
      unauthorized: 'Нет доступа',
      server: 'Ошибка сервера'
    }
  },

  en: {
    appName: 'MathBot Arena',
    buildTag: 'Build',

    welcome: {
      title: 'MathBot Arena',
      subtitle: '⚔️ Math Battles! 🤖',
      description: 'Level up your hero, learn mathematics, and battle opponents in exciting duels!',
      start: '🚀 Start Adventure'
    },

    register: {
      title: 'Registration',
      name: 'Name',
      age: 'Age',
      email: 'Email (for verification)',
      submit: '✅ Create Hero',
      back: '← Back',
      namePlaceholder: 'Enter your name',
      agePlaceholder: '6 to 18 years old',
      emailPlaceholder: 'example@email.com'
    },

    avatar: {
      selectTitle: 'Choose Your Hero',
      selectDescription: 'Each hero has unique abilities and learning style',
      confirm: 'Select Hero',
      customize: 'Customize',
      customizeTitle: 'Customize Appearance',
      cosmetics: 'Cosmetics',
      unlockAt: 'Unlocks at level {level}',
      equipped: 'Equipped',
      equip: 'Equip',
      locked: 'Locked'
    },

    nav: {
      training: '⚔️ Training',
      learning: '📚 Learning',
      pvp: '🎮 PvP Arena',
      botBattle: '🎮 Bot Battle',
      progress: '📊 Progress',
      materials: '📖 Materials',
      skills: '✨ Skills',
      statistics: '📊 Statistics',
      guides: '📖 Guides',
      profile: '👤 Profile'
    },

    header: {
      greeting: 'Hello',
      level: 'Lv.',
      xp: 'XP',
      combo: 'Combo',
      streak: 'Streak',
      days: 'days'
    },

    session: {
      training: 'Training',
      learning: 'Learning',
      trainingMode: '⚔️ Training Mode',
      learningMode: '📚 Learning Mode',
      trainingDesc: 'Test your skills! Timed questions with combo system.',
      learningDesc: 'Learn at your pace, no timer. Detailed explanations after each answer.',
      selectSkill: 'Select Topic',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      quit: 'Quit',
      stop: '⏹️ Stop',
      skip: 'Skip',
      exitWarning: 'Exit Session?',
      exitWarningDesc: 'Progress will be lost, combo will reset.',
      exitPenalty: 'Lose {xp} XP and reset combo',
      continueSession: 'Continue',
      pauseSession: 'Pause',
      quitSession: 'Quit (Penalty)',
      question: 'Question',
      of: 'of',
      timeLeft: 'Time Left',
      correct: '✅ Correct!',
      incorrect: '❌ Incorrect',
      timeout: '⏱️ Time\'s Up!',
      nextQuestion: 'Next Question',
      sessionComplete: '🎉 Session Complete!',
      results: 'Results',
      accuracy: 'Accuracy',
      avgTime: 'Avg Time',
      xpGained: 'XP Gained',
      skillsImproved: 'Skills Improved',
      backToMenu: 'Back to Menu',
      showHint: '💡 Show Hint',
      hint: 'Hint',
      showExplanation: '📖 Show Explanation',
      explanation: 'Explanation'
    },

    skills: {
      title: 'Skills & Abilities',
      core: 'Core Skills',
      coreSkills: 'Core Skills',
      secondary: 'Secondary Skills',
      secondarySkills: 'Secondary Skills',
      perks: 'Unique Perks',
      uniquePerks: 'Unique Perks',
      history: 'Change History',
      skillHistory: 'Skill History',
      level: 'Level',
      progress: 'Progress',
      arithmetic: 'Arithmetic',
      geometry: 'Geometry',
      logic: 'Logic',
      speed: 'Speed',
      accuracy: 'Accuracy',
      focus: 'Focus',
      // NEW: Game stats
      strength: 'Strength',
      agility: 'Agility',
      defense: 'Defense',
      magic: 'Magic',
      wisdom: 'Wisdom',
      luck: 'Luck',
      // Math skills
      addition: 'Addition',
      subtraction: 'Subtraction',
      multiplication: 'Multiplication',
      division: 'Division',
      fractions: 'Fractions',
      decimals: 'Decimals',
      percentages: 'Percentages',
      shapes: 'Shapes',
      perimeter: 'Perimeter',
      area: 'Area',
      volume: 'Volume',
      angles: 'Angles',
      patterns: 'Patterns',
      sequences: 'Sequences',
      problemSolving: 'Problem Solving',
      wordProblems: 'Word Problems',
      unlocked: 'Unlocked',
      locked: 'Locked',
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
      noPerksYet: 'No unique perks yet',
      earnPerksHint: 'Complete achievements and quests to unlock perks',
      noHistoryYet: 'Skill history is empty',
      historyHint: 'Your progress will appear here as you train',
      summary: 'Summary',
      streak: 'Streak',
      rating: 'Rating',
      pvpRank: 'PvP Rank'
    },

    stats: {
      title: 'Statistics',
      totalQuestions: 'Total Questions',
      correctAnswers: 'Correct Answers',
      bestCombo: 'Best Combo',
      sessions: 'Sessions',
      playTime: 'Play Time',
      hours: 'h',
      minutes: 'min',
      skillBreakdown: 'Skill Breakdown',
      recentActivity: 'Recent Activity',
      achievements: 'Achievements'
    },

    pvp: {
      title: 'PvP Arena',
      arena: 'Arena',
      findMatch: 'Find Match',
      vsBot: 'Battle vs Bot',
      yourHero: 'Your Hero',
      opponent: 'Opponent',
      rank: 'Rank',
      hp: 'HP',
      ultimate: 'Ultimate',
      round: 'Round',
      victory: 'VICTORY!',
      defeat: 'DEFEAT',
      draw: 'DRAW',
      rewards: 'Rewards',
      rankChange: 'Rank Change',
      coins: 'Coins',
      serverRequired: '⚠️ Warning: Server must be running!',
      searching: 'Searching for opponent...',
      matchFound: 'Match found!',
      getReady: 'Get ready...',
      answered: '✓ Answered',
      critical: 'CRITICAL HIT!',
      dodge: 'DODGE!',
      block: 'BLOCK!'
    },

    botBattle: {
      title: '🤖 Bot Battle',
      description: 'Battle against an AI opponent in math duels! Answer questions correctly to deal damage.',
      startButton: '🤖 Start Bot Battle!',
      playerInfo: 'Your Hero',
      yourFighter: 'Your Fighter:',
      name: 'Name',
      levelLabel: 'Level',
      hp: 'HP',
      localMode: '✅ Local Mode - No Server Required!',
      offlineInfo: 'AI bot battle works completely offline',
      exit: 'Exit',
      exitConfirm: 'Exit Battle?',
      exitWarning: 'Battle progress will be lost',
      round: 'Round',
      solveToAttack: 'Solve the task to attack!',
      battleLog: '📜 Battle Log:',
      timeOut: '⏱️ Time\'s Up',
      botAttacks: 'Bot attacks!',
      youAttack: 'You attack!',
      correctAnswer: '✅ Correct answer',
      wrongAnswer: '❌ Wrong',
      botDealt: 'Bot dealt',
      youDealt: 'You dealt',
      damage: 'damage',
      botMissed: 'Bot missed!',
      aiOpponent: '🤖 AI Opponent',
      won: 'VICTORY!',
      lost: 'DEFEAT',
      youDefeated: 'You defeated',
      defeated: 'won!'
    },

    materials: {
      title: '📚 Knowledge Base - Learning Materials',
      subtitle: 'Select a topic to study theory, examples, and tips. After studying, click "Training" to practice!',
      selectTopic: 'Select a topic'
    },

    taskUI: {
      topic: 'Topic',
      difficulty: 'Difficulty',
      solved: 'Solved',
      accuracy: 'Accuracy',
      needsAttention: '⚠️ Needs Attention',
      level: 'Lv.',
      tasks: 'tasks',
      confirmStop: '⚠️ Stop training? You will receive a -50 XP penalty for early exit.',
      stopPenalty: 'Penalty -50 XP'
    },

    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      retry: 'Retry',
      continue: 'Continue'
    },

    errors: {
      generic: 'An error occurred',
      network: 'Network error',
      timeout: 'Request timeout',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      server: 'Server error'
    }
  }
};

// Translation helper with variable replacement
export function t(lang: Language, key: string, replacements?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Replace variables {varName}
  if (replacements) {
    return value.replace(/\{(\w+)\}/g, (match, varName) => {
      return replacements[varName]?.toString() ?? match;
    });
  }

  return value;
}

console.log('🌐 Translations loaded');
