// Замените на данные из Supabase → Project Settings → API
export const SUPABASE_URL = 'https://gwpgkuamevvnmvwqlino.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_9HwCRBcIoRyFiarHoEGGIQ_V-6c5VKl';

export const DAILY_GOAL = 100;

export const ACTIVITY_WEIGHTS = {
  pushups: 2,
  squats: 1.5,
  steps: 0.005,
  workout: 3,
  run: 10,
  plank: 0.5,
};

export const ACTIVITY_LABELS = {
  pushups: 'Отжимания',
  squats: 'Приседания',
  steps: 'Шаги',
  workout: 'Зарядка',
  run: 'Бег',
  plank: 'Планка',
};

export const BODY_PARTS = [
  { id: 'head', threshold: 10 },
  { id: 'neck', threshold: 15 },
  { id: 'torso', threshold: 40 },
  { id: 'leftArm', threshold: 50 },
  { id: 'rightArm', threshold: 60 },
  { id: 'leftLeg', threshold: 75 },
  { id: 'rightLeg', threshold: 90 },
  { id: 'leftHand', threshold: 95 },
  { id: 'rightHand', threshold: 100 },
];

export function isConfigured() {
  return (
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_') &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('YOUR_')
  );
}
