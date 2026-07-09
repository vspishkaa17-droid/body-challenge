import { MONTHLY_GOAL } from './config.js';

const SLICES = MONTHLY_GOAL;
const FILL_TOP = 72;
const FILL_BOTTOM = 268;
const FILL_HEIGHT = FILL_BOTTOM - FILL_TOP;

function renderLevelLines(filledCount) {
  return Array.from({ length: SLICES - 1 }, (_, index) => {
    const level = index + 1;
    if (level > filledCount) return '';

    const y = FILL_BOTTOM - (FILL_HEIGHT * level) / SLICES;
    return `<line x1="78" y1="${y}" x2="122" y2="${y}" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" />`;
  }).join('');
}

function renderSparkles(filledCount) {
  if (filledCount < 50) return '';

  return `
    <path d="M 100 48 L 101 52 L 105 53 L 101 54 L 100 58 L 99 54 L 95 53 L 99 52 Z" fill="#fef08a" opacity="0.9" />
    <path d="M 132 62 L 133 64 L 135 65 L 133 66 L 132 68 L 131 66 L 129 65 L 131 64 Z" fill="#fde047" opacity="0.7" />
    <path d="M 68 66 L 69 68 L 71 69 L 69 70 L 68 72 L 67 70 L 65 69 L 67 68 Z" fill="#fde047" opacity="0.7" />
  `;
}

export function renderBody(container, totalPoints) {
  const filledCount = Math.min(SLICES, Math.max(0, Math.floor(totalPoints)));
  const percent = Math.min(100, Math.round((totalPoints / SLICES) * 100));
  const fillHeight = (FILL_HEIGHT * filledCount) / SLICES;
  const fillY = FILL_BOTTOM - fillHeight;
  const uid = `trophy-${Date.now()}`;

  container.innerHTML = `
    <div class="progress-widget" aria-label="Прогресс за месяц — кубок">
      <svg class="progress-svg" viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Кубок прогресса">
        <defs>
          <clipPath id="${uid}-cup">
            <path d="M 68 268 L 68 120 C 68 92 82 72 100 72 C 118 72 132 92 132 120 L 132 268 Z" />
          </clipPath>
          <clipPath id="${uid}-level">
            <rect x="0" y="${fillY}" width="200" height="${fillHeight + 1}" />
          </clipPath>
          <linearGradient id="${uid}-fill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#4338ca" />
            <stop offset="45%" stop-color="#6366f1" />
            <stop offset="85%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#c7d2fe" />
          </linearGradient>
          <linearGradient id="${uid}-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#78716c" />
            <stop offset="35%" stop-color="#fafaf9" />
            <stop offset="65%" stop-color="#d6d3d1" />
            <stop offset="100%" stop-color="#78716c" />
          </linearGradient>
          <linearGradient id="${uid}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde68a" />
            <stop offset="50%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="318" rx="52" ry="10" fill="rgba(0,0,0,0.35)" />

        <rect x="82" y="276" width="36" height="28" rx="4" fill="url(#${uid}-gold)" stroke="#b45309" stroke-width="1.2" />
        <rect x="74" y="302" width="52" height="12" rx="3" fill="url(#${uid}-gold)" stroke="#b45309" stroke-width="1.2" />

        <path
          d="M 68 268 L 68 120 C 68 92 82 72 100 72 C 118 72 132 92 132 120 L 132 268 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="1.5"
        />

        <g clip-path="url(#${uid}-cup)">
          <g clip-path="url(#${uid}-level)">
            <rect x="68" y="${FILL_TOP}" width="64" height="${FILL_HEIGHT}" fill="url(#${uid}-fill)" />
            ${renderLevelLines(filledCount)}
          </g>
          ${filledCount > 0 ? `
            <ellipse cx="100" cy="${fillY + 2}" rx="30" ry="5" fill="rgba(199,210,254,0.85)" />
          ` : ''}
        </g>

        <path
          d="M 68 268 L 68 120 C 68 92 82 72 100 72 C 118 72 132 92 132 120 L 132 268 Z"
          fill="none"
          stroke="url(#${uid}-gold)"
          stroke-width="3"
        />

        <path
          d="M 68 130 C 52 128 42 118 40 102 C 38 86 48 74 68 72"
          fill="none"
          stroke="url(#${uid}-gold)"
          stroke-width="3.5"
          stroke-linecap="round"
        />
        <path
          d="M 132 130 C 148 128 158 118 160 102 C 162 86 152 74 132 72"
          fill="none"
          stroke="url(#${uid}-gold)"
          stroke-width="3.5"
          stroke-linecap="round"
        />

        <ellipse cx="100" cy="72" rx="34" ry="9" fill="none" stroke="url(#${uid}-gold)" stroke-width="3" />

        ${renderSparkles(filledCount)}

        ${filledCount >= SLICES ? `
          <text x="100" y="175" text-anchor="middle" font-size="28" fill="#fef08a">★</text>
        ` : ''}
      </svg>
      <p class="progress-caption">${filledCount} / ${SLICES} за месяц · ${percent}%</p>
    </div>
  `;
}
