import { MONTHLY_GOAL } from './config.js';

const SLICES = MONTHLY_GOAL;

function beerColor(index) {
  const t = index / SLICES;
  const light = 42 + t * 18;
  const hue = 38 - t * 8;
  return `hsl(${hue}, 88%, ${light}%)`;
}

export function renderBody(container, totalPoints) {
  const filledCount = Math.min(SLICES, Math.max(0, Math.floor(totalPoints)));
  const percent = Math.min(100, Math.round((totalPoints / SLICES) * 100));
  const showFoam = filledCount > 0;

  const slices = Array.from({ length: SLICES }, (_, index) => {
    const filled = index < filledCount;
    const level = index + 1;
    return `<div class="glass-slice${filled ? ' filled' : ''}" data-level="${level}" style="${filled ? `background:${beerColor(index)}` : ''}"></div>`;
  }).join('');

  container.innerHTML = `
    <div class="glass-widget" aria-label="Прогресс за месяц — бокал пива">
      <div class="glass-scene">
        <div class="glass-fill-track">
          <div class="glass-slices">${slices}</div>
          ${showFoam ? `<div class="glass-foam" style="--fill-percent:${percent}%"></div>` : ''}
        </div>
        <img src="assets/beer-glass.jpg" alt="Бокал пива" class="glass-image" />
      </div>
      <p class="glass-caption">${filledCount} / ${SLICES} за месяц · ${percent}%</p>
    </div>
  `;
}
