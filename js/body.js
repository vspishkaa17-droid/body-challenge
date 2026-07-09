import { MONTHLY_GOAL } from './config.js';

const BODY_PARTS = [
  { id: 'leftLeg', threshold: 10 },
  { id: 'rightLeg', threshold: 20 },
  { id: 'leftHand', threshold: 30 },
  { id: 'rightHand', threshold: 40 },
  { id: 'leftArm', threshold: 50 },
  { id: 'rightArm', threshold: 60 },
  { id: 'torso', threshold: 75 },
  { id: 'neck', threshold: 90 },
  { id: 'head', threshold: 100 },
];

const EMPTY_FILL = '#334155';
const EMPTY_STROKE = '#64748b';
const FILLED_STROKE = '#34d399';

function isFilled(totalPoints, threshold) {
  return totalPoints >= threshold;
}

function partStyle(totalPoints, threshold) {
  const filled = isFilled(totalPoints, threshold);
  return {
    fill: filled ? 'url(#body-fill)' : EMPTY_FILL,
    stroke: filled ? FILLED_STROKE : EMPTY_STROKE,
    className: filled ? 'body-part filled' : 'body-part',
  };
}

function renderPart(id, d, totalPoints, threshold, extra = '') {
  const style = partStyle(totalPoints, threshold);
  return `<path id="${id}" class="${style.className}" d="${d}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2" stroke-linejoin="round"${extra} />`;
}

export function renderBody(container, totalPoints) {
  const percent = Math.min(100, Math.round((totalPoints / MONTHLY_GOAL) * 100));
  const filledCount = BODY_PARTS.filter((part) => isFilled(totalPoints, part.threshold)).length;

  container.innerHTML = `
    <div class="body-widget" aria-label="Прогресс за месяц — силуэт человека">
      <svg class="body-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Силуэт человека">
        <defs>
          <linearGradient id="body-fill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#059669" />
            <stop offset="55%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#6366f1" />
          </linearGradient>
          <filter id="body-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#10b981" flood-opacity="0.35" />
          </filter>
        </defs>

        <ellipse cx="100" cy="372" rx="42" ry="8" fill="rgba(0,0,0,0.25)" />

        ${renderPart(
          'leftLeg',
          'M 88 228 L 78 360 Q 76 372 88 372 L 98 372 Q 104 372 104 360 L 100 228 Z',
          totalPoints,
          10,
        )}
        ${renderPart(
          'rightLeg',
          'M 112 228 L 116 360 Q 116 372 104 372 L 96 372 Q 92 372 92 360 L 100 228 Z',
          totalPoints,
          20,
        )}
        ${renderPart(
          'leftArm',
          'M 72 118 Q 58 122 48 148 L 38 196 Q 36 206 42 210 L 52 206 Q 58 180 66 156 L 78 132 Z',
          totalPoints,
          50,
        )}
        ${renderPart(
          'rightArm',
          'M 128 118 Q 142 122 152 148 L 162 196 Q 164 206 158 210 L 148 206 Q 142 180 134 156 L 122 132 Z',
          totalPoints,
          60,
        )}
        ${renderPart(
          'leftHand',
          'M 38 206 Q 30 210 30 220 Q 30 232 40 236 Q 48 238 54 230 Q 58 222 52 206 Z',
          totalPoints,
          30,
        )}
        ${renderPart(
          'rightHand',
          'M 162 206 Q 170 210 170 220 Q 170 232 160 236 Q 152 238 146 230 Q 142 222 148 206 Z',
          totalPoints,
          40,
        )}
        ${renderPart(
          'torso',
          'M 78 132 L 72 118 Q 70 108 78 102 L 88 98 L 100 96 L 112 98 L 122 102 Q 130 108 128 118 L 122 132 L 118 228 L 82 228 Z',
          totalPoints,
          75,
        )}
        ${renderPart(
          'neck',
          'M 90 88 L 88 98 L 112 98 L 110 88 Q 100 84 90 88 Z',
          totalPoints,
          90,
        )}
        ${renderPart(
          'head',
          'M 100 28 Q 72 28 68 52 Q 64 76 72 92 Q 80 104 100 106 Q 120 104 128 92 Q 136 76 132 52 Q 128 28 100 28 Z',
          totalPoints,
          100,
          ' filter="url(#body-glow)"',
        )}

        <circle cx="88" cy="58" r="4" fill="rgba(255,255,255,0.12)" pointer-events="none" />
        <circle cx="112" cy="58" r="4" fill="rgba(255,255,255,0.12)" pointer-events="none" />
      </svg>
      <p class="body-caption">${filledCount} / ${BODY_PARTS.length} зон · ${percent}%</p>
    </div>
  `;
}
