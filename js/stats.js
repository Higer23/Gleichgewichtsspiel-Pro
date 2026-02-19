/**
 * stats.js
 * ========
 * Dynamic Statistics & Analytics Dashboard
 * Tracks operation accuracy, builds heatmap data, renders Chart.js visuals.
 * Author: Higer
 */

const STATS_KEY = 'gleichgewicht_stats_v2';

// ─── Default Stats Structure ─────────────────────────────────
function defaultStats() {
  return {
    sessions: [],            // [{ date, correct, total, streak }]
    operationErrors: {       // heatmap: keyed by "action|itemType"
      'take|positive':  { correct: 0, total: 0 },
      'take|negative':  { correct: 0, total: 0 },
      'give|positive':  { correct: 0, total: 0 },
      'give|negative':  { correct: 0, total: 0 },
    },
    totalCorrect:  0,
    totalAttempts: 0,
    maxStreak:     0,
  };
}

// ─── Load / Save ─────────────────────────────────────────────
export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch (_) {
    return defaultStats();
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

export function clearStats() {
  localStorage.removeItem(STATS_KEY);
}

// ─── Record an attempt ───────────────────────────────────────
/**
 * Records the result of one attempt.
 * @param {boolean} correct
 * @param {Instruction} instruction
 */
export function recordAttempt(correct, instruction) {
  const stats = loadStats();

  stats.totalAttempts++;
  if (correct) stats.totalCorrect++;

  // Operation heatmap key
  const actionKey = instruction.action.math === 1 ? 'take' : 'give';
  const itemKey   = instruction.itemType.math === 1 ? 'positive' : 'negative';
  const opKey     = `${actionKey}|${itemKey}`;

  if (stats.operationErrors[opKey]) {
    stats.operationErrors[opKey].total++;
    if (correct) stats.operationErrors[opKey].correct++;
  }

  saveStats(stats);
}

/**
 * Records end-of-session data.
 * @param {{ correct:number, total:number, streak:number }} session
 */
export function recordSession(session) {
  const stats = loadStats();
  stats.sessions.push({
    date: new Date().toISOString(),
    correct: session.correct,
    total:   session.total,
    streak:  session.streak,
  });
  // Keep only last 30 sessions
  if (stats.sessions.length > 30) stats.sessions.splice(0, stats.sessions.length - 30);
  stats.maxStreak = Math.max(stats.maxStreak, session.streak);
  saveStats(stats);
}

// ─── Charts ──────────────────────────────────────────────────
let _accuracyChart = null;
let _opsChart      = null;

export function renderDashboard(state) {
  const stats = loadStats();
  updateStatCards(state, stats);
  renderAccuracyChart(stats);
  renderOpsChart(stats);
  renderHeatmap(stats);
}

function updateStatCards(state, stats) {
  const total   = state.totalAttempts || stats.totalAttempts || 0;
  const correct = state.totalCorrect  || stats.totalCorrect  || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const maxStreak = Math.max(state.maxStreak, stats.maxStreak);

  const el = (id) => document.getElementById(id);
  if (el('statTotalCorrect')) el('statTotalCorrect').textContent = correct;
  if (el('statAccuracy'))     el('statAccuracy').textContent     = `${accuracy}%`;
  if (el('statMaxStreak'))    el('statMaxStreak').textContent    = maxStreak;
}

function renderAccuracyChart(stats) {
  const canvas = document.getElementById('accuracyChart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Build per-session accuracy data
  const labels = [];
  const data   = [];

  stats.sessions.slice(-15).forEach((s, i) => {
    labels.push(`S${i + 1}`);
    data.push(s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0);
  });

  if (labels.length === 0) {
    labels.push('–');
    data.push(0);
  }

  const cfg = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Genauigkeit %',
        data,
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0,212,255,0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#00d4ff',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0, max: 100,
          ticks: { color: '#64748b', font: { size: 10 }, stepSize: 25 },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
      },
    },
  };

  if (_accuracyChart) {
    _accuracyChart.data  = cfg.data;
    _accuracyChart.update();
  } else {
    _accuracyChart = new Chart(canvas, cfg);
  }
}

function renderOpsChart(stats) {
  const canvas = document.getElementById('opsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ops = stats.operationErrors;
  const labels = ['+(+)', '+(-)', '-(+)', '-(-)', ];
  const keys   = ['take|positive', 'take|negative', 'give|positive', 'give|negative'];
  const colors = ['rgba(0,255,136,0.7)', 'rgba(255,61,61,0.7)', 'rgba(255,149,0,0.7)', 'rgba(168,85,247,0.7)'];
  const data   = keys.map((k) => ops[k]?.total ?? 0);

  const cfg = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map((c) => c.replace('0.7', '1')),
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 },
        },
      },
    },
  };

  if (_opsChart) {
    _opsChart.data = cfg.data;
    _opsChart.update();
  } else {
    _opsChart = new Chart(canvas, cfg);
  }
}

export function renderHeatmap(stats) {
  const container = document.getElementById('heatmapGrid');
  if (!container) return;

  const ops = stats.operationErrors;
  const cells = [
    { key: 'take|positive',  label: 'Nehmen\nPositiv',  expr: '+(+n)',  color: '#00ff88' },
    { key: 'take|negative',  label: 'Nehmen\nNegativ',  expr: '+(-n)',  color: '#ff3d3d' },
    { key: 'give|positive',  label: 'Abgeben\nPositiv', expr: '-(+n)',  color: '#ff9500' },
    { key: 'give|negative',  label: 'Abgeben\nNegativ', expr: '-(-n)',  color: '#a855f7' },
  ];

  // Find max errors for normalizing opacity
  const maxErrors = Math.max(1, ...cells.map((c) => {
    const op = ops[c.key];
    return op ? (op.total - op.correct) : 0;
  }));

  container.innerHTML = '';
  cells.forEach((cell) => {
    const op     = ops[cell.key] ?? { correct: 0, total: 0 };
    const errors = op.total - op.correct;
    const acc    = op.total > 0 ? Math.round((op.correct / op.total) * 100) : null;
    const heat   = errors / maxErrors; // 0-1

    const r = parseInt(cell.color.slice(1, 3), 16);
    const g = parseInt(cell.color.slice(3, 5), 16);
    const b = parseInt(cell.color.slice(5, 7), 16);
    const bg   = `rgba(${r},${g},${b},${0.05 + heat * 0.25})`;
    const border = `rgba(${r},${g},${b},${0.2 + heat * 0.5})`;

    const div = document.createElement('div');
    div.className = 'heatmap-cell';
    div.style.background = bg;
    div.style.borderColor = border;
    div.style.border = `1px solid ${border}`;
    div.title = `${cell.label.replace('\n', ' ')}: ${op.correct}/${op.total} korrekt`;
    div.innerHTML = `
      <div class="font-mono text-xl font-bold" style="color:${cell.color}">${cell.expr}</div>
      <div class="heatmap-label text-slate-400">${cell.label.replace('\n', '<br>')}</div>
      <div class="heatmap-count" style="color:${cell.color}">${acc !== null ? acc + '%' : '–'}</div>
      <div class="text-xs text-slate-500">${op.total} Versuche</div>
    `;
    container.appendChild(div);
  });
}
