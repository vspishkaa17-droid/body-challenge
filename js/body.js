import { MONTHLY_GOAL } from './config.js';

const SLICES = MONTHLY_GOAL;

function beerColor(index) {
  const t = index / SLICES;
  const light = 42 + t * 18;
  const hue = 38 - t * 8;
  return `hsl(${hue}, 88%, ${light}%)`;
}

function renderSlices(filledCount) {
  const sliceHeight = 320 / SLICES;
  const startY = 60;
  const width = 68;
  const x = 66;

  return Array.from({ length: SLICES }, (_, index) => {
    if (index >= filledCount) return '';

    const y = startY + (SLICES - index - 1) * sliceHeight;
    return `<rect x="${x}" y="${y}" width="${width}" height="${sliceHeight + 0.5}" fill="${beerColor(index)}" />`;
  }).join('');
}

export function renderBody(container, totalPoints) {
  const filledCount = Math.min(SLICES, Math.max(0, Math.floor(totalPoints)));
  const percent = Math.min(100, Math.round((totalPoints / SLICES) * 100));
  const showFoam = filledCount > 0;
  const foamY = startFoamY(filledCount);

  container.innerHTML = `
    <div class="glass-widget" aria-label="Прогресс за месяц — бокал пива">
      <svg class="glass-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Бокал пива">
        <defs>
          <clipPath id="beer-clip">
            <path d="M 72 338 Q 58 270 62 205 Q 66 135 74 92 L 126 92 Q 134 135 138 205 Q 142 270 128 338 Z" />
          </clipPath>
          <linearGradient id="glass-shine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
            <stop offset="45%" stop-color="rgba(255,255,255,0.08)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.35)" />
          </linearGradient>
          <linearGradient id="glass-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.75)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.25)" />
          </linearGradient>
        </defs>

        <g clip-path="url(#beer-clip)">
          ${renderSlices(filledCount)}
          ${showFoam ? `<ellipse cx="100" cy="${foamY}" rx="30" ry="7" fill="#fff8e7" opacity="0.95" />` : ''}
        </g>

        <path
          d="M 62 345 Q 48 260 54 190 Q 58 120 68 78 Q 72 58 100 54 Q 128 58 132 78 Q 142 120 146 190 Q 152 260 138 345 Q 100 362 62 345 Z"
          fill="url(#glass-shine)"
          stroke="url(#glass-edge)"
          stroke-width="2.5"
          opacity="0.55"
        />
        <ellipse cx="100" cy="54" rx="34" ry="8" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" />
        <path d="M 78 120 Q 100 126 122 120" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
        <path d="M 74 250 Q 100 256 126 250" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" />
      </svg>
      <p class="glass-caption">${filledCount} / ${SLICES} за месяц · ${percent}%</p>
    </div>
  `;
}

function startFoamY(filledCount) {
  const sliceHeight = 320 / SLICES;
  const startY = 60;
  const topFilledY = startY + (SLICES - filledCount) * sliceHeight;
  return Math.max(topFilledY - 4, 64);
}
