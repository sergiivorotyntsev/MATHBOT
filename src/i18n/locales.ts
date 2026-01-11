/**
 * 🌍 MathBot Arena - Internationalization
 * Languages: English, Russian
 */

export type Language = 'en' | 'ru';

export interface Translations {
  // ==================== GENERAL ====================
  appName: string;
  welcome: string;
  start: string;
  continue: string;
  back: string;
  next: string;
  skip: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;

  // ==================== REGISTRATION ====================
  registration: string;
  enterName: string;
  enterAge: string;
  enterEmail: string;
  createHero: string;
  selectAvatar: string;
  customizeAvatar: string;
  namePlaceholder: string;
  agePlaceholder: string;
  emailPlaceholder: string;
  ageRange: string;
  welcomeMessage: string;
  emailSent: string;

  // ==================== NAVIGATION ====================
  training: string;
  learning: string;
  statistics: string;
  guides: string;
  account: string;
  shop: string;
  leaderboard: string;
  settings: string;

  // ==================== TRAINING MODE ====================
  trainingMode: string;
  learningMode: string;
  selectSkill: string;
  startTraining: string;
  startLearning: string;
  pauseSession: string;
  resumeSession: string;
  quitSession: string;
  quitWarning: string;

  trainingTypes: {
    quick: string;
    standard: string;
    topic: string;
    mixed: string;
    blitz: string;
    marathon: string;
  };

  // ==================== SKILLS ====================
  arithmetic: string;
  geometry: string;
  logic: string;
  skillLevel: string;
  skillXP: string;
  accuracy: string;
  totalSolved: string;
  correctAnswers: string;

  // ==================== QUESTIONS ====================
  question: string;
  questionOf: string;
  timeLeft: string;
  answer: string;
  submit: string;
  correct: string;
  incorrect: string;
  timeOut: string;
  hint: string;
  explanation: string;
  difficulty: string;
  topic: string;

  // ==================== RESULTS ====================
  sessionComplete: string;
  results: string;
  score: string;
  bestCombo: string;
  xpGained: string;
  timeSpent: string;
  playAgain: string;
  backToMenu: string;
  suspiciousActivity: string;
  trustScore: string;

  // ==================== STATISTICS ====================
  overallStats: string;
  questionsTotal: string;
  correctTotal: string;
  accuracyRate: string;
  bestComboEver: string;
  totalSessions: string;
  totalPlayTime: string;
  bySkill: string;
  needsAttention: string;
  learnMaterial: string;

  // ==================== PROFILE ====================
  profile: string;
  name: string;
  age: string;
  email: string;
  category: string;
  heroLevel: string;
  experience: string;
  toNextLevel: string;
  resetProgress: string;
  resetConfirm: string;
  logout: string;

  // ==================== AVATAR ====================
  chooseAvatar: string;
  customize: string;
  hairstyle: string;
  hairColor: string;
  outfit: string;
  accessories: string;
  effects: string;
  locked: string;
  unlockAtLevel: string;
  unlockWithAchievement: string;
  premiumOnly: string;
  purchase: string;

  archetypes: {
    scholar: string;
    warrior: string;
    artist: string;
    engineer: string;
  };

  rarities: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };

  // ==================== METHODOLOGY ====================
  methodologyGuides: string;
  theory: string;
  rules: string;
  examples: string;
  tips: string;
  commonMistakes: string;
  practice: string;
  startPractice: string;
  backToList: string;

  // ==================== MONETIZATION ====================
  freeTier: string;
  premiumTier: string;
  familyPlan: string;
  upgrade: string;
  purchaseSuccess: string;
  purchaseFailed: string;
  restore: string;
  manageSubscription: string;

  features: {
    adFree: string;
    unlimitedSessions: string;
    extraLives: string;
    customization: string;
    analytics: string;
    offline: string;
    earlyAccess: string;
  };

  // ==================== SHOP ====================
  shopTitle: string;
  cosmetics: string;
  powerUps: string;
  bundles: string;
  buy: string;
  owned: string;
  equipped: string;

  // ==================== ACHIEVEMENTS ====================
  achievements: string;
  achievementUnlocked: string;
  viewAll: string;
  inProgress: string;
  completed: string;

  // ==================== ERRORS ====================
  networkError: string;
  sessionExpired: string;
  invalidInput: string;
  tryAgain: string;

  // ==================== NOTIFICATIONS ====================
  dailyStreak: string;
  levelUp: string;
  newSkillUnlocked: string;
  achievementEarned: string;
  welcomeBack: string;
  skillDegraded: string;
  practiceReminder: string;

  // ==================== GAME MECHANICS ====================
  combo: string;
  streak: string;
  lives: string;
  energy: string;
  coins: string;
  gems: string;
  speedBonus: string;
  comboBonus: string;

  // ==================== TIME ====================
  seconds: string;
  minutes: string;
  hours: string;
  days: string;
  weeks: string;
  ago: string;

  // ==================== DIFFICULTY LEVELS ====================
  difficulties: {
    beginner: string;
    novice: string;
    intermediate: string;
    advanced: string;
    expert: string;
    master: string;
  };

  // ==================== AGE CATEGORIES ====================
  ageCategories: {
    '6-7': string;
    '8-9': string;
    '10-11': string;
    '12-14': string;
    '15+': string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // GENERAL
    appName: 'MathBot Arena',
    welcome: 'Welcome to MathBot Arena!',
    start: 'Start',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // REGISTRATION
    registration: 'Registration',
    enterName: 'Enter your name',
    enterAge: 'Enter your age',
    enterEmail: 'Enter your email',
    createHero: 'Create Hero',
    selectAvatar: 'Select Avatar',
    customizeAvatar: 'Customize Avatar',
    namePlaceholder: 'Your name',
    agePlaceholder: 'Age (6-18)',
    emailPlaceholder: 'example@email.com',
    ageRange: '6 to 18 years',
    welcomeMessage: 'Welcome, {name}!',
    emailSent: 'Confirmation email sent to {email}',

    // NAVIGATION
    training: 'Training',
    learning: 'Learning',
    statistics: 'Statistics',
    guides: 'Guides',
    account: 'Account',
    shop: 'Shop',
    leaderboard: 'Leaderboard',
    settings: 'Settings',

    // TRAINING MODE
    trainingMode: 'Training Mode',
    learningMode: 'Learning Mode',
    selectSkill: 'Select a skill to practice',
    startTraining: 'Start Training',
    startLearning: 'Start Learning',
    pauseSession: 'Pause',
    resumeSession: 'Resume',
    quitSession: 'Quit',
    quitWarning: 'If you quit now, you will lose 50% of XP earned this session.',

    trainingTypes: {
      quick: 'Quick Practice',
      standard: 'Standard Training',
      topic: 'Topic Mastery',
      mixed: 'Mixed Challenge',
      blitz: 'Blitz Mode',
      marathon: 'Marathon'
    },

    // SKILLS
    arithmetic: 'Arithmetic',
    geometry: 'Geometry',
    logic: 'Logic',
    skillLevel: 'Level',
    skillXP: 'XP',
    accuracy: 'Accuracy',
    totalSolved: 'Solved',
    correctAnswers: 'Correct',

    // QUESTIONS
    question: 'Question',
    questionOf: 'of',
    timeLeft: 'Time left',
    answer: 'Answer',
    submit: 'Submit',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    timeOut: 'Time\'s up!',
    hint: 'Hint',
    explanation: 'Explanation',
    difficulty: 'Difficulty',
    topic: 'Topic',

    // RESULTS
    sessionComplete: 'Session Complete!',
    results: 'Results',
    score: 'Score',
    bestCombo: 'Best Combo',
    xpGained: 'XP Gained',
    timeSpent: 'Time Spent',
    playAgain: 'Play Again',
    backToMenu: 'Back to Menu',
    suspiciousActivity: 'Suspicious activity detected',
    trustScore: 'Trust Score',

    // STATISTICS
    overallStats: 'Overall Statistics',
    questionsTotal: 'Total Questions',
    correctTotal: 'Correct Answers',
    accuracyRate: 'Accuracy Rate',
    bestComboEver: 'Best Combo',
    totalSessions: 'Total Sessions',
    totalPlayTime: 'Total Play Time',
    bySkill: 'By Skill',
    needsAttention: 'Needs Attention',
    learnMaterial: 'Learn Material',

    // PROFILE
    profile: 'Profile',
    name: 'Name',
    age: 'Age',
    email: 'Email',
    category: 'Category',
    heroLevel: 'Hero Level',
    experience: 'Experience',
    toNextLevel: 'To next level',
    resetProgress: 'Reset Progress',
    resetConfirm: 'Are you sure? All progress will be lost.',
    logout: 'Logout',

    // AVATAR
    chooseAvatar: 'Choose Your Avatar',
    customize: 'Customize',
    hairstyle: 'Hairstyle',
    hairColor: 'Hair Color',
    outfit: 'Outfit',
    accessories: 'Accessories',
    effects: 'Effects',
    locked: 'Locked',
    unlockAtLevel: 'Unlock at level {level}',
    unlockWithAchievement: 'Unlock with achievement: {achievement}',
    premiumOnly: 'Premium Only',
    purchase: 'Purchase',

    archetypes: {
      scholar: 'The Scholar',
      warrior: 'The Warrior',
      artist: 'The Artist',
      engineer: 'The Engineer'
    },

    rarities: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary'
    },

    // METHODOLOGY
    methodologyGuides: 'Methodology Guides',
    theory: 'Theory',
    rules: 'Rules',
    examples: 'Examples',
    tips: 'Tips',
    commonMistakes: 'Common Mistakes',
    practice: 'Practice',
    startPractice: 'Start Practice',
    backToList: 'Back to List',

    // MONETIZATION
    freeTier: 'Free',
    premiumTier: 'Premium',
    familyPlan: 'Family Plan',
    upgrade: 'Upgrade',
    purchaseSuccess: 'Purchase successful!',
    purchaseFailed: 'Purchase failed. Please try again.',
    restore: 'Restore Purchases',
    manageSubscription: 'Manage Subscription',

    features: {
      adFree: 'Ad-Free Experience',
      unlimitedSessions: 'Unlimited Sessions',
      extraLives: 'Extra Lives',
      customization: 'Advanced Customization',
      analytics: 'Detailed Analytics',
      offline: 'Offline Mode',
      earlyAccess: 'Early Access to Features'
    },

    // SHOP
    shopTitle: 'Item Shop',
    cosmetics: 'Cosmetics',
    powerUps: 'Power-Ups',
    bundles: 'Bundles',
    buy: 'Buy',
    owned: 'Owned',
    equipped: 'Equipped',

    // ACHIEVEMENTS
    achievements: 'Achievements',
    achievementUnlocked: 'Achievement Unlocked!',
    viewAll: 'View All',
    inProgress: 'In Progress',
    completed: 'Completed',

    // ERRORS
    networkError: 'Network error. Please check your connection.',
    sessionExpired: 'Session expired. Please login again.',
    invalidInput: 'Invalid input. Please try again.',
    tryAgain: 'Try Again',

    // NOTIFICATIONS
    dailyStreak: 'Daily streak: {days} days!',
    levelUp: 'Level Up! You are now level {level}',
    newSkillUnlocked: 'New skill unlocked: {skill}',
    achievementEarned: 'Achievement earned: {achievement}',
    welcomeBack: 'Welcome back! You\'ve been away for {days} days.',
    skillDegraded: 'Your {skill} skill has degraded. Practice to recover!',
    practiceReminder: 'Don\'t forget to practice today!',

    // GAME MECHANICS
    combo: 'Combo',
    streak: 'Streak',
    lives: 'Lives',
    energy: 'Energy',
    coins: 'Coins',
    gems: 'Gems',
    speedBonus: 'Speed Bonus',
    comboBonus: 'Combo Bonus',

    // TIME
    seconds: 's',
    minutes: 'm',
    hours: 'h',
    days: 'd',
    weeks: 'w',
    ago: 'ago',

    // DIFFICULTY LEVELS
    difficulties: {
      beginner: 'Beginner',
      novice: 'Novice',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
      master: 'Master'
    },

    // AGE CATEGORIES
    ageCategories: {
      '6-7': 'Young Explorers',
      '8-9': 'Aspiring Inventors',
      '10-11': 'Young Engineers',
      '12-14': 'Talented Scientists',
      '15+': 'Future Academics'
    }
  },

  ru: {
    // GENERAL
    appName: 'MathBot Arena',
    welcome: 'Добро пожаловать в MathBot Arena!',
    start: 'Начать',
    continue: 'Продолжить',
    back: 'Назад',
    next: 'Далее',
    skip: 'Пропустить',
    close: 'Закрыть',
    save: 'Сохранить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',

    // REGISTRATION
    registration: 'Регистрация',
    enterName: 'Введите ваше имя',
    enterAge: 'Введите ваш возраст',
    enterEmail: 'Введите ваш email',
    createHero: 'Создать Героя',
    selectAvatar: 'Выберите Аватар',
    customizeAvatar: 'Настроить Аватар',
    namePlaceholder: 'Ваше имя',
    agePlaceholder: 'Возраст (6-18)',
    emailPlaceholder: 'example@email.com',
    ageRange: 'от 6 до 18 лет',
    welcomeMessage: 'Добро пожаловать, {name}!',
    emailSent: 'Письмо с подтверждением отправлено на {email}',

    // NAVIGATION
    training: 'Тренировка',
    learning: 'Обучение',
    statistics: 'Статистика',
    guides: 'Материалы',
    account: 'Профиль',
    shop: 'Магазин',
    leaderboard: 'Таблица лидеров',
    settings: 'Настройки',

    // TRAINING MODE
    trainingMode: 'Режим Тренировки',
    learningMode: 'Режим Обучения',
    selectSkill: 'Выберите навык для практики',
    startTraining: 'Начать Тренировку',
    startLearning: 'Начать Обучение',
    pauseSession: 'Пауза',
    resumeSession: 'Продолжить',
    quitSession: 'Выйти',
    quitWarning: 'Если вы выйдете сейчас, вы потеряете 50% накопленного XP.',

    trainingTypes: {
      quick: 'Быстрая Практика',
      standard: 'Стандартная Тренировка',
      topic: 'Освоение Темы',
      mixed: 'Смешанный Вызов',
      blitz: 'Блиц Режим',
      marathon: 'Марафон'
    },

    // SKILLS
    arithmetic: 'Арифметика',
    geometry: 'Геометрия',
    logic: 'Логика',
    skillLevel: 'Уровень',
    skillXP: 'Опыт',
    accuracy: 'Точность',
    totalSolved: 'Решено',
    correctAnswers: 'Правильно',

    // QUESTIONS
    question: 'Вопрос',
    questionOf: 'из',
    timeLeft: 'Осталось времени',
    answer: 'Ответ',
    submit: 'Отправить',
    correct: 'Правильно!',
    incorrect: 'Неверно',
    timeOut: 'Время вышло!',
    hint: 'Подсказка',
    explanation: 'Объяснение',
    difficulty: 'Сложность',
    topic: 'Тема',

    // RESULTS
    sessionComplete: 'Сессия Завершена!',
    results: 'Результаты',
    score: 'Счёт',
    bestCombo: 'Лучшее Комбо',
    xpGained: 'Получено XP',
    timeSpent: 'Затрачено Времени',
    playAgain: 'Играть Снова',
    backToMenu: 'В Меню',
    suspiciousActivity: 'Обнаружена подозрительная активность',
    trustScore: 'Оценка Доверия',

    // STATISTICS
    overallStats: 'Общая Статистика',
    questionsTotal: 'Всего Вопросов',
    correctTotal: 'Правильных Ответов',
    accuracyRate: 'Процент Точности',
    bestComboEver: 'Лучшее Комбо',
    totalSessions: 'Всего Сессий',
    totalPlayTime: 'Общее Время Игры',
    bySkill: 'По Навыкам',
    needsAttention: 'Требует Внимания',
    learnMaterial: 'Изучить Материал',

    // PROFILE
    profile: 'Профиль',
    name: 'Имя',
    age: 'Возраст',
    email: 'Email',
    category: 'Категория',
    heroLevel: 'Уровень Героя',
    experience: 'Опыт',
    toNextLevel: 'До следующего уровня',
    resetProgress: 'Сбросить Прогресс',
    resetConfirm: 'Вы уверены? Весь прогресс будет потерян.',
    logout: 'Выйти',

    // AVATAR
    chooseAvatar: 'Выберите Аватар',
    customize: 'Настроить',
    hairstyle: 'Причёска',
    hairColor: 'Цвет Волос',
    outfit: 'Одежда',
    accessories: 'Аксессуары',
    effects: 'Эффекты',
    locked: 'Заблокировано',
    unlockAtLevel: 'Открыть на уровне {level}',
    unlockWithAchievement: 'Открыть за достижение: {achievement}',
    premiumOnly: 'Только Premium',
    purchase: 'Купить',

    archetypes: {
      scholar: 'Учёный',
      warrior: 'Воин',
      artist: 'Художник',
      engineer: 'Инженер'
    },

    rarities: {
      common: 'Обычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный'
    },

    // METHODOLOGY
    methodologyGuides: 'Методические Материалы',
    theory: 'Теория',
    rules: 'Правила',
    examples: 'Примеры',
    tips: 'Советы',
    commonMistakes: 'Частые Ошибки',
    practice: 'Практика',
    startPractice: 'Начать Практику',
    backToList: 'К Списку',

    // MONETIZATION
    freeTier: 'Бесплатно',
    premiumTier: 'Premium',
    familyPlan: 'Семейный План',
    upgrade: 'Обновить',
    purchaseSuccess: 'Покупка успешна!',
    purchaseFailed: 'Покупка не удалась. Попробуйте снова.',
    restore: 'Восстановить Покупки',
    manageSubscription: 'Управление Подпиской',

    features: {
      adFree: 'Без Рекламы',
      unlimitedSessions: 'Безлимитные Сессии',
      extraLives: 'Дополнительные Жизни',
      customization: 'Продвинутая Кастомизация',
      analytics: 'Детальная Аналитика',
      offline: 'Оффлайн Режим',
      earlyAccess: 'Ранний Доступ к Функциям'
    },

    // SHOP
    shopTitle: 'Магазин Предметов',
    cosmetics: 'Косметика',
    powerUps: 'Усиления',
    bundles: 'Наборы',
    buy: 'Купить',
    owned: 'Куплено',
    equipped: 'Надето',

    // ACHIEVEMENTS
    achievements: 'Достижения',
    achievementUnlocked: 'Достижение Открыто!',
    viewAll: 'Посмотреть Все',
    inProgress: 'В Процессе',
    completed: 'Завершено',

    // ERRORS
    networkError: 'Ошибка сети. Проверьте подключение.',
    sessionExpired: 'Сессия истекла. Войдите снова.',
    invalidInput: 'Неверный ввод. Попробуйте снова.',
    tryAgain: 'Попробовать Снова',

    // NOTIFICATIONS
    dailyStreak: 'Дневная серия: {days} дней!',
    levelUp: 'Повышение Уровня! Теперь вы {level} уровня',
    newSkillUnlocked: 'Новый навык открыт: {skill}',
    achievementEarned: 'Получено достижение: {achievement}',
    welcomeBack: 'С возвращением! Вы отсутствовали {days} дней.',
    skillDegraded: 'Ваш навык {skill} снизился. Практикуйтесь чтобы восстановить!',
    practiceReminder: 'Не забудьте попрактиковаться сегодня!',

    // GAME MECHANICS
    combo: 'Комбо',
    streak: 'Серия',
    lives: 'Жизни',
    energy: 'Энергия',
    coins: 'Монеты',
    gems: 'Кристаллы',
    speedBonus: 'Бонус Скорости',
    comboBonus: 'Бонус Комбо',

    // TIME
    seconds: 'с',
    minutes: 'м',
    hours: 'ч',
    days: 'д',
    weeks: 'н',
    ago: 'назад',

    // DIFFICULTY LEVELS
    difficulties: {
      beginner: 'Начинающий',
      novice: 'Новичок',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
      expert: 'Эксперт',
      master: 'Мастер'
    },

    // AGE CATEGORIES
    ageCategories: {
      '6-7': 'Юные Исследователи',
      '8-9': 'Начинающие Изобретатели',
      '10-11': 'Молодые Инженеры',
      '12-14': 'Талантливые Учёные',
      '15+': 'Будущие Академики'
    }
  }
};

// ==================== HELPER FUNCTIONS ====================

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('mathbot_language', lang);
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('mathbot_language');
  if (saved === 'en' || saved === 'ru') return saved;

  // Auto-detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  return 'en';
};

export const t = (key: keyof Translations, replacements?: Record<string, string | number>): string => {
  let text = translations[currentLanguage][key];

  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
};

export const switchLanguage = () => {
  const newLang = currentLanguage === 'en' ? 'ru' : 'en';
  setLanguage(newLang);
  window.location.reload(); // Reload to apply translations
};

// Initialize language
currentLanguage = getLanguage();

console.log('🌍 i18n initialized. Current language:', currentLanguage);
