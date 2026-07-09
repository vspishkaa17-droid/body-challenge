import { ACTIVITY_WEIGHTS, BODY_PARTS, DAILY_GOAL } from './config.js';

export function calculatePoints(type, amount) {
  const weight = ACTIVITY_WEIGHTS[type] ?? 1;
  return Math.round(amount * weight * 10) / 10;
}

export function getFilledParts(totalPoints) {
  return BODY_PARTS.filter((part) => totalPoints >= part.threshold).map((part) => part.id);
}

export function getProgressPercent(totalPoints) {
  return Math.min(Math.round((totalPoints / DAILY_GOAL) * 100), 100);
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date) =>
    date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    label: `${format(monday)} — ${format(sunday)}`,
  };
}

export function formatActivityLabel(type, amount) {
  const units = {
    pushups: 'повт.',
    squats: 'повт.',
    steps: 'шагов',
    workout: 'мин',
    run: 'км',
    plank: 'сек',
  };

  return `${amount} ${units[type] ?? ''}`.trim();
}
