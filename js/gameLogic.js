/**
 * gameLogic.js
 * ============
 * Pure game logic module for "Das Gleichgewichtsspiel – Pro Edition"
 * Handles all game state, level configuration, answer validation,
 * and computer AI turn generation.
 *
 * No DOM access. Fully testable in isolation.
 * Author: Higer
 */

// ─── Level Configuration ─────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Anfänger',     range: [1, 5],  streakRequired: 0,  scorePerCorrect: 10 },
  { level: 2, name: 'Entdecker',    range: [1, 8],  streakRequired: 3,  scorePerCorrect: 15 },
  { level: 3, name: 'Lernender',    range: [1, 12], streakRequired: 6,  scorePerCorrect: 20 },
  { level: 4, name: 'Fortgeschr.', range: [1, 15], streakRequired: 10, scorePerCorrect: 25 },
  { level: 5, name: 'Profi',        range: [1, 20], streakRequired: 15, scorePerCorrect: 35 },
  { level: 6, name: 'Meister',      range: [1, 25], streakRequired: 22, scorePerCorrect: 50 },
];

// ─── Streak thresholds to level-up ───────────────────────────────────────────
export const STREAK_TO_NEXT_LEVEL = [3, 3, 4, 5, 7]; // streak needed to advance each level

// ─── Achievement Definitions ─────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  {
    id: 'first_correct',
    name: 'Erste Antwort!',
    icon: '🎯',
    description: 'Erste richtige Antwort',
    condition: (stats) => stats.totalCorrect >= 1,
  },
  {
    id: 'streak_5',
    name: '5er Streak',
    icon: '🔥',
    description: '5 richtige in Folge',
    condition: (stats) => stats.maxStreak >= 5,
  },
  {
    id: 'streak_10',
    name: '10er Streak',
    icon: '⚡',
    description: '10 richtige in Folge',
    condition: (stats) => stats.maxStreak >= 10,
  },
  {
    id: 'negative_master',
    name: 'Negativ-Meister',
    icon: '🧮',
    description: '10x -(-n) korrekt gelöst',
    condition: (stats) => stats.negativeNegativeCorrect >= 10,
  },
  {
    id: 'level_3',
    name: 'Aufsteiger',
    icon: '🚀',
    description: 'Level 3 erreicht',
    condition: (stats) => stats.maxLevel >= 3,
  },
  {
    id: 'level_5',
    name: 'Pro-Spieler',
    icon: '🏆',
    description: 'Level 5 erreicht',
    condition: (stats) => stats.maxLevel >= 5,
  },
  {
    id: 'level_6',
    name: 'Legenden-Status',
    icon: '👑',
    description: 'Höchstes Level erreicht!',
    condition: (stats) => stats.maxLevel >= 6,
  },
  {
    id: 'score_200',
    name: '200 Punkte',
    icon: '💎',
    description: '200 Punkte erzielt',
    condition: (stats) => stats.score >= 200,
  },
  {
    id: 'score_500',
    name: '500 Punkte',
    icon: '🌟',
    description: '500 Punkte erzielt',
    condition: (stats) => stats.score >= 500,
  },
];

// ─── Game Actions ─────────────────────────────────────────────────────────────
export const ACTIONS = [
  { de: 'Nehmen',  math: 1 },   // taking = adding; mathematical multiplier +1
  { de: 'Abgeben', math: -1 },  // giving = subtracting; mathematical multiplier -1
];

// ─── Ticket Types ─────────────────────────────────────────────────────────────
export const ITEM_TYPES = [
  { de: 'Positive',  math: 1,  class: 'positive', emoji: '+' },
  { de: 'Negative',  math: -1, class: 'negative', emoji: '−' },
];

// ─── Initial Game State ───────────────────────────────────────────────────────
/**
 * Creates and returns a fresh game state object.
 * @returns {GameState}
 */
export function createInitialState() {
  return {
    userBalance: 0,
    computerBalance: 0,
    currentTurn: 'user',     // 'user' | 'computer'
    currentInstruction: null, // see generateInstruction()
    currentLevel: 0,          // index into LEVELS array
    currentStreak: 0,
    maxStreak: 0,
    score: 0,
    maxLevel: 0,              // highest level index ever reached
    totalCorrect: 0,
    totalAttempts: 0,
    negativeNegativeCorrect: 0,  // for achievement tracking
    unlockedAchievements: new Set(),
    gameRound: 0,
  };
}

// ─── Instruction Generator ────────────────────────────────────────────────────
/**
 * Generates a random instruction for a turn.
 * Returns an instruction object with all necessary data for display and validation.
 * @param {number} levelIndex - Current level index
 * @param {number} [currentBalance=0] - Current player balance (for context)
 * @returns {Instruction}
 */
export function generateInstruction(levelIndex, currentBalance = 0) {
  const level  = LEVELS[levelIndex] ?? LEVELS[0];
  const [min, max] = level.range;

  // Pick a random amount within level range
  const amount = randomInt(min, max);

  // Randomly pick action and item type
  const action   = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

  // Mathematical result: action.math × itemType.math × amount
  // e.g. Abgeben(-1) × Negatives(-1) × 5 = +5
  const mathResult = action.math * itemType.math * amount;

  // The correct expression string
  // Nehmen(+1) × Positiv(+1) → +(+n)
  // Nehmen(+1) × Negativ(-1) → +(-n)
  // Abgeben(-1) × Positiv(+1) → -(+n)
  // Abgeben(-1) × Negativ(-1) → -(-n)
  const actionSign  = action.math === 1 ? '+' : '-';
  const itemSign    = itemType.math === 1 ? '+' : '-';
  const correctExpression = `${actionSign}(${itemSign}${amount})`;

  const newBalance = currentBalance + mathResult;

  return {
    action,
    itemType,
    amount,
    mathResult,
    correctExpression,
    newBalance,
    currentBalance,
    isNegNeg: action.math === -1 && itemType.math === -1, // special case for achievement
  };
}

// ─── Answer Validation ────────────────────────────────────────────────────────
/**
 * Validates the user's two inputs.
 * Accepts multiple valid expression formats.
 *
 * @param {string} rawExpression    - e.g. "-(-5)" or "5" etc.
 * @param {string|number} rawBalance - e.g. "5" or "-3"
 * @param {Instruction} instruction
 * @returns {{ expressionOk: boolean, balanceOk: boolean, allOk: boolean }}
 */
export function validateAnswer(rawExpression, rawBalance, instruction) {
  const { correctExpression, newBalance, mathResult } = instruction;

  // ── Expression validation ──
  // Normalize: remove whitespace, replace × with *, handle optional leading +
  const normalised = rawExpression.trim().replace(/\s/g, '').replace(/×/g, '*');
  const expressionOk = isValidExpression(normalised, correctExpression, mathResult);

  // ── Balance validation ──
  const parsedBalance = parseFloat(rawBalance);
  const balanceOk = !isNaN(parsedBalance) && Math.round(parsedBalance) === Math.round(newBalance);

  return {
    expressionOk,
    balanceOk,
    allOk: expressionOk && balanceOk,
  };
}

/**
 * Checks if the user's expression is mathematically equivalent to the correct one.
 * Accepts multiple formats:
 *   Canonical: -(−5), +(+3), +(-5), -(+3)
 *   Simple:    5, -5, +5
 *   No-paren:  --5, ++3, -+3, +-5
 *
 * @param {string} userExpr - normalized user expression
 * @param {string} canonical - canonical expression e.g. "-(−5)"
 * @param {number} expectedResult - numerical result
 * @returns {boolean}
 */
function isValidExpression(userExpr, canonical, expectedResult) {
  // Direct canonical match (case-insensitive)
  if (userExpr.toLowerCase() === canonical.toLowerCase()) return true;

  // Try to evaluate mathematically
  try {
    // Safety: only allow numbers, +, -, (, ), spaces, and nothing else
    if (!/^[0-9+\-().]+$/.test(userExpr)) return false;

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${userExpr})`)();
    if (typeof result === 'number' && isFinite(result)) {
      return Math.round(result) === Math.round(expectedResult);
    }
  } catch (_) {
    // Evaluation failed; fall through
  }

  return false;
}

// ─── Level Progression ────────────────────────────────────────────────────────
/**
 * Determines the current level index based on current streak.
 * Returns the highest level the streak qualifies for.
 *
 * @param {number} streak - current correct streak count
 * @returns {number} - level index (0–5)
 */
export function getLevelFromStreak(streak) {
  let levelIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (streak >= LEVELS[i].streakRequired) {
      levelIdx = i;
      break;
    }
  }
  return levelIdx;
}

/**
 * Gets progress toward next level (0–100).
 * @param {number} streak
 * @param {number} levelIndex
 * @returns {{ pct: number, current: number, target: number, atMax: boolean }}
 */
export function getLevelProgress(streak, levelIndex) {
  const atMax = levelIndex >= LEVELS.length - 1;
  if (atMax) return { pct: 100, current: streak, target: streak, atMax: true };

  const currentLevelRequirement = LEVELS[levelIndex].streakRequired;
  const nextLevelRequirement    = LEVELS[levelIndex + 1].streakRequired;

  const progressInLevel = streak - currentLevelRequirement;
  const rangeInLevel    = nextLevelRequirement - currentLevelRequirement;
  const pct = Math.min(100, Math.round((progressInLevel / rangeInLevel) * 100));

  return {
    pct,
    current: progressInLevel,
    target: rangeInLevel,
    atMax: false,
  };
}

// ─── Achievement Checker ──────────────────────────────────────────────────────
/**
 * Checks all achievements against current stats.
 * Returns an array of newly unlocked achievement objects.
 *
 * @param {GameState} state
 * @returns {Achievement[]} newly unlocked achievements
 */
export function checkAchievements(state) {
  const stats = {
    totalCorrect:            state.totalCorrect,
    maxStreak:               state.maxStreak,
    negativeNegativeCorrect: state.negativeNegativeCorrect,
    maxLevel:                state.maxLevel + 1, // 1-indexed for display
    score:                   state.score,
  };

  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!state.unlockedAchievements.has(achievement.id) && achievement.condition(stats)) {
      state.unlockedAchievements.add(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

// ─── Computer AI ──────────────────────────────────────────────────────────────
/**
 * Simulates the computer playing its turn.
 * Always generates and correctly solves its own instruction.
 *
 * @param {number} levelIndex
 * @param {number} computerBalance
 * @returns {{ instruction: Instruction, computerBalance: number }}
 */
export function computerPlay(levelIndex, computerBalance) {
  const instruction     = generateInstruction(levelIndex, computerBalance);
  const newComputerBal  = instruction.newBalance;
  return { instruction, newComputerBal };
}

// ─── Score Calculation ────────────────────────────────────────────────────────
/**
 * Calculates the score to award for a correct answer.
 * Includes streak bonus.
 *
 * @param {number} levelIndex
 * @param {number} streak
 * @returns {number}
 */
export function calculateScore(levelIndex, streak) {
  const base = LEVELS[levelIndex].scorePerCorrect;
  const streakBonus = Math.floor(streak / 5) * 5; // +5 per 5-streak milestone
  return base + streakBonus;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a number for display with an explicit + or - sign.
 * @param {number} n
 * @returns {string}
 */
export function formatSigned(n) {
  if (n > 0) return `+${n}`;
  return `${n}`;
}

/**
 * Builds a human-readable hint for an incorrect answer.
 * @param {Instruction} instruction
 * @returns {string}
 */
export function buildHint(instruction) {
  const { action, itemType, amount, mathResult, correctExpression, currentBalance, newBalance } = instruction;
  const verb = action.de === 'Nehmen' ? 'nimmst' : 'gibst';
  const change = mathResult >= 0
    ? `steigt dein Guthaben um ${Math.abs(mathResult)}`
    : `sinkt dein Guthaben um ${Math.abs(mathResult)}`;

  return `💡 Du ${verb} ${amount} ${itemType.de} Ticket${amount !== 1 ? 's' : ''} — das entspricht dem Ausdruck <strong>${correctExpression}</strong>. Daher ${change}: ${currentBalance} ${mathResult >= 0 ? '+' : '−'} ${Math.abs(mathResult)} = <strong>${newBalance}</strong>.`;
}
