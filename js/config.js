// Supabase → Project Settings → API
export const SUPABASE_URL = 'https://gwpgkuamevvnmvwqlino.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_9HwCRBcIoRyFiarHoEGGIQ_V-6c5VKl';

export const PARTICIPANTS = [
  'Влад',
  'Маша',
  'Алекс',
  'Дима',
];

export const MONTHLY_GOAL = 100;

// Бинарные активности: сделано = фиксированные очки
export const BINARY_ACTIVITIES = ['workout', 'training', 'pushups', 'stretching'];

export const ACTIVITY_POINTS = {
  workout: 1,
  pushups: 1,
  stretching: 1,
  training: 3,
};

export const STEPS_PER_POINT = 10000;

export const ACTIVITY_LABELS = {
  workout: 'Зарядка',
  training: 'Тренировка',
  pushups: 'Отжимания',
  stretching: 'Растяжка',
  steps: 'Шаги',
};

export function isConfigured() {
  return (
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_') &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('YOUR_')
  );
}

export function isValidParticipant(name) {
  return PARTICIPANTS.includes(name);
}

export function isBinaryActivity(type) {
  return BINARY_ACTIVITIES.includes(type);
}
