/**
 * i18n.js
 * =======
 * Lightweight Internationalization Engine
 * Supports: de (Deutsch), en (English), tr (Türkçe)
 * Author: Higer
 */

const TRANSLATIONS = {
  de: {
    // Header
    streak: 'Streak',
    highscore: 'Highscore',
    rules: 'Regeln',
    points: 'Punkte',
    // Tabs
    tab_game: 'Spiel',
    tab_stats: 'Statistik',
    tab_tickets: 'Ticket-Stack',
    // Game UI
    your_account: 'Dein Konto',
    balance: 'Kontostand',
    your_turn: '● DEIN ZUG',
    computer: 'Computer',
    comp_turn: '● AM ZUG',
    current_task: 'Aktuelle Aufgabe',
    your_turn_badge: 'Dein Zug',
    instruction: 'Anweisung',
    expression_label: 'Mathematischer Ausdruck',
    expression_hint: 'Schreibe den Ausdruck wie: <code>-(-5)</code>',
    balance_label: 'Neuer Kontostand',
    balance_hint: 'Dein neues Guthaben',
    check_btn: 'Prüfen',
    thinking: 'Computer denkt nach...',
    game_log: 'Spielverlauf',
    no_moves: 'Noch keine Züge gespielt.',
    achievements: 'Abzeichen',
    quick_ref: 'Schnellreferenz',
    new_game: 'Neues Spiel',
    // Rules
    rules_title: 'Spielregeln',
    rules_subtitle: 'Verstehe die Magie hinter positiven und negativen Zahlen.',
    rules_concept: 'Das Grundprinzip',
    rules_concept_text: 'Stell dir vor, du hast zwei Arten von Tickets: Positive Tickets (+1€) und Negative Tickets (-1€). Dein Kontostand bestimmt sich durch die Summe aller Tickets.',
    rules_scenarios: 'Die vier Szenarien',
    rules_math_rule: 'Die Mathematische Regel',
    start_game: 'Spiel starten!',
    nehmen: 'NEHMEN',
    abgeben: 'ABGEBEN',
    positiv: 'POSITIV',
    negativ: 'NEGATIV',
    // Stats
    stat_correct: 'Richtige Antworten',
    stat_accuracy: 'Genauigkeit',
    stat_max_streak: 'Bester Streak',
    accuracy_chart: 'Fortschritt',
    ops_chart: 'Operationsverteilung',
    heatmap: 'Schwierigkeits-Heatmap',
    heatmap_desc: 'Zeigt, welche Kombinationen du am häufigsten falsch beantwortest',
    reset_stats: 'Statistiken zurücksetzen',
    // Ticket Stack
    ticket_stack_title: 'Visueller Ticket-Stack',
    ticket_stack_desc: 'Beobachte, wie Tickets in dein Konto fließen oder abgehen.',
    your_stack: 'Dein Ticket-Stack',
    stack_empty: 'Noch keine Tickets',
    simulate: 'Simulation',
    last_op: 'Letzte Operation',
    op_legend: 'Legende',
    positive_ticket: 'Positive Tickets',
    negative_ticket: 'Negative Tickets',
    // Feedback
    correct_title: 'Richtig! 🎉',
    incorrect_title: 'Nicht ganz...',
    // Misc
    level_up_msg: 'Level {{n}} erreicht!',
    new_high_score: 'Neuer Highscore!',
  },

  en: {
    streak: 'Streak',
    highscore: 'High Score',
    rules: 'Rules',
    points: 'Points',
    tab_game: 'Game',
    tab_stats: 'Statistics',
    tab_tickets: 'Ticket Stack',
    your_account: 'Your Account',
    balance: 'Balance',
    your_turn: '● YOUR TURN',
    computer: 'Computer',
    comp_turn: '● PLAYING',
    current_task: 'Current Task',
    your_turn_badge: 'Your Turn',
    instruction: 'Instruction',
    expression_label: 'Mathematical Expression',
    expression_hint: 'Write the expression like: <code>-(-5)</code>',
    balance_label: 'New Balance',
    balance_hint: 'Your new balance',
    check_btn: 'Check',
    thinking: 'Computer is thinking...',
    game_log: 'Game Log',
    no_moves: 'No moves yet.',
    achievements: 'Achievements',
    quick_ref: 'Quick Reference',
    new_game: 'New Game',
    rules_title: 'Game Rules',
    rules_subtitle: 'Understand the magic behind positive and negative numbers.',
    rules_concept: 'The Core Concept',
    rules_concept_text: 'Imagine you have two kinds of tickets: Positive Tickets (+€1) and Negative Tickets (-€1). Your balance is determined by the sum of all your tickets.',
    rules_scenarios: 'The Four Scenarios',
    rules_math_rule: 'The Mathematical Rule',
    start_game: 'Start Game!',
    nehmen: 'TAKE',
    abgeben: 'GIVE',
    positiv: 'POSITIVE',
    negativ: 'NEGATIVE',
    stat_correct: 'Correct Answers',
    stat_accuracy: 'Accuracy',
    stat_max_streak: 'Best Streak',
    accuracy_chart: 'Progress',
    ops_chart: 'Operation Distribution',
    heatmap: 'Difficulty Heatmap',
    heatmap_desc: 'Shows which combinations you get wrong most often',
    reset_stats: 'Reset Statistics',
    ticket_stack_title: 'Visual Ticket Stack',
    ticket_stack_desc: 'Watch tickets flow in and out of your account.',
    your_stack: 'Your Ticket Stack',
    stack_empty: 'No tickets yet',
    simulate: 'Simulation',
    last_op: 'Last Operation',
    op_legend: 'Legend',
    positive_ticket: 'Positive Tickets',
    negative_ticket: 'Negative Tickets',
    correct_title: 'Correct! 🎉',
    incorrect_title: 'Not quite...',
    level_up_msg: 'Level {{n}} reached!',
    new_high_score: 'New High Score!',
  },

  tr: {
    streak: 'Seri',
    highscore: 'En Yüksek',
    rules: 'Kurallar',
    points: 'Puan',
    tab_game: 'Oyun',
    tab_stats: 'İstatistik',
    tab_tickets: 'Bilet Yığını',
    your_account: 'Hesabın',
    balance: 'Bakiye',
    your_turn: '● SENİN SIRAN',
    computer: 'Bilgisayar',
    comp_turn: '● OYNUYOR',
    current_task: 'Mevcut Görev',
    your_turn_badge: 'Senin Sıran',
    instruction: 'Talimat',
    expression_label: 'Matematiksel İfade',
    expression_hint: 'İfadeyi şöyle yaz: <code>-(-5)</code>',
    balance_label: 'Yeni Bakiye',
    balance_hint: 'Yeni bakiyen',
    check_btn: 'Kontrol Et',
    thinking: 'Bilgisayar düşünüyor...',
    game_log: 'Oyun Kaydı',
    no_moves: 'Henüz hamle yok.',
    achievements: 'Rozetler',
    quick_ref: 'Hızlı Başvuru',
    new_game: 'Yeni Oyun',
    rules_title: 'Oyun Kuralları',
    rules_subtitle: 'Pozitif ve negatif sayıların büyüsünü anla.',
    rules_concept: 'Temel Kavram',
    rules_concept_text: 'İki tür biletiniz olduğunu hayal edin: Pozitif Biletler (+1€) ve Negatif Biletler (-1€). Bakiyeniz, sahip olduğunuz tüm biletlerin toplamına göre belirlenir.',
    rules_scenarios: 'Dört Senaryo',
    rules_math_rule: 'Matematiksel Kural',
    start_game: 'Oyunu Başlat!',
    nehmen: 'AL',
    abgeben: 'VER',
    positiv: 'POZİTİF',
    negativ: 'NEGATİF',
    stat_correct: 'Doğru Cevaplar',
    stat_accuracy: 'Doğruluk',
    stat_max_streak: 'En İyi Seri',
    accuracy_chart: 'İlerleme',
    ops_chart: 'İşlem Dağılımı',
    heatmap: 'Zorluk Isı Haritası',
    heatmap_desc: 'En çok yanlış yaptığın kombinasyonları gösterir',
    reset_stats: 'İstatistikleri Sıfırla',
    ticket_stack_title: 'Görsel Bilet Yığını',
    ticket_stack_desc: 'Biletlerin hesabına nasıl girip çıktığını izle.',
    your_stack: 'Bilet Yığınınız',
    stack_empty: 'Henüz bilet yok',
    simulate: 'Simülasyon',
    last_op: 'Son İşlem',
    op_legend: 'Açıklama',
    positive_ticket: 'Pozitif Biletler',
    negative_ticket: 'Negatif Biletler',
    correct_title: 'Doğru! 🎉',
    incorrect_title: 'Tam değil...',
    level_up_msg: 'Seviye {{n}} ulaşıldı!',
    new_high_score: 'Yeni En Yüksek Puan!',
  },
};

let _currentLang = 'de';

/**
 * Returns translated string for key.
 * @param {string} key
 * @param {Object} [vars] - interpolation variables e.g. { n: 3 }
 * @returns {string}
 */
export function t(key, vars = {}) {
  const dict = TRANSLATIONS[_currentLang] ?? TRANSLATIONS.de;
  let str = dict[key] ?? TRANSLATIONS.de[key] ?? key;
  // Replace {{var}} placeholders
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
  }
  return str;
}

/**
 * Returns the current language code.
 * @returns {'de'|'en'|'tr'}
 */
export function getLang() { return _currentLang; }

/**
 * Sets language and re-renders all [data-i18n] elements.
 * @param {'de'|'en'|'tr'} lang
 */
export function setLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  _currentLang = lang;
  localStorage.setItem('gleichgewicht_lang', lang);
  applyTranslations();
  updateLangButtons();
  // Fire custom event for components that need to react
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Initialises i18n from saved preference or browser language.
 */
export function initI18n() {
  const saved    = localStorage.getItem('gleichgewicht_lang');
  const browser  = navigator.language?.slice(0, 2)?.toLowerCase();
  const detected = saved ?? (TRANSLATIONS[browser] ? browser : 'de');
  _currentLang   = detected;
  applyTranslations();
  updateLangButtons();
}

/**
 * Applies translations to all [data-i18n] elements in the DOM.
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === _currentLang);
  });
}
