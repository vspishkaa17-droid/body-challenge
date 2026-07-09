import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  MONTHLY_GOAL,
  ACTIVITY_LABELS,
  PARTICIPANTS,
  STEPS_PER_POINT,
  isConfigured,
  isValidParticipant,
  isBinaryActivity,
} from './config.js';
import {
  calculatePoints,
  getProgressPercent,
  getTodayDate,
  getMonthRange,
  formatActivityLabel,
  formatActivityDate,
  stepsUntilNextPoint,
} from './points.js';
import { renderBody } from './body.js';

const STORAGE_KEY = 'body-challenge-participant';

const pickerScreen = document.getElementById('picker-screen');
const mainScreen = document.getElementById('main-screen');
const setupScreen = document.getElementById('setup-screen');
const participantList = document.getElementById('participant-list');
const welcomeText = document.getElementById('welcome-text');
const bodyContainer = document.getElementById('body-container');
const progressPercent = document.getElementById('progress-percent');
const progressFill = document.getElementById('progress-fill');
const pointsMonthEl = document.getElementById('points-month');
const monthlyGoalEl = document.getElementById('monthly-goal');
const completionMessage = document.getElementById('completion-message');
const activityList = document.getElementById('activity-list');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const monthRangeEl = document.getElementById('month-range');
const toastEl = document.getElementById('toast');

let supabase = null;
let currentParticipant = null;

function showScreen(screen) {
  [pickerScreen, mainScreen, setupScreen].forEach((el) => el.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 2200);
}

function formatNetworkError(err) {
  const message = err?.message ?? String(err);
  if (message.includes('Failed to fetch')) {
    return 'Не удалось связаться с Supabase. Проверьте ключи в config.js.';
  }
  return message;
}

function getSavedParticipant() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return isValidParticipant(saved) ? saved : null;
}

function saveParticipant(name) {
  localStorage.setItem(STORAGE_KEY, name);
  currentParticipant = name;
}

function renderParticipantPicker() {
  participantList.innerHTML = '';

  PARTICIPANTS.forEach((name) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn participant-btn';
    button.textContent = name;
    button.addEventListener('click', () => {
      saveParticipant(name);
      openMainScreen();
    });
    participantList.appendChild(button);
  });
}

function updateBodyUI(totalPoints) {
  const percent = getProgressPercent(totalPoints);

  renderBody(bodyContainer, totalPoints);
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  pointsMonthEl.textContent = String(totalPoints);
  monthlyGoalEl.textContent = String(MONTHLY_GOAL);

  completionMessage.classList.toggle('hidden', percent < 100);
}

function renderActivities(activities) {
  activityList.innerHTML = '';

  if (!activities.length) {
    activityList.innerHTML = '<li class="empty">Пока нет активности в этом месяце. Начни с первого упражнения!</li>';
    return;
  }

  activities.forEach((activity) => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    li.innerHTML = `
      <span class="activity-text">${formatActivityDate(activity.activity_date)} · ${ACTIVITY_LABELS[activity.type] ?? activity.type}: ${formatActivityLabel(activity.type, activity.amount)}</span>
      <div class="activity-actions">
        <span class="points">${activity.type === 'steps' && Number(activity.points) === 0 ? '—' : `+${activity.points}`}</span>
        <button type="button" class="btn-delete" data-delete-id="${activity.id}" aria-label="Удалить активность">×</button>
      </div>
    `;
    activityList.appendChild(li);
  });
}

function renderLeaderboard(rows) {
  leaderboardEl.innerHTML = '';

  if (!rows.length) {
    leaderboardEmpty.classList.remove('hidden');
    return;
  }

  leaderboardEmpty.classList.add('hidden');

  rows.forEach((row, index) => {
    const li = document.createElement('li');
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
    const isMe = row.participant_name === currentParticipant;

    li.className = `leaderboard-item${isMe ? ' me' : ''}`;
    li.innerHTML = `
      <div class="rank ${rankClass}">${index + 1}</div>
      <div>
        <div class="leaderboard-name">${row.participant_name}${isMe ? ' (вы)' : ''}</div>
      </div>
      <div class="leaderboard-points">${row.monthly_points} очк.</div>
    `;
    leaderboardEl.appendChild(li);
  });
}

async function loadMonthActivities() {
  const month = getMonthRange();
  const { data, error } = await supabase
    .from('challenge_activities')
    .select('id, type, amount, points, activity_date, created_at')
    .eq('participant_name', currentParticipant)
    .gte('activity_date', month.start)
    .lte('activity_date', month.end)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function loadLeaderboard() {
  const month = getMonthRange();
  monthRangeEl.textContent = month.label;

  const { data, error } = await supabase.rpc('weekly_leaderboard_simple', {
    week_start: month.start,
    week_end: month.end,
  });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    monthly_points: row.weekly_points,
  }));
}

async function loadTodayBinaryDone() {
  const today = getTodayDate();
  const { data, error } = await supabase
    .from('challenge_activities')
    .select('type')
    .eq('participant_name', currentParticipant)
    .eq('activity_date', today)
    .in('type', ['workout', 'training', 'pushups', 'stretching']);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.type));
}

function countActivitiesByType(activities) {
  const counts = {
    workout: 0,
    training: 0,
    pushups: 0,
    stretching: 0,
    steps: 0,
  };
  let totalSteps = 0;

  activities.forEach((activity) => {
    if (activity.type in counts) {
      counts[activity.type] += 1;
    }
    if (activity.type === 'steps') {
      totalSteps += Number(activity.amount);
    }
  });

  return { counts, totalSteps };
}

function updateBinaryButtons(doneToday, counts) {
  document.querySelectorAll('.btn.action').forEach((button) => {
    const type = button.dataset.type;
    const label = button.dataset.label;
    const done = doneToday.has(type);
    const total = counts[type] ?? 0;

    button.disabled = done;
    button.classList.toggle('done', done);
    button.textContent = `${done ? '✓' : '+'} ${label} (${total})`;
  });
}

function updateStepsLabel(counts, totalSteps) {
  const label = document.getElementById('steps-label');
  if (!label) return;

  const entries = counts.steps ?? 0;
  const untilNext = stepsUntilNextPoint(totalSteps);
  label.textContent = `Шаги — 10 000 = 1 балл (${entries}) · всего ${totalSteps.toLocaleString('ru-RU')} · до балла ${untilNext.toLocaleString('ru-RU')}`;
}

async function getMonthStepTotal() {
  const month = getMonthRange();
  const { data, error } = await supabase
    .from('challenge_activities')
    .select('amount')
    .eq('participant_name', currentParticipant)
    .eq('type', 'steps')
    .gte('activity_date', month.start)
    .lte('activity_date', month.end);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

async function recalculateStepPointsForMonth() {
  const month = getMonthRange();
  const { data: steps, error } = await supabase
    .from('challenge_activities')
    .select('id, amount, created_at')
    .eq('participant_name', currentParticipant)
    .eq('type', 'steps')
    .gte('activity_date', month.start)
    .lte('activity_date', month.end)
    .order('created_at', { ascending: true });

  if (error) throw error;

  let cumulative = 0;
  let awarded = 0;

  for (const step of steps ?? []) {
    cumulative += Number(step.amount);
    const shouldHave = Math.floor(cumulative / STEPS_PER_POINT);
    const entryPoints = shouldHave - awarded;
    awarded = shouldHave;

    const { error: updateError } = await supabase
      .from('challenge_activities')
      .update({ points: entryPoints })
      .eq('id', step.id);

    if (updateError) throw updateError;
  }
}

async function deleteActivity(id) {
  const { data, error } = await supabase
    .from('challenge_activities')
    .delete()
    .eq('id', id)
    .eq('participant_name', currentParticipant)
    .select('id, type');

  if (error) throw error;

  if (!data?.length) {
    throw new Error('Не удалось удалить. Выполните supabase/fix-delete-and-steps.sql в Supabase.');
  }

  const hadSteps = data.some((row) => row.type === 'steps');
  if (hadSteps) {
    await recalculateStepPointsForMonth();
  }

  showToast('Активность удалена');
  await refreshDashboard();
}

async function addActivity(type, amount) {
  if (type === 'steps') {
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Укажите количество шагов');
      return;
    }

    const previousStepTotal = await getMonthStepTotal();
    const points = calculatePoints(type, amount, previousStepTotal);
    const today = getTodayDate();

    const { error } = await supabase.from('challenge_activities').insert({
      participant_name: currentParticipant,
      type,
      amount,
      points,
      activity_date: today,
    });

    if (error) throw error;

    if (points > 0) {
      showToast(`+${points} ${points === 1 ? 'балл' : 'балла'} за шаги`);
    } else {
      const total = previousStepTotal + amount;
      showToast(`Шаги сохранены · до балла ${stepsUntilNextPoint(total).toLocaleString('ru-RU')}`);
    }

    await refreshDashboard();
    return;
  }

  const points = calculatePoints(type, amount);

  if (isBinaryActivity(type)) {
    const doneToday = await loadTodayBinaryDone();
    if (doneToday.has(type)) {
      showToast('Уже отмечено сегодня');
      return;
    }
    amount = 1;
  }

  const today = getTodayDate();

  const { error } = await supabase.from('challenge_activities').insert({
    participant_name: currentParticipant,
    type,
    amount,
    points,
    activity_date: today,
  });

  if (error) throw error;

  showToast(`+${points} ${points === 1 ? 'балл' : 'балла'}`);
  await refreshDashboard();
}

async function refreshDashboard() {
  const activities = await loadMonthActivities();
  const totalPoints = activities.reduce((sum, item) => sum + Number(item.points), 0);

  updateBodyUI(totalPoints);
  renderActivities(activities);

  const { counts, totalSteps } = countActivitiesByType(activities);
  const doneToday = await loadTodayBinaryDone();
  updateBinaryButtons(doneToday, counts);
  updateStepsLabel(counts, totalSteps);

  const leaderboard = await loadLeaderboard();
  renderLeaderboard(leaderboard);
}

async function openMainScreen() {
  const month = getMonthRange();
  document.getElementById('month-title').textContent = month.label;
  welcomeText.textContent = `Привет, ${currentParticipant}!`;
  showScreen(mainScreen);
  await refreshDashboard();
}

async function init() {
  if (!isConfigured()) {
    showScreen(setupScreen);
    return;
  }

  if (!PARTICIPANTS.length) {
    setupScreen.querySelector('.setup-steps').innerHTML =
      '<li>Добавьте имена участников в <code>js/config.js</code></li>';
    showScreen(setupScreen);
    return;
  }

  supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  if (!supabase) {
    participantList.innerHTML =
      '<p class="empty">Не загрузилась библиотека Supabase. Отключите блокировщик рекламы или попробуйте другой браузер, затем обновите страницу.</p>';
    showScreen(pickerScreen);
    return;
  }

  renderParticipantPicker();

  document.getElementById('change-user-btn').addEventListener('click', () => {
    showScreen(pickerScreen);
  });

  document.querySelectorAll('.btn.action').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await addActivity(button.dataset.type, 1);
      } catch (err) {
        showToast(formatNetworkError(err));
      }
    });
  });

  document.getElementById('steps-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = Number(document.getElementById('steps-amount').value);

    try {
      await addActivity('steps', amount);
      event.target.reset();
    } catch (err) {
      showToast(formatNetworkError(err));
    }
  });

  activityList.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;

    try {
      await deleteActivity(button.dataset.deleteId);
    } catch (err) {
      showToast(formatNetworkError(err));
    }
  });

  const saved = getSavedParticipant();
  if (saved) {
    currentParticipant = saved;
    await openMainScreen();
    return;
  }

  showScreen(pickerScreen);
}

init().catch((err) => {
  console.error(err);
  if (!isConfigured()) {
    showScreen(setupScreen);
    return;
  }
  showScreen(pickerScreen);
  showToast(formatNetworkError(err));
});