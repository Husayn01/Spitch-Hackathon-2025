// Supported Nigerian languages
export const SUPPORTED_LANGUAGES = {
  yo: { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  ig: { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  ha: { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  pcm: { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Naija' },
  en_ng: { code: 'en_ng', name: 'Nigerian English', nativeName: 'Nigerian English' }
} as const;

// Cultural game elements
export const GAME_CURRENCY = {
  name: 'Cowrie Shells',
  singular: 'cowrie',
  plural: 'cowries',
  iconName: 'Shell' // Lucide icon name
};

// Offline storage keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'afrilingo_progress',
  OFFLINE_LESSONS: 'afrilingo_offline_lessons',
  AUDIO_CACHE: 'afrilingo_audio_cache'
} as const;

// Achievement types
export const ACHIEVEMENT_TYPES = {
  XP_MILESTONE: 'xp_milestone',
  STREAK_MILESTONE: 'streak_milestone',
  LESSON_COMPLETION: 'lesson_completion',
  PERFECT_SCORE: 'perfect_score',
  CULTURAL_EXPLORER: 'cultural_explorer'
} as const;

// Language level definitions
export const LANGUAGE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;