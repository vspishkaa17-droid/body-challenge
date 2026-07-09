import { MONTHLY_GOAL } from './config.js';

const SLICES = MONTHLY_GOAL;
const GLASS_TOP = 92;
const GLASS_BOTTOM = 346;
const GLASS_HEIGHT = GLASS_BOTTOM - GLASS_TOP;

function renderSliceLines(filledCount) {
  return Array.from({ length: SLICES - 1 }, (_, index) => {
    const level = index + 1;
    const y = GLASS_BOTTOM - (GLASS_HEIGHT * level) / SLICES;
    const opacity = level <= filledCount ? 0.16 : 0;
    if (opacity === 0) return '';

    return `<line x1="66" y1="${y}" x2="134" y2="${y}" stroke="rgba(0,0,0,0.22)" stroke-width="0.6" opacity="${opacity}" />`;
  }).join('');
}

export function renderBody(container, totalPoints) {
  const filledCount = Math.min(SLICES, Math.max(0, Math.floor(totalPoints)));
  const percent = Math.min(100, Math.round((totalPoints / SLICES) * 100));
  const fillHeight = (GLASS_HEIGHT * filledCount) / SLICES;
  const fillY = GLASS_BOTTOM - fillHeight;
  const showFoam = filledCount > 0;

  container.innerHTML = `
    <div class="glass-widget" aria-label="Прогресс за месяц — бокал пива">
      <svg class="glass-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Бокал пива">
        <defs>
          <clipPath id="beer-inner">
            <path d="M 78 346 C 66 292 62 236 66 188 C 70 140 78 104 100 98 C 122 104 130 140 134 188 C 138 236 134 292 122 346 Z" />
          </clipPath>
          <clipPath id="beer-level">
            <rect x="0" y="${fillY}" width="200" height="${fillHeight + 1}" />
          </clipPath>
          <linearGradient id="beer-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="45%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#fde68a" />
          </linearGradient>
          <linearGradient id="glass-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
            <stop offset="40%" stop-color="rgba(255,255,255,0.03)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>

        <g clip-path="url(#beer-inner)">
          <g clip-path="url(#beer-level)">
            <rect x="58" y="${GLASS_TOP}" width="84" height="${GLASS_HEIGHT}" fill="url(#beer-gradient)" />
            ${renderSliceLines(filledCount)}
          </g>
          ${showFoam ? `<ellipse cx="100" cy="${fillY + 2}" rx="24" ry="5.5" fill="#fff9ef" opacity="0.95" />` : ''}
        </g>

        <path
          d="M 68 352 C 54 288 52 224 58 168 C 64 118 76 82 100 76 C 124 82 136 118 142 168 C 148 224 146 288 132 352 C 100 362 68 352 68 352 Z"
          fill="url(#glass-light)"
          stroke="rgba(255,255,255,0.72)"
          stroke-width="2.2"
        />
        <ellipse cx="100" cy="76" rx="36" ry="9" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.65)" stroke-width="2" />
        <path d="M 82 78 L 82 350" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />
        <path d="M 118 110 Q 100 118 82 110" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" />
        <path d="M 116 230 Q 100 238 84 230" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
      </svg>
      <p class="glass-caption">${filledCount} / ${SLICES} за месяц · ${percent}%</p>
    </div>
  `;
}
