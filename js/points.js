import {
  ACTIVITY_POINTS,
  STEPS_PER_POINT,
  MONTHLY_GOAL,
  isBinaryActivity,
} from './config.js';

export function calculatePoints(type, amount, previousStepTotal = 0) {
  if (type === 'steps') {
    const nextTotal = previousStepTotal + amount;
    return (
      Math.floor(nextTotal / STEPS_PER_POINT) -
      Math.floor(previousStepTotal / STEPS_PER_POINT)
    );
  }

  if (isBinaryActivity(type)) {
    return ACTIVITY_POINTS[type] ?? 0;
  }

  return 0;
}

export function getProgressPercent(totalPoints) {
  return Math.min(Math.round((totalPoints / MONTHLY_GOAL) * 100), 100);
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const toIso = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    start: toIso(start),
    end: toIso(end),
    label: now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
  };
}

export function formatActivityLabel(type, amount) {
  if (type === 'steps') {
    return `${amount} шагов`;
  }

  return 'Сделано';
}

export function formatActivityDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function stepsUntilNextPoint(totalSteps) {
  const remainder = totalSteps % STEPS_PER_POINT;
  return remainder === 0 ? STEPS_PER_POINT : STEPS_PER_POINT - remainder;
}
