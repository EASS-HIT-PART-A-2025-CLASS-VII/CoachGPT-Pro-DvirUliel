// API Configuration
export const API_CONFIG = {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002',
    LLM_URL: process.env.REACT_APP_LLM_URL || 'http://localhost:5003',
    TIMEOUT: 70000,
  };
  
  // Storage Keys
  export const STORAGE_KEYS = {
    TOKEN: 'coachgpt_token',
    USER: 'coachgpt_user',
    THEME: 'coachgpt_theme',
  } as const;
  
  // Workout Configuration
  export const WORKOUT_CONFIG = {
    DIFFICULTY_LEVELS: [
      { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
      { value: 'intermediate', label: 'Intermediate', description: '6+ months experience' },
      { value: 'advanced', label: 'Advanced', description: '2+ years experience' },
    ],
    GOALS: [
      { value: 'strength', label: 'Strength', icon: '💪', description: 'Build maximum strength' },
      { value: 'hypertrophy', label: 'Muscle Growth', icon: '🏋️', description: 'Increase muscle size' },
      { value: 'endurance', label: 'Endurance', icon: '🏃', description: 'Improve stamina' },
      { value: 'weight_loss', label: 'Weight Loss', icon: '🔥', description: 'Burn fat and calories' },
      { value: 'general_fitness', label: 'General Fitness', icon: '⚡', description: 'Overall health' },
    ],
    DAYS_PER_WEEK: [
      { value: 1, label: '1 Day' },
      { value: 2, label: '2 Days' },
      { value: 3, label: '3 Days' },
      { value: 4, label: '4 Days' },
      { value: 5, label: '5 Days' },
      { value: 6, label: '6 Days' },
      { value: 7, label: '7 Days' },
    ],
  } as const;
  
  // Muscle Groups
  export const MUSCLE_GROUPS = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'
  ] as const;
  
  // Chat Configuration
  export const CHAT_CONFIG = {
    MAX_MESSAGE_LENGTH: 2000,
    TYPING_DELAY: 1000,
    STREAM_TIMEOUT: 70000,
  } as const;
  
  // UI Constants
  export const UI_CONFIG = {
    SIDEBAR_WIDTH: 256,
    SIDEBAR_COLLAPSED_WIDTH: 64,
    MOBILE_BREAKPOINT: 1024,
    TOAST_DURATION: 4000,
  } as const;
  
  // Brand Colors (matching logo)
  export const BRAND_COLORS = {
    navy: '#0a1628',
    blue: '#1e40af',
    orange: '#f97316',
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  } as const;