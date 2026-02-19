/**
 * app.js
 * ======
 * Main Entry Point — Das Gleichgewichtsspiel Pro Edition
 * Orchestrates: gameLogic, ui, storage, i18n, audio, stats, teacher mode.
 * Author: Higer
 */

// ─── Module Imports ──────────────────────────────────────────
import {
  createInitialState, generateInstruction, validateAnswer,
  computerPlay, checkAchievements, calculateScore,
  getLevelFromStreak, getLevelProgress, buildHint, LEVELS,
} from './gameLogic.js';

import {
  initBackground, initConfetti, triggerConfetti,
  renderInstruction, updateBalances, setBalancesImmediate,
  updateScoreUI, showSuccess, showError, showComputerResult,
  hideFeedback, showUserInputArea, showComputerThinking,
  highlightInputs, getInputValues, setCheckBtnEnabled,
  addLogEntry, clearGameLog, renderAchievements,
  showAchievementToast, showLevelUp, showScorePopup,
  setHighScoreDisplay, updateTicketStack,
} from './ui.js';

import {
  loadSave, saveProgress, saveOnNewGame,
  updateHighScore, getHighScore, getUnlockedAchievements,
} from './storage.js';

import { initI18n, setLang, t } from './i18n.js';
import {
  initAudio, setAudioEnabled, isAudioEnabled, unlockAudio,
  playSuccess, playError, playLevelUp, playClick,
  playTicket, playStreak, playAchievement,
} from './audio.js';
import {
  recordAttempt, recordSession, loadStats,
  renderDashboard, renderHeatmap, clearStats,
} from './stats.js';

// ─── State ───────────────────────────────────────────────────
let state;

// ─── Teacher Mode Config ─────────────────────────────────────
const teacher = {
  active: false,
  lockedLevel: -1, // -1 = auto
  timerSecs: 0,
  cheatSheet: false,
  customMin: 1,
  customMax: 10,
};
let _timerInterval = null;

// ─── Init ─────────────────────────────────────────────────────
function init() {
  console.log('%c🎮 Das Gleichgewichtsspiel – Pro Edition', 'color:#00d4ff;font-family:monospace;font-size:1.2em;font-weight:bold;');
  console.log('%cMade by Higer | github.com/Higer', 'color:#a855f7;font-family:monospace;');
  console.log('%cSecret: Type "lehrer" to unlock Teacher Mode 🎓', 'color:#fbbf24;font-family:monospace;');

  // Init subsystems
  initI18n();
  initBackground();
  initConfetti();
  const audioOn = initAudio();
  updateAudioIcon(audioOn);

  // Restore saved data
  const savedData = loadSave();
  state = createInitialState();
  state.unlockedAchievements    = new Set(getUnlockedAchievements());
  state.maxStreak               = savedData.maxStreak ?? 0;
  state.maxLevel                = savedData.maxLevel  ?? 0;
  state.negativeNegativeCorrect = savedData.negativeNegativeCorrect ?? 0;

  setBalancesImmediate(0, 0);
  setHighScoreDisplay(getHighScore());
  renderAchievements(state.unlockedAchievements);
  updateScoreUI(state, getLevelProgress(state.currentStreak, state.currentLevel));

  bindEvents();
  bindTeacherSecretKey();

  if (getHighScore() === 0 && !savedData.lastPlayed) {
    openRulesModal();
  } else {
    startUserTurn();
  }
}

// ─── Event Binding ────────────────────────────────────────────
function bindEvents() {
  // Game buttons
  document.getElementById('checkBtn')?.addEventListener('click', () => { unlockAudio(); playClick(); handleCheck(); });
  document.getElementById('newGameBtn')?.addEventListener('click', () => { playClick(); handleNewGame(); });

  // Enter key navigation
  document.getElementById('expressionInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('balanceInput')?.focus(); }
  });
  document.getElementById('balanceInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); unlockAudio(); handleCheck(); }
  });

  // Rules modal
  document.getElementById('openRules')?.addEventListener('click', () => { playClick(); openRulesModal(); });
  document.getElementById('closeRules')?.addEventListener('click', closeRulesModal);
  document.getElementById('closeRulesBtn')?.addEventListener('click', () => {
    closeRulesModal();
    if (!state.currentInstruction) startUserTurn();
  });
  document.getElementById('rulesBackdrop')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('rulesBackdrop')) {
      closeRulesModal();
      if (!state.currentInstruction) startUserTurn();
    }
  });

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => { playClick(); setLang(btn.dataset.lang); });
  });

  // Audio toggle
  document.getElementById('audioToggle')?.addEventListener('click', () => {
    const newVal = !isAudioEnabled();
    setAudioEnabled(newVal);
    updateAudioIcon(newVal);
    if (newVal) { unlockAudio(); playClick(); }
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // Stats reset
  document.getElementById('resetStats')?.addEventListener('click', () => {
    if (confirm('Alle Statistiken wirklich zurücksetzen?')) {
      clearStats();
      renderDashboard(state);
    }
  });

  // Teacher modal
  document.getElementById('teacherModeBtn')?.addEventListener('click', () => { playClick(); openTeacherModal(); });
  document.getElementById('closeTeacher')?.addEventListener('click', closeTeacherModal);
  document.getElementById('teacherBackdrop')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('teacherBackdrop')) closeTeacherModal();
  });
  document.getElementById('applyTeacher')?.addEventListener('click', applyTeacherSettings);

  // Teacher mode controls
  document.getElementById('teacherTimer')?.addEventListener('input', (e) => {
    const v = +e.target.value;
    const display = document.getElementById('teacherTimerDisplay');
    if (display) display.textContent = v === 0 ? 'Aus' : `${v}s`;
  });
  document.getElementById('teacherCheatSheet')?.addEventListener('change', (e) => {
    document.getElementById('cheatSheetPanel')?.classList.toggle('hidden', !e.target.checked);
  });

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeRulesModal(); closeTeacherModal(); }
  });

  // Language change event → re-render UI strings
  window.addEventListener('langchange', () => {
    clearGameLog();
    if (state.currentTurn === 'user') renderTurnBadgeOnly('user');
  });
}

function renderTurnBadgeOnly(turn) {
  const badge = document.getElementById('turnBadge');
  if (badge) badge.textContent = turn === 'user' ? `🎮 ${t('your_turn_badge')}` : `🤖 ${t('computer')}`;
}

// ─── Teacher Secret Key ───────────────────────────────────────
function bindTeacherSecretKey() {
  let buffer = '';
  document.addEventListener('keydown', (e) => {
    buffer += e.key.toLowerCase();
    buffer  = buffer.slice(-7);
    if (buffer === 'lehrer') {
      const btn = document.getElementById('teacherModeBtn');
      if (btn) {
        btn.classList.remove('hidden');
        btn.classList.add('animate-bounce');
        setTimeout(() => btn.classList.remove('animate-bounce'), 2000);
      }
      teacher.active = true;
      showNotification('🎓 Lehrermodus freigeschaltet!', '#fbbf24');
    }
  });
}

// ─── Tab Switching ─────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-content').forEach((c) => c.classList.toggle('hidden', c.id !== `tab-${tabId}`));

  if (tabId === 'stats') renderDashboard(state);
  if (tabId === 'tickets') updateTicketStack(state.userBalance, state.currentInstruction);
}

// ─── User Turn ────────────────────────────────────────────────
function startUserTurn() {
  state.currentTurn = 'user';
  state.gameRound++;

  const effectiveLevel = teacher.active && teacher.lockedLevel >= 0
    ? teacher.lockedLevel
    : state.currentLevel;

  state.currentInstruction = generateInstruction(effectiveLevel, state.userBalance, teacher);

  hideFeedback();
  showUserInputArea();
  setCheckBtnEnabled(true);
  renderInstruction(state.currentInstruction, 'user');

  // Teacher cheat overlay
  updateCheatOverlay(state.currentInstruction);

  // Timer
  if (teacher.active && teacher.timerSecs > 0) startTurnTimer(teacher.timerSecs);

  setTimeout(() => document.getElementById('expressionInput')?.focus(), 100);
}

function updateCheatOverlay(instruction) {
  const overlay = document.getElementById('cheatOverlay');
  const answer  = document.getElementById('cheatAnswer');
  if (!overlay || !answer) return;
  if (teacher.active && teacher.cheatSheet && instruction) {
    overlay.classList.remove('hidden');
    answer.textContent = `${instruction.correctExpression} → Neuer Kontostand: ${instruction.newBalance}`;
  } else {
    overlay.classList.add('hidden');
  }
}

// ─── Timer ────────────────────────────────────────────────────
function startTurnTimer(secs) {
  clearInterval(_timerInterval);
  let remaining = secs;
  const disp = document.getElementById('timerDisplay');
  const val  = document.getElementById('timerValue');
  if (disp) disp.classList.remove('hidden');
  if (val)  val.textContent = remaining;

  _timerInterval = setInterval(() => {
    remaining--;
    if (val) val.textContent = remaining;
    if (remaining <= 5) { document.getElementById('timerDisplay')?.classList.add('warning'); }
    if (remaining <= 0) {
      clearInterval(_timerInterval);
      if (state.currentTurn === 'user') {
        playError();
        showError(`⏱️ Zeit abgelaufen! Die richtige Antwort wäre: <strong>${state.currentInstruction.correctExpression}</strong>`);
        state.currentStreak = 0;
        state.totalAttempts++;
        recordAttempt(false, state.currentInstruction);
        updateScoreUI(state, getLevelProgress(0, 0));
        setTimeout(() => { stopTimer(); startComputerTurn(); }, 2500);
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(_timerInterval);
  const disp = document.getElementById('timerDisplay');
  if (disp) { disp.classList.add('hidden'); disp.classList.remove('warning'); }
}

// ─── Check Handler ─────────────────────────────────────────────
function handleCheck() {
  if (state.currentTurn !== 'user' || !state.currentInstruction) return;
  const { expression, balance } = getInputValues();
  if (!expression.trim() || balance === '') {
    showError(t('incorrect_title') + ' — Bitte beide Felder ausfüllen!');
    return;
  }
  setCheckBtnEnabled(false);
  stopTimer();

  const result = validateAnswer(expression, balance, state.currentInstruction);
  highlightInputs(result.expressionOk, result.balanceOk);
  recordAttempt(result.allOk, state.currentInstruction);

  if (result.allOk) handleCorrectAnswer();
  else handleIncorrectAnswer(result);
}

// ─── Correct ──────────────────────────────────────────────────
function handleCorrectAnswer() {
  const instruction = state.currentInstruction;
  const prevLevel   = state.currentLevel;

  state.currentStreak++;
  state.totalCorrect++;
  state.totalAttempts++;
  if (instruction.isNegNeg) state.negativeNegativeCorrect++;
  state.maxStreak = Math.max(state.maxStreak, state.currentStreak);

  const scored  = calculateScore(state.currentLevel, state.currentStreak);
  state.score  += scored;
  showScorePopup(scored);
  playSuccess();
  if (state.currentStreak % 5 === 0) { playStreak(); triggerConfetti(); }

  const newLevelIndex = getLevelFromStreak(state.currentStreak);
  const leveledUp     = newLevelIndex > state.currentLevel;
  state.currentLevel  = newLevelIndex;
  state.maxLevel      = Math.max(state.maxLevel, newLevelIndex);

  const oldUserBal  = state.userBalance;
  state.userBalance = instruction.newBalance;
  updateBalances(oldUserBal, state.userBalance, state.computerBalance, state.computerBalance);
  updateTicketStack(state.userBalance, instruction);
  playTicket();

  showSuccess(scored, instruction);
  addLogEntry(
    `🎮 Du: <strong>${instruction.action.de} ${instruction.amount} ${instruction.itemType.de}</strong> → <span class="font-mono">${instruction.correctExpression}</span> = ${instruction.newBalance}`,
    'user', true
  );

  const progress = getLevelProgress(state.currentStreak, state.currentLevel);
  updateScoreUI(state, progress);

  if (leveledUp) { setTimeout(() => { playLevelUp(); showLevelUp(state.currentLevel); }, 300); }

  const newAchs = checkAchievements(state);
  for (const ach of newAchs) {
    setTimeout(() => { playAchievement(); showAchievementToast(ach); renderAchievements(state.unlockedAchievements); }, leveledUp ? 1800 : 600);
  }

  updateHighScore(state.score);
  setHighScoreDisplay(Math.max(state.score, getHighScore()));
  saveProgress(state);
  setTimeout(startComputerTurn, 2000);
}

// ─── Incorrect ────────────────────────────────────────────────
function handleIncorrectAnswer(result) {
  state.currentStreak = 0;
  state.totalAttempts++;
  state.currentLevel  = getLevelFromStreak(0);
  playError();

  const hint = buildHint(state.currentInstruction);
  showError(hint);
  addLogEntry(
    `🎮 Du: Falsch → <strong>${state.currentInstruction.action.de} ${state.currentInstruction.amount} ${state.currentInstruction.itemType.de}</strong>`,
    'user', false
  );

  const progress = getLevelProgress(state.currentStreak, state.currentLevel);
  updateScoreUI(state, progress);
  saveProgress(state);

  setTimeout(() => {
    setCheckBtnEnabled(true);
    const ex = document.getElementById('expressionInput');
    const bl = document.getElementById('balanceInput');
    if (ex) { ex.value = ''; ex.classList.remove('input-correct','input-error'); }
    if (bl) { bl.value = ''; bl.classList.remove('input-correct','input-error'); }
    ex?.focus();
  }, 2200);
}

// ─── Computer Turn ─────────────────────────────────────────────
function startComputerTurn() {
  state.currentTurn = 'computer';
  hideFeedback();
  showComputerThinking();

  const compLevel = teacher.active && teacher.lockedLevel >= 0 ? teacher.lockedLevel : state.currentLevel;
  const compInstr = generateInstruction(compLevel, state.computerBalance);
  renderInstruction(compInstr, 'computer');

  setTimeout(() => {
    const { instruction, newComputerBal } = computerPlay(compLevel, state.computerBalance);
    const oldCompBal       = state.computerBalance;
    state.computerBalance  = newComputerBal;

    updateBalances(state.userBalance, state.userBalance, oldCompBal, state.computerBalance);
    showComputerResult(instruction, newComputerBal);
    addLogEntry(
      `🤖 PC: <strong>${instruction.action.de} ${instruction.amount} ${instruction.itemType.de}</strong> → <span class="font-mono">${instruction.correctExpression}</span> = ${newComputerBal}`,
      'computer', true
    );

    saveProgress(state);
    setTimeout(startUserTurn, 2500);
  }, 1500);
}

// ─── New Game ──────────────────────────────────────────────────
function handleNewGame() {
  stopTimer();
  recordSession({ correct: state.totalCorrect, total: state.totalAttempts, streak: state.maxStreak });
  saveOnNewGame(state);
  const highScore = Math.max(state.score, getHighScore());

  state = createInitialState();
  state.unlockedAchievements = new Set(getUnlockedAchievements());

  setBalancesImmediate(0, 0);
  setHighScoreDisplay(highScore);
  clearGameLog();
  hideFeedback();
  renderAchievements(state.unlockedAchievements);
  updateScoreUI(state, getLevelProgress(0, 0));
  updateTicketStack(0, null);
  startUserTurn();
}

// ─── Rules Modal ───────────────────────────────────────────────
function openRulesModal() {
  const m = document.getElementById('rulesModal');
  if (!m) return;
  m.classList.remove('hidden'); m.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('closeRules')?.focus(), 100);
}
function closeRulesModal() {
  const m = document.getElementById('rulesModal');
  if (!m) return;
  m.classList.remove('active'); m.classList.add('hidden');
  document.body.style.overflow = '';
}

// ─── Teacher Modal ─────────────────────────────────────────────
function openTeacherModal() {
  const m = document.getElementById('teacherModal');
  if (!m) return;
  m.classList.remove('hidden'); m.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeTeacherModal() {
  const m = document.getElementById('teacherModal');
  if (!m) return;
  m.classList.remove('active'); m.classList.add('hidden');
  document.body.style.overflow = '';
}
function applyTeacherSettings() {
  teacher.lockedLevel = parseInt(document.getElementById('teacherLevel')?.value ?? -1);
  teacher.timerSecs   = parseInt(document.getElementById('teacherTimer')?.value ?? 0);
  teacher.cheatSheet  = document.getElementById('teacherCheatSheet')?.checked ?? false;
  teacher.customMin   = parseInt(document.getElementById('teacherMin')?.value ?? 1);
  teacher.customMax   = parseInt(document.getElementById('teacherMax')?.value ?? 10);
  closeTeacherModal();
  showNotification('✅ Lehrereinstellungen übernommen', '#00ff88');
}

// ─── Helpers ──────────────────────────────────────────────────
function updateAudioIcon(enabled) {
  const icon = document.getElementById('audioIcon');
  if (icon) {
    icon.className = enabled ? 'fas fa-volume-up text-cyan-400' : 'fas fa-volume-mute text-slate-500';
  }
}

function showNotification(text, color = '#00d4ff') {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; top:20px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,0.8); backdrop-filter:blur(16px);
    border:1px solid ${color}40; color:${color};
    font-family:'Orbitron',sans-serif; font-size:0.85rem; font-weight:700;
    padding:10px 24px; border-radius:40px; z-index:9999;
    animation:slideUp 0.3s ease, fadeOut 0.4s ease 2s forwards;
  `;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ─── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
