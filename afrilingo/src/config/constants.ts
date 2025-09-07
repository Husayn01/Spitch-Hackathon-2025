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
  symbol: '🐚'
};

// Offline storage keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'afrilingo_progress',
  OFFLINE_LESSONS: 'afrilingo_offline_lessons',
  AUDIO_CACHE: 'afrilingo_audio_cache'
} as const;