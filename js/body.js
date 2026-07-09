import { BODY_PARTS } from './config.js';

const BODY_SVG = `
<svg class="body-svg" viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg" aria-label="Силуэт человека">
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <ellipse id="head" class="body-part" cx="100" cy="35" rx="24" ry="28" />
  <rect id="neck" class="body-part" x="92" y="60" width="16" height="14" rx="4" />
  <path id="torso" class="body-part" d="M70 74 Q100 90 130 74 L125 170 Q100 180 75 170 Z" />
  <path id="leftArm" class="body-part" d="M70 78 L45 130 L55 135 L72 95 Z" />
  <path id="rightArm" class="body-part" d="M130 78 L155 130 L145 135 L128 95 Z" />
  <ellipse id="leftHand" class="body-part" cx="50" cy="142" rx="10" ry="12" />
  <ellipse id="rightHand" class="body-part" cx="150" cy="142" rx="10" ry="12" />
  <path id="leftLeg" class="body-part" d="M82 170 L72 290 L88 295 L98 180 Z" />
  <path id="rightLeg" class="body-part" d="M118 170 L128 290 L112 295 L102 180 Z" />
</svg>`;

export function renderBody(container, filledParts) {
  container.innerHTML = BODY_SVG;

  BODY_PARTS.forEach(({ id }) => {
    const part = container.querySelector(`#${id}`);
    if (part && filledParts.includes(id)) {
      part.classList.add('filled');
    }
  });
}
