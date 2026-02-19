/**
 * storage.js
 * ==========
 * Local Storage persistence layer for "Das Gleichgewichtsspiel – Pro Edition"
 * Handles save/load of game progress, high score, achievements, and settings.
 *
 * Author: Higer
 */

const STORAGE_KEY  = 'gleichgewichtsspiel_save';
const VERSION_KEY  = 'gleichgewichtsspiel_version';
const SAVE_VERSION = '1.0.0'; // bump when save schema changes

/**
 * Default save data structure.
 * @returns {SaveData}
 */
function defaultSave() {
  return {
    highScore:    0,
    maxStreak:    0,
    maxLevel:     0,             // 0-indexed level index
    totalCorrect: 0,
    totalGames:   0,
    unlockedAchievements: [],   // array of achievement IDs
    negativeNegativeCorrect: 0,
    lastPlayed:   null,
  };
}

/**
 * Loads save data from localStorage.
 * Returns default data if nothing saved or if version mismatch.
 *
 * @returns {SaveData}
 */
export function loadSave() {
  try {
    const savedVersion = localStorage.getItem(VERSION_KEY);

    // If version mismatch, clear old data to prevent corruption
    if (savedVersion !== SAVE_VERSION) {
      console.info('[Storage] Save version mismatch – resetting to defaults.');
      clearSave();
      return defaultSave();
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();

    const parsed = JSON.parse(raw);
    // Merge with defaults to handle new fields added in updates
    return { ...defaultSave(), ...parsed };
  } catch (err) {
    console.warn('[Storage] Failed to load save data:', err);
    return defaultSave();
  }
}

/**
 * Saves game progress to localStorage.
 *
 * @param {GameState} state - current game state from app.js
 */
export function saveProgress(state) {
  try {
    const save = {
      highScore:    Math.max(state.score, loadSave().highScore),
      maxStreak:    Math.max(state.maxStreak, loadSave().maxStreak),
      maxLevel:     Math.max(state.maxLevel, loadSave().maxLevel),
      totalCorrect: state.totalCorrect,
      totalGames:   (loadSave().totalGames ?? 0) + 0, // updated on game reset
      unlockedAchievements: [...state.unlockedAchievements],
      negativeNegativeCorrect: state.negativeNegativeCorrect,
      lastPlayed:   new Date().toISOString(),
    };

    localStorage.setItem(VERSION_KEY, SAVE_VERSION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (err) {
    console.warn('[Storage] Failed to save progress:', err);
  }
}

/**
 * Saves final stats when a new game is started (increments totalGames).
 * @param {GameState} state
 */
export function saveOnNewGame(state) {
  try {
    const existing = loadSave();
    const save = {
      ...existing,
      highScore:    Math.max(state.score, existing.highScore),
      maxStreak:    Math.max(state.maxStreak, existing.maxStreak),
      maxLevel:     Math.max(state.maxLevel, existing.maxLevel),
      totalGames:   (existing.totalGames ?? 0) + 1,
      unlockedAchievements: [...state.unlockedAchievements],
      negativeNegativeCorrect: Math.max(state.negativeNegativeCorrect, existing.negativeNegativeCorrect),
      lastPlayed:   new Date().toISOString(),
    };

    localStorage.setItem(VERSION_KEY, SAVE_VERSION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (err) {
    console.warn('[Storage] Failed to save on new game:', err);
  }
}

/**
 * Updates only the high score if the new score is higher.
 * @param {number} score
 */
export function updateHighScore(score) {
  try {
    const existing = loadSave();
    if (score > existing.highScore) {
      existing.highScore = score;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return true; // new high score!
    }
    return false;
  } catch (err) {
    console.warn('[Storage] Failed to update high score:', err);
    return false;
  }
}

/**
 * Retrieves the stored high score.
 * @returns {number}
 */
export function getHighScore() {
  return loadSave().highScore ?? 0;
}

/**
 * Retrieves previously unlocked achievements.
 * @returns {string[]} - array of achievement IDs
 */
export function getUnlockedAchievements() {
  return loadSave().unlockedAchievements ?? [];
}

/**
 * Clears all save data from localStorage.
 */
export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch (err) {
    console.warn('[Storage] Failed to clear save:', err);
  }
}
