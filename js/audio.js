/**
 * audio.js
 * ========
 * Web Audio API Synthesized Sound Engine
 * Zero external assets required — all sounds are synthesized on-the-fly.
 * Author: Higer
 */

let _ctx = null;
let _enabled = true;

/** Lazily creates / resumes the AudioContext (requires user gesture) */
function getCtx() {
  if (!_enabled) return null;
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch (_) {
    return null;
  }
}

/**
 * Core tone synthesizer.
 * @param {number} freq - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {'sine'|'square'|'sawtooth'|'triangle'} [type]
 * @param {number} [gain]
 * @param {number} [startDelay] - Delay in seconds before playing
 */
function playTone(freq, duration, type = 'sine', gain = 0.3, startDelay = 0) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc  = ctx.createOscillator();
  const amp  = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

  amp.gain.setValueAtTime(0, ctx.currentTime + startDelay);
  amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + startDelay + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.start(ctx.currentTime + startDelay);
  osc.stop(ctx.currentTime + startDelay + duration);
}

// ─── Sound Library ──────────────────────────────────────────
/**
 * Success chime: ascending chord
 */
export function playSuccess() {
  // C5 → E5 → G5 → C6 (arpeggiated)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((f, i) => playTone(f, 0.25, 'sine', 0.22, i * 0.08));
}

/**
 * Error buzz: low-pitched dissonant blip
 */
export function playError() {
  playTone(180, 0.12, 'square', 0.25, 0);
  playTone(160, 0.18, 'sawtooth', 0.15, 0.06);
}

/**
 * Level-up fanfare: sweeping ascending melody
 */
export function playLevelUp() {
  const seq = [
    { f: 523.25, d: 0.1, g: 0.25 },
    { f: 659.25, d: 0.1, g: 0.25 },
    { f: 783.99, d: 0.1, g: 0.25 },
    { f: 1046.50, d: 0.35, g: 0.32 },
  ];
  seq.forEach((n, i) => playTone(n.f, n.d, 'sine', n.g, i * 0.1));
}

/**
 * Button click: short high tick
 */
export function playClick() {
  playTone(880, 0.06, 'sine', 0.12, 0);
}

/**
 * Ticket fly: light ethereal blip
 */
export function playTicket() {
  playTone(1200, 0.08, 'triangle', 0.1, 0);
}

/**
 * Streak milestone: ascending double blip
 */
export function playStreak() {
  playTone(880, 0.1, 'sine', 0.2, 0);
  playTone(1100, 0.12, 'sine', 0.2, 0.1);
}

/**
 * Achievement unlock: triumphant chord
 */
export function playAchievement() {
  [392, 523.25, 659.25, 783.99].forEach((f, i) => playTone(f, 0.4, 'triangle', 0.18, i * 0.06));
}

// ─── Toggle ─────────────────────────────────────────────────
export function setAudioEnabled(val) {
  _enabled = val;
  localStorage.setItem('gleichgewicht_audio', val ? '1' : '0');
}
export function isAudioEnabled() { return _enabled; }

export function initAudio() {
  const saved = localStorage.getItem('gleichgewicht_audio');
  _enabled = saved === null ? true : saved === '1';
  return _enabled;
}

/**
 * Must be called after a user gesture to unlock AudioContext on mobile.
 */
export function unlockAudio() {
  getCtx();
}
