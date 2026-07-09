import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DAILY_GOAL,
  ACTIVITY_LABELS,
  isConfigured,
} from './config.js';
import {
  calculatePoints,
  getFilledParts,
  getProgressPercent,
  getTodayDate,
  getWeekRange,
  formatActivityLabel,
} from './points.js';
import { renderBody } from './body.js';

const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const setupScreen = document.getElementById('setup-screen');
const authError = document.getElementById('auth-error');
const welcomeText = document.getElementById('welcome-text');
const bodyContainer = document.getElementById('body-container');
const progressPercent = document.getElementById('progress-percent');
const progressFill = document.getElementById('progress-fill');
const pointsTodayEl = document.getElementById('points-today');
const dailyGoalEl = document.getElementById('daily-goal');
const completionMessage = document.getElementById('completion-message');
const activityList = document.getElementById('activity-list');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const weekRangeEl = document.getElementById('week-range');
const toastEl = document.getElementById('toast');

let supabase = null;
let currentUser = null;
let currentProfile = null;

function showScreen(screen) {
  [authScreen, mainScreen, setupScreen].forEach((el) => el.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function showError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

function clearError() {
  authError.textContent = '';
  authError.classList.add('hidden');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 2200);
}

function updateBodyUI(totalPoints) {
  const percent = getProgressPercent(totalPoints);
  const filledParts = getFilledParts(totalPoints);

  renderBody(bodyContainer, filledParts);
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  pointsTodayEl.textContent = String(totalPoints);
  dailyGoalEl.textContent = String(DAILY_GOAL);

  if (percent >= 100) {
    completionMessage.classList.remove('hidden');
  } else {
    completionMessage.classList.add('hidden');
  }
}

function renderActivities(activities) {
  activityList.innerHTML = '';

  if (!activities.length) {
    activityList.innerHTML = '<li class="empty">Пока нет активности за сегодня. Начни с первого упражнения!</li>';
    return;
  }

  activities.forEach((activity) => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    li.innerHTML = `
      <span>${ACTIVITY_LABELS[activity.type] ?? activity.type}: ${formatActivityLabel(activity.type, activity.amount)}</span>
      <span class="points">+${activity.points}</span>
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
    const isMe = row.user_id === currentUser?.id;

    li.className = `leaderboard-item${isMe ? ' me' : ''}`;
    li.innerHTML = `
      <div class="rank ${rankClass}">${index + 1}</div>
      <div>
        <div class="leaderboard-name">${row.display_name}${isMe ? ' (вы)' : ''}</div>
        <div class="week-range">${row.activity_count} записей</div>
      </div>
      <div class="leaderboard-points">${row.weekly_points} очк.</div>
    `;
    leaderboardEl.appendChild(li);
  });
}

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function loadTodayActivities() {
  const today = getTodayDate();
  const { data, error } = await supabase
    .from('activities')
    .select('id, type, amount, points, created_at')
    .eq('user_id', currentUser.id)
    .eq('activity_date', today)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function loadLeaderboard() {
  const week = getWeekRange();
  weekRangeEl.textContent = week.label;

  const { data, error } = await supabase.rpc('weekly_leaderboard', {
    week_start: week.start,
    week_end: week.end,
  });

  if (error) throw error;
  return data ?? [];
}

async function refreshDashboard() {
  const activities = await loadTodayActivities();
  const totalPoints = activities.reduce((sum, item) => sum + Number(item.points), 0);

  updateBodyUI(totalPoints);
  renderActivities(activities);

  const leaderboard = await loadLeaderboard();
  renderLeaderboard(leaderboard);
}

async function addActivity(type, amount) {
  const points = calculatePoints(type, amount);
  const today = getTodayDate();

  const { error } = await supabase.from('activities').insert({
    user_id: currentUser.id,
    type,
    amount,
    points,
    activity_date: today,
  });

  if (error) throw error;

  showToast(`+${points} очков`);
  await refreshDashboard();
}

async function handleAuthSession(session) {
  if (!session?.user) {
    currentUser = null;
    currentProfile = null;
    showScreen(authScreen);
    return;
  }

  currentUser = session.user;
  currentProfile = await loadProfile(currentUser.id);
  welcomeText.textContent = `Привет, ${currentProfile.display_name}!`;
  showScreen(mainScreen);
  await refreshDashboard();
}

async function init() {
  if (!isConfigured()) {
    showScreen(setupScreen);
    return;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await supabase.auth.getSession();
  await handleAuthSession(data.session);

  supabase.auth.onAuthStateChange((_event, session) => {
    handleAuthSession(session).catch((err) => showError(err.message));
  });

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showError(error.message);
  });

  document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();

    const displayName = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      showError(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName,
      });

      if (profileError) {
        showError(profileError.message);
        return;
      }
    }

    showToast('Аккаунт создан. Проверьте email, если включено подтверждение.');
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });

  document.querySelectorAll('.btn.action').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await addActivity(button.dataset.type, Number(button.dataset.amount));
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.getElementById('custom-activity-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const type = document.getElementById('activity-type').value;
    const amount = Number(document.getElementById('activity-amount').value);

    try {
      await addActivity(type, amount);
      event.target.reset();
    } catch (err) {
      showToast(err.message);
    }
  });
}

init().catch((err) => {
  console.error(err);
  showScreen(setupScreen);
});
