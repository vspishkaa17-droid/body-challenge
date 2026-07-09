import { MONTHLY_GOAL } from './config.js';

const SLICES = MONTHLY_GOAL;
const GLASS_TOP = 108;
const GLASS_BOTTOM = 352;
const GLASS_HEIGHT = GLASS_BOTTOM - GLASS_TOP;

function renderSliceLines(filledCount) {
  return Array.from({ length: SLICES - 1 }, (_, index) => {
    const level = index + 1;
    if (level > filledCount) return '';

    const y = GLASS_BOTTOM - (GLASS_HEIGHT * level) / SLICES;
    return `<line x1="62" y1="${y}" x2="138" y2="${y}" stroke="rgba(62,26,0,0.18)" stroke-width="0.55" />`;
  }).join('');
}

function renderBubbles(filledCount) {
  if (filledCount <= 0) return '';

  const fillY = GLASS_BOTTOM - (GLASS_HEIGHT * filledCount) / SLICES;
  return `
    <circle cx="92" cy="${fillY + 40}" r="1.6" fill="rgba(255,255,255,0.35)" />
    <circle cx="108" cy="${fillY + 70}" r="1.2" fill="rgba(255,255,255,0.28)" />
    <circle cx="98" cy="${fillY + 110}" r="1.8" fill="rgba(255,255,255,0.22)" />
    <circle cx="112" cy="${fillY + 55}" r="1" fill="rgba(255,255,255,0.3)" />
  `;
}

export function renderBody(container, totalPoints) {
  const filledCount = Math.min(SLICES, Math.max(0, Math.floor(totalPoints)));
  const percent = Math.min(100, Math.round((totalPoints / SLICES) * 100));
  const fillHeight = (GLASS_HEIGHT * filledCount) / SLICES;
  const fillY = GLASS_BOTTOM - fillHeight;
  const showFoam = filledCount > 0;
  const uid = `glass-${Date.now()}`;

  container.innerHTML = `
    <div class="glass-widget" aria-label="Прогресс за месяц — бокал пива">
      <svg class="glass-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Бокал пива">
        <defs>
          <clipPath id="${uid}-inner">
            <path d="M 82 350 C 70 300 66 245 70 198 C 74 152 82 118 100 112 C 118 118 126 152 130 198 C 134 245 130 300 118 350 Z" />
          </clipPath>
          <clipPath id="${uid}-level">
            <rect x="0" y="${fillY}" width="200" height="${fillHeight + 1}" />
          </clipPath>
          <linearGradient id="${uid}-beer" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#92400e" />
            <stop offset="35%" stop-color="#d97706" />
            <stop offset="75%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#fef3c7" />
          </linearGradient>
          <linearGradient id="${uid}-glass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.42)" />
            <stop offset="18%" stop-color="rgba(255,255,255,0.08)" />
            <stop offset="55%" stop-color="rgba(255,255,255,0.03)" />
            <stop offset="82%" stop-color="rgba(255,255,255,0.12)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.32)" />
          </linearGradient>
          <radialGradient id="${uid}-shine" cx="28%" cy="22%" r="55%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.55)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="368" rx="34" ry="7" fill="rgba(0,0,0,0.28)" />

        <path
          d="M 72 356 C 56 295 52 230 58 172 C 64 118 76 84 100 78 C 124 84 136 118 142 172 C 148 230 144 295 128 356 C 100 368 72 356 72 356 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.18)"
          stroke-width="1.5"
        />

        <g clip-path="url(#${uid}-inner)">
          <g clip-path="url(#${uid}-level)">
            <rect x="54" y="${GLASS_TOP}" width="92" height="${GLASS_HEIGHT}" fill="url(#${uid}-beer)" />
            ${renderSliceLines(filledCount)}
            ${renderBubbles(filledCount)}
          </g>
          ${showFoam ? `
            <ellipse cx="100" cy="${fillY + 3}" rx="26" ry="6" fill="#fffdf7" opacity="0.96" />
            <ellipse cx="100" cy="${fillY + 1}" rx="18" ry="3" fill="#ffffff" opacity="0.55" />
          ` : ''}
        </g>

        <path
          d="M 72 356 C 56 295 52 230 58 172 C 64 118 76 84 100 78 C 124 84 136 118 142 172 C 148 230 144 295 128 356 C 100 368 72 356 72 356 Z"
          fill="url(#${uid}-glass)"
          stroke="rgba(255,255,255,0.78)"
          stroke-width="2.4"
        />
        <path
          d="M 72 356 C 56 295 52 230 58 172 C 64 118 76 84 100 78 C 124 84 136 118 142 172 C 148 230 144 295 128 356 Z"
          fill="url(#${uid}-shine)"
          stroke="none"
        />
        <ellipse cx="100" cy="78" rx="38" ry="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.72)" stroke-width="2.2" />
        <ellipse cx="100" cy="356" rx="30" ry="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" />
        <path d="M 86 92 L 86 352" stroke="rgba(255,255,255,0.28)" stroke-width="2.3" stroke-linecap="round" />
        <path d="M 114 130 Q 100 138 86 130" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.2" />
        <path d="M 112 236 Q 100 244 88 236" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      </svg>
      <p class="glass-caption">${filledCount} / ${SLICES} за месяц · ${percent}%</p>
    </div>
  `;
}
