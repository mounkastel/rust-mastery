// ================= App Runtime =================
(function () {
  'use strict';

  const STORAGE_KEY = 'rust-mastery-course-v2';
  const THEME_KEY = 'rust-mastery-theme';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
  const REVIEW_FIRST_INTERVAL_DAYS = REVIEW_INTERVALS_DAYS[0]; // 1 day — must be a ladder rung, not an off-ladder seed
  const root = document.getElementById('app');

  // Hardening: data.js must define concepts/modules/courseMeta. If it failed
  // to load, render a fallback instead of throwing on undefined globals.
  function hasCourseData() {
    return typeof concepts !== 'undefined' && Array.isArray(concepts)
      && typeof modules !== 'undefined' && Array.isArray(modules) && modules.length > 0;
  }

  // ---------- Theme (single path: stored choice, else OS preference) ----------
  function getTheme() {
    const stored = storageGet(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }
  function applyTheme(t) {
    const theme = t === 'dark' ? 'dark' : 'light';
    if (root) root.dataset.theme = theme;
    if (document.documentElement) document.documentElement.dataset.theme = theme;
    storageSet(THEME_KEY, theme);
  }
  // ---------- Safe storage (localStorage may throw in private mode) ----------
  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {}
  }
  function themeToggleInner() {
    const dark = getTheme() === 'dark';
    const icon = dark
      ? '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.2 9.8A5.8 5.8 0 0 1 6.2 2.8a.7.7 0 0 0-.9-.9 7 7 0 1 0 8.8 8.8.7.7 0 0 0-.9-.9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    return icon + '<span>Theme: ' + (dark ? 'Light' : 'Dark') + '</span>';
  }
  function initTheme() {
    applyTheme(getTheme());
  }

  const __firstModule = (typeof modules !== 'undefined' && Array.isArray(modules) && modules[0]) ? String(modules[0].key) : null;
  const ui = {
    view: 'roadmap',
    selectedConceptId: null,
    expandedModule: __firstModule,
    sidebarExpanded: __firstModule ? { [__firstModule]: true } : {},
    checkpoint: {},
    menuOpen: false,
  };

  function defaultState() {
    return { progress: {}, reviewLog: {}, lastActiveConceptId: null };
  }

  const VALID_STATUSES = ['not-started', 'in-progress', 'completed', 'needs-review'];
  const VALID_VIEWS = ['roadmap', 'review', 'block'];

  let state = loadState();

  function isPlainObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  function sanitizeProgressEntry(raw) {
    if (!isPlainObject(raw)) return { status: 'not-started', rbeSeen: {}, rustlingsDone: {}, practiceDone: {}, checkpoint: null, checkpointPassed: false, review: null };
    const status = VALID_STATUSES.includes(raw.status) ? raw.status : 'not-started';
    const rbeSeen = isPlainObject(raw.rbeSeen) ? raw.rbeSeen : {};
    const rustlingsDone = isPlainObject(raw.rustlingsDone) ? raw.rustlingsDone : {};
    const practiceDone = isPlainObject(raw.practiceDone) ? raw.practiceDone : {};
    let checkpoint = null;
    if (isPlainObject(raw.checkpoint)) {
      const passed = typeof raw.checkpoint.passed === 'boolean' ? raw.checkpoint.passed : null;
      const attemptsRaw = Number(raw.checkpoint.attempts);
      const attempts = Number.isFinite(attemptsRaw) && attemptsRaw >= 0 ? Math.floor(attemptsRaw) : 0;
      checkpoint = passed === null && attempts === 0 ? null : { passed, attempts };
      if (checkpoint && checkpoint.passed === null && checkpoint.attempts === 0) checkpoint = null;
    }
    // Permanent unlock: once a checkpoint passes it stays passed, even across retake failures.
    const checkpointPassed = raw.checkpointPassed === true || (checkpoint !== null && checkpoint.passed === true);
    const review = sanitizeReviewEntry(raw.review);
    // Coerce stored checkbox maps to strict booleans keyed by string.
    const cleanRbeSeen = {};
    for (const k of Object.keys(rbeSeen)) { if (typeof k === 'string') cleanRbeSeen[k] = rbeSeen[k] === true; }
    const cleanRustlingsDone = {};
    for (const k of Object.keys(rustlingsDone)) { if (typeof k === 'string') cleanRustlingsDone[k] = rustlingsDone[k] === true; }
    const cleanPracticeDone = {};
    for (const k of Object.keys(practiceDone)) { if (typeof k === 'string') cleanPracticeDone[k] = practiceDone[k] === true; }
    return { status, rbeSeen: cleanRbeSeen, rustlingsDone: cleanRustlingsDone, practiceDone: cleanPracticeDone, checkpoint, checkpointPassed, review };
  }

  function sanitizeReviewEntry(raw) {
    if (!isPlainObject(raw)) return null;
    const nextRaw = Number(raw.nextReviewAt);
    const nextReviewAt = Number.isFinite(nextRaw) && nextRaw > 0 ? Math.floor(nextRaw) : 0;
    const intRaw = Number(raw.intervalDays);
    const intervalDays = Number.isFinite(intRaw)
      ? Math.max(1, Math.min(60, Math.floor(intRaw)))
      : REVIEW_FIRST_INTERVAL_DAYS;
    const repRaw = Number(raw.repetitions);
    const repetitions = Number.isFinite(repRaw) && repRaw >= 0 ? Math.floor(repRaw) : 0;
    if (nextReviewAt === 0 && repetitions === 0) return null;
    return { nextReviewAt, intervalDays, repetitions };
  }

  function nextIntervalDays(current) {
    for (const d of REVIEW_INTERVALS_DAYS) { if (d > current) return d; }
    return REVIEW_INTERVALS_DAYS[REVIEW_INTERVALS_DAYS.length - 1];
  }

  function sanitizeReviewLog(raw) {
    if (!isPlainObject(raw)) return {};
    const out = {};
    for (const k of Object.keys(raw)) {
      const n = Number(raw[k]);
      if (Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
    }
    return out;
  }

  function isValidConceptId(id) {
    return typeof id === 'string' && typeof concepts !== 'undefined' && Array.isArray(concepts) && concepts.some((c) => c.id === id);
  }

  function loadState() {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return defaultState();
    let p = null;
    try {
      p = JSON.parse(raw);
    } catch (_) {
      return defaultState();
    }
    if (!isPlainObject(p)) return defaultState();
    const progressRaw = isPlainObject(p.progress) ? p.progress : {};
    const progress = {};
    for (const k of Object.keys(progressRaw)) {
      if (typeof k === 'string') progress[k] = sanitizeProgressEntry(progressRaw[k]);
    }
    return {
      progress,
      reviewLog: sanitizeReviewLog(p.reviewLog),
      lastActiveConceptId: typeof p.lastActiveConceptId === 'string' ? p.lastActiveConceptId : null,
    };
  }

  function saveState() {
    storageSet(STORAGE_KEY, JSON.stringify(state));
  }

  function setState(next) {
    state = typeof next === 'function' ? next(state) : next;
    invalidateDerivedCache();
    saveState();
    render();
  }

  // Checkbox ticks must not rebuild the DOM: in-page translators treat a full
  // innerHTML replacement as a brand-new page and re-translate everything.
  // A tick changes nothing visible except a possible not-started -> in-progress
  // flip, so re-render only then (restoring focus to the ticked box).
  function refocusCheckbox(action, id, key, value) {
    if (!root) return;
    const boxes = root.querySelectorAll('input[data-action="' + action + '"]');
    for (const box of boxes) {
      if (box.dataset.concept === id && box.dataset[key] === value) {
        box.focus({ preventScroll: true });
        break;
      }
    }
  }

  function setStateQuiet(next, id, refocus) {
    const before = getProgress(state, id).status;
    state = typeof next === 'function' ? next(state) : next;
    invalidateDerivedCache();
    saveState();
    if (getProgress(state, id).status !== before) {
      render();
      if (refocus) refocusCheckbox(refocus.action, id, refocus.key, refocus.value);
    }
  }

  function getProgress(s, id) {
    const raw = s && s.progress && s.progress[id];
    return sanitizeProgressEntry(raw);
  }

  function isCompleted(s, id) {
    return getProgress(s, id).checkpointPassed === true;
  }

  function prereqsOf(concept) {
    return concept && Array.isArray(concept.prerequisites) ? concept.prerequisites : [];
  }

  function computeStatus(s, concept, upNextId) {
    const p = getProgress(s, concept.id);
    const locked = prereqsOf(concept).some((pid) => !isCompleted(s, pid));
    if (locked) return 'locked';
    if (p.status === 'needs-review') return 'needs-review';
    if (p.status === 'completed') return 'completed';
    if (p.status === 'in-progress') return 'in-progress';
    if (concept.id === upNextId) return 'up-next';
    return 'not-started';
  }

  const STATUS_LABELS = {
    locked: 'Locked',
    'up-next': 'Up next',
    'in-progress': 'In progress',
    completed: 'Completed',
    'needs-review': 'Needs review',
    'not-started': 'Not started',
  };

  function statusLabel(s) {
    return STATUS_LABELS[s] || s;
  }

  function fmtMin(n) {
    if (n < 60) return `${n} min`;
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Line breaks as markup, not whitespace: in-page translators rewrite text
  // nodes and collapse literal newlines, but <br> elements survive translation.
  function fmtMultiline(value) {
    return esc(value).replace(/\n/g, '<br>');
  }

  const CONCEPT_BY_ID = (typeof concepts !== 'undefined' && Array.isArray(concepts))
    ? Object.fromEntries(concepts.map((c) => [c.id, c]))
    : {};

  function conceptById() {
    return CONCEPT_BY_ID;
  }

  // Cache derived status per state reference: many handlers call derived()
  // several times per tick (Sidebar + main + quiz guards). N=54 concepts so
  // this is a micro-opt, but it avoids 2-3x repeated sanitize/sort work.
  let __derivedCache = null;
  let __derivedCacheState = null;

  function derived() {
    if (__derivedCache && __derivedCacheState === state) return __derivedCache;
    const byId = conceptById();
    const list = (typeof concepts !== 'undefined' && Array.isArray(concepts)) ? concepts : [];
    let upNextId = null;
    for (const c of list) {
      const locked = prereqsOf(c).some((pid) => !isCompleted(state, pid));
      if (!locked && getProgress(state, c.id).status !== 'completed') {
        upNextId = c.id;
        break;
      }
    }
    const statusMap = {};
    list.forEach((c) => { statusMap[c.id] = computeStatus(state, c, upNextId); });
    __derivedCache = { byId, upNextId, statusMap };
    __derivedCacheState = state;
    return __derivedCache;
  }

  function invalidateDerivedCache() {
    __derivedCache = null;
    __derivedCacheState = null;
  }

  function StatusBadge(status) {
    return `<span class="rmc-badge rmc-badge-${esc(status)}">${esc(statusLabel(status))}</span>`;
  }

  function TypeTag(type) {
    return `<span class="rmc-type-tag rmc-type-${esc(type)}">${esc(type)}</span>`;
  }

  function RustBar(fraction, done) {
    const width = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
    return `<div class="rmc-rust-bar"><div class="rmc-rust-bar-fill${done ? ' done' : ''}" style="width:${width}%"></div></div>`;
  }

  function moduleStatus(m, selectedConceptId, statusMap) {
    const list = Array.isArray(m.concepts) ? m.concepts : [];
    const firstUnlocked = list.find((c) => statusMap[c.id] !== 'locked') || list[0];
    const allDone = list.length > 0 && list.every((c) => statusMap[c.id] === 'completed');
    const anyActive = list.some((c) => c.id === selectedConceptId);
    const dot = allDone ? 'completed' : (firstUnlocked && statusMap[firstUnlocked.id] === 'locked' ? 'locked' : 'in-progress');
    return { anyActive, dot };
  }

  function isSidebarOpen(key) {
    return !!ui.sidebarExpanded[String(key)];
  }

  function ensureSidebarExpanded() {
    if (ui.selectedConceptId && CONCEPT_BY_ID[ui.selectedConceptId]) {
      const c = CONCEPT_BY_ID[ui.selectedConceptId];
      if (typeof modules === 'undefined' || !Array.isArray(modules)) return;
      const mod = modules.find((m) => Array.isArray(m.concepts) && m.concepts.some((x) => x.id === c.id));
      if (mod) ui.sidebarExpanded[String(mod.key)] = true;
    }
  }

  function sidebarLessonLabel(c) {
    if (c && c.trpl && c.trpl.length && c.trpl[0] && c.trpl[0].num && c.trpl[0].title) {
      return `${c.trpl[0].num} ${c.trpl[0].title}`;
    }
    return (c && c.concept) || '';
  }

  function Sidebar(view, selectedConceptId, statusMap) {
    const dueCount = reviewQueue(statusMap).length;
    // Docs-grade primary views: Course (tree) + Review (SRS queue).
    const navItems = [
      { key: 'roadmap', label: 'Course' },
      { key: 'review', label: 'Review', count: dueCount },
    ];
    const courseView = view === 'review' ? 'review' : 'roadmap';

    const conceptList = (typeof concepts !== 'undefined' && Array.isArray(concepts)) ? concepts : [];
    const moduleList = (typeof modules !== 'undefined' && Array.isArray(modules)) ? modules : [];
    const appTitle = (typeof courseMeta !== 'undefined' && courseMeta && courseMeta.title) ? courseMeta.title : 'Course';
    const completedCount = conceptList.filter((c) => statusMap[c.id] === 'completed').length;

    return `
      <nav class="rmc-sidebar${ui.menuOpen ? ' open' : ''}" id="rmc-sidebar" aria-label="Course navigation">
        <button type="button" class="rmc-brand" data-action="set-view" data-view="roadmap" title="Back to Course Roadmap" aria-label="Back to Course Roadmap">
          <span class="rmc-brand-mark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.8C3 2.36 3.36 2 3.8 2H8v11.2H3.8c-.44 0-.8-.36-.8-.8V2.8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2h4.2c.44 0 .8.36.8.8v8.6c0 .44-.36.8-.8.8H8" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2v11.2" stroke="currentColor" stroke-width="1.2"/></svg></span>
          <span class="rmc-brand-title">${esc(appTitle)}</span>
        </button>
        <div class="rmc-nav-section">
          ${navItems.map((item) => `<button type="button" class="rmc-nav-item${courseView === item.key ? ' active' : ''}" data-action="set-view" data-view="${esc(item.key)}">${esc(item.label)}${item.count > 0 ? `<span class="rmc-nav-count">${item.count}</span>` : ''}</button>`).join('')}
        </div>
        <div class="rmc-nav-section rmc-nav-section--modules">
          <p class="rmc-nav-label">Course</p>
          <div class="rmc-module-list">
            ${moduleList.map((m) => {
              const st = moduleStatus(m, selectedConceptId, statusMap);
              const open = isSidebarOpen(m.key);
              const activeChapter = st.anyActive;
              const chapterConcepts = Array.isArray(m.concepts) ? m.concepts : [];
              return `<div class="rmc-tree-chapter" data-chapter="${esc(m.key)}">
                <button type="button" class="rmc-tree-chapter-btn${activeChapter ? ' active' : ''}" aria-expanded="${open ? 'true' : 'false'}" title="${esc(m.title)}" data-action="toggle-sidebar-module" data-module="${esc(m.key)}">
                  <span class="rmc-tree-caret" aria-hidden="true">›</span>
                  <span class="rmc-tree-chapter-num">${m.bonus ? 'Bonus' : `Ch ${esc(m.chapterNum)}`}</span>
                  <span class="rmc-tree-chapter-title">${esc(m.title)}</span>
                  <span class="rmc-dot rmc-dot-${st.dot}"></span>
                </button>
                <div class="rmc-tree-lessons"${open ? '' : ' hidden'}>
                  ${chapterConcepts.map((c) => {
                    const active = c.id === selectedConceptId;
                    return `<button type="button" class="rmc-tree-lesson${active ? ' active' : ''}" title="${esc(c.concept)}" aria-current="${active ? 'true' : 'false'}" data-action="open-concept" data-concept="${esc(c.id)}">
                      <span class="rmc-dot rmc-dot-${esc(statusMap[c.id])}"></span>
                      <span class="rmc-tree-lesson-label">${esc(sidebarLessonLabel(c))}</span>
                    </button>`;
                  }).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="rmc-sidebar-foot"><span>Completed ${completedCount} / ${conceptList.length}</span><button type="button" class="rmc-theme-toggle" data-action="toggle-theme" aria-label="Toggle dark theme" title="Toggle dark theme">${themeToggleInner()}</button></div>
      </nav>`;
  }

  function MobileBar() {
    const appTitle = (typeof courseMeta !== 'undefined' && courseMeta && courseMeta.title) ? courseMeta.title : 'Course';
    return `
      <div class="rmc-mobilebar">
        <button type="button" class="rmc-mobilebar-brand" data-action="set-view" data-view="roadmap" title="Back to Course Roadmap" aria-label="Back to Course Roadmap"><span class="rmc-brand-mark" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.8C3 2.36 3.36 2 3.8 2H8v11.2H3.8c-.44 0-.8-.36-.8-.8V2.8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2h4.2c.44 0 .8.36.8.8v8.6c0 .44-.36.8-.8.8H8" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2v11.2" stroke="currentColor" stroke-width="1.2"/></svg></span>${esc(appTitle)}</button>
        <button type="button" class="rmc-btn-ghost" data-action="toggle-menu" aria-label="Toggle navigation" aria-expanded="${ui.menuOpen ? 'true' : 'false'}" aria-controls="rmc-sidebar"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Menu</button>
      </div>`;
  }

  function CourseRoadmap(statusMap) {
    if (typeof modules === 'undefined' || !Array.isArray(modules)) return '';
    return modules.map((m) => {
      const visibleConcepts = Array.isArray(m.concepts) ? m.concepts : [];
      const doneCount = visibleConcepts.filter((c) => statusMap[c.id] === 'completed').length;
      const total = visibleConcepts.length || 1;
      const isOpen = String(ui.expandedModule) === String(m.key);
      return `<div class="rmc-roadmap-chapter" data-chapter="${esc(m.key)}">
        <div class="rmc-roadmap-row" role="button" tabindex="0" aria-expanded="${isOpen ? 'true' : 'false'}" aria-label="${esc(m.title)} — ${doneCount} of ${visibleConcepts.length} completed" data-action="toggle-module" data-module="${esc(m.key)}">
          <span class="rmc-roadmap-num">${m.bonus ? 'Bonus' : `Ch ${esc(m.chapterNum)}`}</span>
          <div class="rmc-roadmap-main">
            <p class="rmc-roadmap-title">${esc(m.title)}${m.integrative ? ' — integrative project' : ''}</p>
            <p class="rmc-roadmap-meta">${doneCount}/${visibleConcepts.length} concepts completed</p>
          </div>
          ${RustBar(doneCount / total, doneCount === visibleConcepts.length && visibleConcepts.length > 0)}
          <span class="rmc-roadmap-toggle" aria-hidden="true" style="display:inline-flex;transform:${isOpen ? 'rotate(90deg)' : 'none'};transition:transform 150ms ease">›</span>
        </div>
        <div class="rmc-roadmap-children"${isOpen ? '' : ' hidden'}>
          ${visibleConcepts.map((c) => `<div class="rmc-roadmap-row" style="padding:9px 14px" role="button" tabindex="0" aria-label="${esc(c.concept)} — ${esc(statusLabel(statusMap[c.id]))}" data-action="open-concept" data-concept="${esc(c.id)}">
            <span class="rmc-dot rmc-dot-${esc(statusMap[c.id])}"></span>
            <div class="rmc-roadmap-main">
              <p class="rmc-roadmap-title" style="font-size:13px">${esc(c.concept)}</p>
              <p class="rmc-roadmap-meta">${fmtMin(c.estMinutes)} · difficulty ${c.difficulty}/5</p>
            </div>
            ${StatusBadge(statusMap[c.id])}
          </div>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function CheckpointMarkup(concept) {
    const qs = concept.checkpoint && concept.checkpoint.questions;
    if (!qs || !qs.length) return '';
    const cUi = ui.checkpoint[concept.id] || {};
    const answers = cUi.answers || {};
    const judged = qs.filter((q, i) => {
      const s = quizQuestionState(q, answers[i]);
      return s === 'correct' || s === 'wrong';
    }).length;

    return `<div>
      <p class="rmc-quiz-progress" data-quiz-progress="${esc(concept.id)}">Answered ${judged} of ${qs.length} — all must be correct to pass.</p>
      ${qs.map((q, i) => quizQuestionMarkup(concept, q, i, answers[i])).join('')}
      <button type="button" class="rmc-btn-ghost" style="margin-top:10px" data-action="retake-checkpoint" data-concept="${esc(concept.id)}">Restart quiz</button>
    </div>`;
  }

  function quizAnswers(id) {
    const cUi = ui.checkpoint[id] || {};
    return cUi.answers || {};
  }

  // open | revealed (self Q, shown but unjudged) | correct | wrong
  function quizQuestionState(q, a) {
    if (!q) return 'open';
    if (q.type === 'multiple_choice') {
      if (!a || a.selected == null) return 'open';
      return a.selected === q.correct ? 'correct' : 'wrong';
    }
    if (!a || !a.revealed) return 'open';
    if (a.passed === true) return 'correct';
    if (a.passed === false) return 'wrong';
    return 'revealed';
  }

  function quizDone(qs, answers) {
    return qs.every((q, i) => {
      const s = quizQuestionState(q, answers[i]);
      return s === 'correct' || s === 'wrong';
    });
  }

  function quizPassed(qs, answers) {
    return qs.every((q, i) => quizQuestionState(q, answers[i]) === 'correct');
  }

  // Returns true when the quiz just finished (already re-rendered via setState).
  function maybeFinishQuiz(id) {
    const concept = derived().byId[id];
    const qs = concept && concept.checkpoint && concept.checkpoint.questions;
    if (!qs || !qs.length) return false;
    const answers = quizAnswers(id);
    if (!quizDone(qs, answers)) return false;
    const existing = ui.checkpoint[id];
    if (existing && existing.outcome !== undefined && existing.outcome !== null) return false;
    handleCheckpointResult(id, quizPassed(qs, answers));
    return true;
  }

  function quizQuestionMarkup(concept, q, qi, a) {
    return `<div class="rmc-quiz-q" data-quiz-q="${esc(concept.id)}:${qi}" tabindex="-1">`
      + quizQuestionHead(q, qi) + quizQuestionTail(concept, q, qi, a) + `</div>`;
  }

  // Shared single source for result markup (full renders and surgical paints).
  function quizResultHTML(ok, strong, explain) {
    return `<div class="rmc-checkpoint-result ${ok ? 'pass' : 'fail'}"><strong>${strong}</strong> ${fmtMultiline(explain)}</div>`;
  }

  function quizQuestionHead(q, qi) {
    return `<p class="rmc-checkpoint-prompt"><strong>Q${qi + 1}.</strong> ${fmtMultiline(q.prompt)}</p>`;
  }

  function quizQuestionTail(concept, q, qi, a) {
    const cid = esc(concept.id);
    const state = quizQuestionState(q, a);
    if (q.type === 'multiple_choice') {
      const judged = state === 'correct' || state === 'wrong';
      return `${q.options.map((opt) => {
          let cls = 'rmc-option-btn';
          if (judged && opt.id === q.correct) cls += ' correct';
          else if (judged && opt.id === (a && a.selected)) cls += ' incorrect';
          return `<button type="button" class="${cls}" ${judged ? 'disabled' : ''} data-action="answer-mc" data-concept="${cid}" data-q="${qi}" data-option="${esc(opt.id)}">${esc(opt.text)}</button>`;
        }).join('')}`
        + (judged
          ? quizResultHTML(state === 'correct', state === 'correct' ? 'Correct.' : 'Not quite.', q.explain)
          : '');
    }
    // Self-assessed (predict_output / find_bug / explain): reveal, then honest Yes/No.
    if (state === 'open') {
      return `<button type="button" class="rmc-btn-ghost" data-action="reveal-checkpoint" data-concept="${cid}" data-q="${qi}">Reveal answer &amp; self-check</button>`;
    }
    if (state === 'revealed') {
      return `<div class="rmc-checkpoint-result pass" style="margin-bottom:10px">${fmtMultiline(q.explain)}</div>
        <p style="font-size:12.5px;color:var(--text-2);margin-bottom:8px">Be honest: did you get this right before revealing the answer?</p>
        <button type="button" class="rmc-btn-ghost" style="margin-right:8px" data-action="self-check" data-concept="${cid}" data-q="${qi}" data-passed="true">Yes — mark passed</button>
        <button type="button" class="rmc-btn-ghost" data-action="self-check" data-concept="${cid}" data-q="${qi}" data-passed="false">No — needs review</button>`;
    }
    const ok = state === 'correct';
    return quizResultHTML(ok, ok ? 'Marked as passed.' : 'Marked as needs review.', q.explain);
  }

  function findQuizBox(id, qi) {
    if (!root) return null;
    const boxes = root.querySelectorAll('[data-quiz-q]');
    for (const box of boxes) {
      if (box.dataset.quizQ === id + ':' + qi) return box;
    }
    return null;
  }

  function moveChildrenInto(box, html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    box.append(...Array.from(tmp.childNodes));
  }

  // Replace everything after the prompt head (<p class="rmc-checkpoint-prompt">)
  // with fresh tail markup. Fixes duplication where the old explanation +
  // honesty prompt were left in place and the result was appended on top.
  function replaceQuizTail(box, html) {
    if (!box) return;
    while (box.childNodes.length > 1) box.removeChild(box.lastChild);
    moveChildrenInto(box, html);
  }

  // Escape for use inside a querySelector attribute value. Keys here are
  // simple (chapter numbers + 'bonus'), but guard old browsers w/o CSS.escape.
  function attrEscape(value) {
    const s = String(value);
    if (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') return CSS.escape(s);
    return s.replace(/["\\]/g, '\\$&');
  }

  function refreshQuizProgress(id) {
    if (!root) return;
    const concept = derived().byId[id];
    const qs = concept && concept.checkpoint && concept.checkpoint.questions;
    if (!qs) return;
    const answers = quizAnswers(id);
    const judged = qs.filter((q, i) => {
      const s = quizQuestionState(q, answers[i]);
      return s === 'correct' || s === 'wrong';
    }).length;
    const bars = root.querySelectorAll('[data-quiz-progress]');
    for (const bar of bars) {
      if (bar.dataset.quizProgress === id) {
        bar.textContent = `Answered ${judged} of ${qs.length} — all must be correct to pass.`;
      }
    }
  }

  function isLockedByPrereqs(conceptId) {
    const c = CONCEPT_BY_ID[conceptId];
    if (!c) return true;
    return prereqsOf(c).some((pid) => !isCompleted(state, pid));
  }

  // Opening an external resource promotes the block to in-progress (locked blocks never promote).
  // Quiet: no DOM churn unless the status badge actually flips.
  function markInProgress(conceptId) {
    if (!isValidConceptId(conceptId)) return;
    if (isLockedByPrereqs(conceptId)) return;
    if (getProgress(state, conceptId).status !== 'not-started') return;
    setStateQuiet((s) => {
      const cur = getProgress(s, conceptId);
      return {
        ...s,
        lastActiveConceptId: conceptId,
        progress: { ...s.progress, [conceptId]: { ...cur, status: 'in-progress' } },
      };
    }, conceptId);
  }

  function handleCheckpointResult(conceptId, passed) {
    if (!isValidConceptId(conceptId)) return;
    const ok = passed === true;
    ui.checkpoint[conceptId] = { ...(ui.checkpoint[conceptId] || {}), outcome: ok, show: true };
    setState((s) => {
      const cur = getProgress(s, conceptId);
      const prevAttemptsRaw = cur.checkpoint && typeof cur.checkpoint.attempts === 'number' ? cur.checkpoint.attempts : 0;
      const prevAttempts = Number.isFinite(prevAttemptsRaw) && prevAttemptsRaw >= 0 ? Math.floor(prevAttemptsRaw) : 0;
      const now = Date.now();
      const concept = conceptById()[conceptId];
      const fundamental = !!(concept && concept.fundamental);
      // Permanent unlock: checkpointPassed never flips back to false. A retake
      // failure only moves the display status to needs-review and re-queues SRS.
      const checkpointPassed = ok ? true : cur.checkpointPassed === true;
      let review = cur.review;
      if (ok && fundamental) {
        review = { nextReviewAt: now + REVIEW_FIRST_INTERVAL_DAYS * DAY_MS, intervalDays: REVIEW_FIRST_INTERVAL_DAYS, repetitions: 1 };
      } else if (!ok && fundamental) {
        review = { nextReviewAt: now, intervalDays: 1, repetitions: 0 };
      }
      return {
        ...s,
        lastActiveConceptId: conceptId,
        progress: {
          ...s.progress,
          [conceptId]: {
            ...cur,
            status: ok ? 'completed' : 'needs-review',
            checkpoint: { passed: ok, attempts: prevAttempts + 1 },
            checkpointPassed,
            review,
          },
        },
        reviewLog: ok ? { ...s.reviewLog, [conceptId]: now } : s.reviewLog,
      };
    });
  }

  function lessonNeighbors(conceptId) {
    if (typeof concepts === 'undefined' || !Array.isArray(concepts)) return { prev: null, next: null };
    const idx = concepts.findIndex((c) => c.id === conceptId);
    if (idx < 0) return { prev: null, next: null };
    return {
      prev: idx > 0 ? concepts[idx - 1] : null,
      next: idx < concepts.length - 1 ? concepts[idx + 1] : null,
    };
  }

  function lessonPagination(concept) {
    const nb = lessonNeighbors(concept.id);
    const prev = nb.prev;
    const next = nb.next;
    if (!prev && !next) return '';
    const prevTitle = prev ? (prev.trpl && prev.trpl[0] ? prev.trpl[0].num + ' \u00b7 ' + prev.trpl[0].title : prev.concept) : '';
    const nextTitle = next ? (next.trpl && next.trpl[0] ? next.trpl[0].num + ' \u00b7 ' + next.trpl[0].title : next.concept) : '';
    return '<nav class="rmc-pagination" aria-label="Lesson pagination">'
      + (prev
        ? '<button type="button" class="rmc-btn-ghost" data-action="open-concept" data-concept="' + esc(prev.id) + '" title="' + esc(prevTitle) + '">\u2190 Previous Lesson</button>'
        : '<span class="rmc-pagination-spacer"></span>')
      + '<span class="rmc-pagination-spacer"></span>'
      + (next
        ? '<button type="button" class="rmc-btn-ghost" data-action="open-concept" data-concept="' + esc(next.id) + '" title="' + esc(nextTitle) + '">Next Lesson \u2192</button>'
        : '')
      + '</nav>';
  }

  function LearningBlock(concept, statusMap, byId) {
    const status = statusMap[concept.id];
    const p = getProgress(state, concept.id);
    const cUi = ui.checkpoint[concept.id] || {};
    const persistedOutcome = p.checkpoint && typeof p.checkpoint.passed === 'boolean' ? p.checkpoint.passed : null;
    const checkpointOutcome = cUi.outcome !== undefined ? cUi.outcome : persistedOutcome;

    if (status === 'locked') {
      const prereqs = prereqsOf(concept);
      return `<div>
        <h2 class="rmc-block-title">${esc(concept.concept)}</h2>
        <div class="rmc-locked-banner">
          <strong>This block is locked.</strong> Finish and pass the checkpoint for its prerequisite${prereqs.length > 1 ? 's' : ''} first:
          <div class="rmc-chip-list" style="margin-top:10px">
            ${prereqs.map((pid) => {
              const met = statusMap[pid] === 'completed';
              return `<button type="button" class="rmc-prereq-chip ${met ? 'met' : 'unmet'}" data-action="open-concept" data-concept="${esc(pid)}">${met ? '✓' : '○'} ${esc(byId[pid] ? byId[pid].concept : pid)} — ${esc(statusLabel(statusMap[pid]))}</button>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    }

    const practiceTasks = Array.isArray(concept.practice) ? concept.practice : [];
    const trplList = Array.isArray(concept.trpl) ? concept.trpl : [];
    const rbeList = Array.isArray(concept.rbe) ? concept.rbe : [];
    const rustlingsList = Array.isArray(concept.rustlings) ? concept.rustlings : [];

    return `<div>
      <div class="rmc-block-header">
        <div>
          <div class="rmc-block-chapter rmc-breadcrumb">Ch ${esc(concept.bonus ? String('Bonus') : String(concept.chapter))} · ${esc(concept.chapterTitle)}</div>
          <h2 class="rmc-block-title">${esc(concept.concept)}</h2>
        </div>
        ${StatusBadge(status)}
      </div>

      <div class="rmc-panel">
        <h3>Read — The Book (TRPL) <span class="rmc-panel-tag">master sequence</span></h3>
        ${trplList.map((t) => `<div class="rmc-resource-row">
          <span class="rmc-resource-name">${esc(t.num)} ${esc(t.title)}</span>
          <div class="rmc-resource-actions">
            <a class="rmc-btn rmc-btn-ghost" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" data-action="open-resource" data-concept="${esc(concept.id)}">Open TRPL</a>
          </div>
        </div>`).join('')}
      </div>

      ${rbeList.length === 0 ? '' : `<div class="rmc-panel">
        <h3>See — Rust by Example</h3>
        ${rbeList.map((r) => `<div class="rmc-resource-row">
              <div class="rmc-check-row">
                <input type="checkbox" class="rmc-checkbox" ${p.rbeSeen[r.url] ? 'checked' : ''} data-action="toggle-rbe" data-concept="${esc(concept.id)}" data-url="${esc(r.url)}">
                <span class="rmc-resource-name">${esc(r.title)}</span>
              </div>
              <div class="rmc-resource-actions">
                ${TypeTag(r.type)}
                <a class="rmc-btn rmc-btn-ghost" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" data-action="open-resource" data-concept="${esc(concept.id)}">Open RBE</a>
              </div>
            </div>`).join('')}
      </div>`}

      ${rustlingsList.length === 0 && practiceTasks.length === 0 ? '' : `<div class="rmc-panel">
        <h3>Do — Rustlings practice</h3>
        ${rustlingsList.map((r) => resourceExerciseMarkup(concept, p, r)).join('')}
            ${practiceTasks.map((t) => practiceTaskMarkup(concept, p, t)).join('')}
      </div>`}

      <div class="rmc-panel rmc-checkpoint-panel">
        <h3>Check — quiz · ${concept.checkpoint && concept.checkpoint.questions ? concept.checkpoint.questions.length : 3} questions · pass all to complete</h3>
        ${!cUi.show && checkpointOutcome === null ? `<button type="button" class="rmc-btn-primary" data-action="show-checkpoint" data-concept="${esc(concept.id)}">Take checkpoint</button>` : ''}
        ${!cUi.show && checkpointOutcome !== null ? `<div>
            <div class="rmc-checkpoint-result ${checkpointOutcome ? 'pass' : 'fail'}">
              ${checkpointOutcome ? 'Checkpoint passed.' : 'Checkpoint not passed yet — this block is marked "needs review".'}
            </div>
            <button type="button" class="rmc-btn-ghost" style="margin-top:10px" data-action="retake-checkpoint" data-concept="${esc(concept.id)}">Retake checkpoint</button>
          </div>` : ''}
        ${cUi.show ? CheckpointMarkup(concept) : ''}
        ${checkpointOutcome === false ? `<div class="rmc-remediation">
          <strong>Remediation:</strong>
          ${trplList[0] ? `<a href="${esc(trplList[0].url)}" target="_blank" rel="noopener noreferrer">Review TRPL</a>` : ''}
          ${rbeList[0] ? `<span class="arrow">→</span><a href="${esc(rbeList[0].url)}" target="_blank" rel="noopener noreferrer">Review RBE</a>` : ''}
          ${rustlingsList[0] ? `<span class="arrow">→</span><a href="${esc(rustlingsList[0].url)}" target="_blank" rel="noopener noreferrer">Redo ${esc(rustlingsList[0].name)}</a>` : ''}
        </div>` : ''}
      </div>

      ${lessonPagination(concept)}
      ${status === 'completed'
        ? '<p class="rmc-mastery-label">Completed — earned by passing the checkpoint above. Re-take it any time to refresh mastery.</p>'
        : '<p class="rmc-mastery-label">Complete this block by passing its checkpoint — there is no manual override.</p>'}
    </div>`;
  }

  function resourceExerciseMarkup(concept, p, r) {
    return `<div class="rmc-resource-row">
      <div class="rmc-check-row">
        <input type="checkbox" class="rmc-checkbox" ${p.rustlingsDone[r.name] ? 'checked' : ''} data-action="toggle-rustlings" data-concept="${esc(concept.id)}" data-name="${esc(r.name)}">
        <span class="rmc-resource-name mono">${esc(r.name)}</span>
      </div>
      <div class="rmc-resource-actions">
        <a class="rmc-btn rmc-btn-ghost" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" data-action="open-resource" data-concept="${esc(concept.id)}">Open Rustlings</a>
      </div>
    </div>`;
  }

  function practiceTaskMarkup(concept, p, t) {
    return `<div class="rmc-resource-row">
      <div class="rmc-check-row">
        <input type="checkbox" class="rmc-checkbox" ${p.practiceDone[t.id] ? 'checked' : ''} data-action="toggle-practice" data-concept="${esc(concept.id)}" data-task="${esc(t.id)}">
        <span class="rmc-resource-name">${esc(t.text)}</span>
      </div>
      <div class="rmc-resource-actions">
        <span class="rmc-type-tag rmc-type-DIY">DIY</span>
      </div>
    </div>`;
  }

  function reviewQueue(statusMap) {
    const now = Date.now();
    const list = (typeof concepts !== 'undefined' && Array.isArray(concepts)) ? concepts : [];
    return list
      .filter((c) => {
        if (!c.fundamental) return false;
        const p = getProgress(state, c.id);
        if (p.checkpointPassed !== true) return false;
        return now >= (p.review && p.review.nextReviewAt ? p.review.nextReviewAt : 0);
      })
      .sort((a, b) => {
        const pa = getProgress(state, a.id);
        const pb = getProgress(state, b.id);
        const na = pa.review && pa.review.nextReviewAt ? pa.review.nextReviewAt : 0;
        const nb = pb.review && pb.review.nextReviewAt ? pb.review.nextReviewAt : 0;
        return na - nb;
      });
  }

  function ReviewQueue(statusMap, limit) {
    const queue = reviewQueue(statusMap);
    const shown = limit ? queue.slice(0, limit) : queue;
    if (!shown.length) return '<div class="rmc-empty">Nothing due for review right now. Cards reappear here on their spaced schedule once due.</div>';

    return `<div>${shown.map((c) => {
      const q1 = c.checkpoint && c.checkpoint.questions && c.checkpoint.questions[0];
      return `
      <div class="rmc-review-card">
        <p class="rmc-review-meta">Recall fundamental · ${esc(c.concept)}</p>
        <p class="rmc-recall-q">${fmtMultiline((q1 && q1.prompt) || 'Review this concept in the course module.')}</p>
        <details style="margin: 8px 0 12px">
          <summary style="cursor:pointer;font-size:12.5px;color:var(--accent);font-weight:500">Show explanation &amp; answer</summary>
          <div class="rmc-checkpoint-result pass" style="margin-top:8px">${fmtMultiline((q1 && q1.explain) || 'Review this concept in the course module.')}</div>
        </details>
        <div style="display:flex;gap:8px">
          <button type="button" class="rmc-btn-primary" data-action="review-mark" data-concept="${esc(c.id)}" data-got-it="true">Got it</button>
          <button type="button" class="rmc-btn-ghost" data-action="review-mark" data-concept="${esc(c.id)}" data-got-it="false">Fuzzy — revisit</button>
        </div>
      </div>`;}).join('')}</div>`;
  }

  function mainContent(statusMap, byId) {
    const selectedConcept = ui.selectedConceptId ? byId[ui.selectedConceptId] : null;
    if (ui.view === 'block' && selectedConcept) return LearningBlock(selectedConcept, statusMap, byId);
    if (ui.view === 'review') return `<div><h2 class="rmc-page-title">Review Queue</h2>${ReviewQueue(statusMap)}</div>`;
    return `<div><h2 class="rmc-page-title">Course Roadmap</h2>${CourseRoadmap(statusMap)}</div>`;
  }

  // ---------- Render ----------

  function toggleRoadmapModule(key) {
    ui.expandedModule = String(ui.expandedModule) === String(key) ? null : key;
  }

  function toggleSidebarModule(key) {
    ui.sidebarExpanded[String(key)] = !ui.sidebarExpanded[String(key)];
  }

  function renderScrim() {
    return ui.menuOpen
      ? '<button type="button" class="rmc-scrim" data-action="toggle-menu" aria-label="Close navigation"></button>'
      : '';
  }


  function render() {
    if (!root) return;
    if (!hasCourseData()) {
      root.textContent = 'Course data failed to load. Check that data.js is present.';
      return;
    }
    if (!VALID_VIEWS.includes(ui.view)) ui.view = 'roadmap';
    if (ui.selectedConceptId !== null && !isValidConceptId(ui.selectedConceptId)) ui.selectedConceptId = null;
    if (ui.view === 'block' && !ui.selectedConceptId) ui.view = 'roadmap';
    if (typeof ui.menuOpen !== 'boolean') ui.menuOpen = false;
    // Preserve sidebar scroll across the destructive rebuild (sticky drawer
    // loses scrollTop when innerHTML is replaced).
    const prevSidebar = root.querySelector('#rmc-sidebar');
    const prevSidebarScroll = prevSidebar ? prevSidebar.scrollTop : 0;
    // Avoid touching body overflow unless it actually flips (style recalc).
    if (document.body) {
      const want = ui.menuOpen ? 'hidden' : '';
      if (document.body.style.overflow !== want) document.body.style.overflow = want;
    }
    ensureSidebarExpanded();
    const { byId, statusMap } = derived();
    root.innerHTML = `<div class="rmc-app">`
      + MobileBar()
      + Sidebar(ui.view, ui.selectedConceptId, statusMap)
      + renderScrim()
      + `<main class="rmc-main">${mainContent(statusMap, byId)}</main>`
      + `</div>`;
    bindEvents();
    if (prevSidebarScroll) {
      const nextSidebar = root.querySelector('#rmc-sidebar');
      if (nextSidebar) nextSidebar.scrollTop = prevSidebarScroll;
    }
  }

  // ---------- Surgical (no-rebuild) updates ----------
  // These mutate only the affected subtree so sidebar scroll, focus, window
  // scroll, and in-page translation survive. Fall back to render() if the
  // expected nodes are absent (e.g. view changed underneath us).

  function setMenuOpenSurgical(open) {
    open = open === true;
    ui.menuOpen = open;
    if (!root) return true;
    if (document.body) {
      const want = open ? 'hidden' : '';
      if (document.body.style.overflow !== want) document.body.style.overflow = want;
    }
    const sidebar = root.querySelector('#rmc-sidebar');
    const app = root.querySelector('.rmc-app');
    if (!sidebar || !app) { render(); return true; }
    sidebar.classList.toggle('open', open);
    let scrim = root.querySelector('.rmc-scrim');
    if (open && !scrim) {
      scrim = document.createElement('button');
      scrim.type = 'button';
      scrim.className = 'rmc-scrim';
      scrim.setAttribute('data-action', 'toggle-menu');
      scrim.setAttribute('aria-label', 'Close navigation');
      sidebar.after(scrim);
    } else if (!open && scrim) {
      scrim.remove();
    }
    const toggles = root.querySelectorAll('[data-action="toggle-menu"]');
    for (const b of toggles) {
      if (b !== scrim && b.getAttribute('aria-controls') === 'rmc-sidebar') {
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }
    return true;
  }

  function toggleThemeSurgical() {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    if (!root) return true;
    // applyTheme already flipped root + documentElement dataset.theme, which
    // is what the CSS keys off. Only the toggle button label/icon needs a
    // micro-mutation — no container rebuild.
    const html = themeToggleInner();
    const btns = root.querySelectorAll('[data-action="toggle-theme"]');
    if (!btns.length) { render(); return true; }
    for (const b of btns) b.innerHTML = html;
    return true;
  }

  function toggleRoadmapModuleSurgical(key) {
    toggleRoadmapModule(key);
    if (!root) return true;
    const isOpen = String(ui.expandedModule) === String(key);
    const chapter = root.querySelector('.rmc-roadmap-chapter[data-chapter="' + attrEscape(key) + '"]');
    if (!chapter) { render(); return true; }
    const row = chapter.querySelector('[data-action="toggle-module"]');
    const children = chapter.querySelector('.rmc-roadmap-children');
    if (!row || !children) { render(); return true; }
    // Batch writes together; no interleaved reads (no layout thrash).
    if (isOpen) children.removeAttribute('hidden');
    else children.setAttribute('hidden', '');
    row.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    const caret = row.querySelector('.rmc-roadmap-toggle');
    if (caret) caret.style.transform = isOpen ? 'rotate(90deg)' : 'none';
    return true;
  }

  function toggleSidebarModuleSurgical(key) {
    toggleSidebarModule(key);
    if (!root) return true;
    const open = isSidebarOpen(key);
    const chapter = root.querySelector('.rmc-tree-chapter[data-chapter="' + attrEscape(key) + '"]');
    if (!chapter) { render(); return true; }
    const btn = chapter.querySelector('[data-action="toggle-sidebar-module"]');
    const lessons = chapter.querySelector('.rmc-tree-lessons');
    if (!btn || !lessons) { render(); return true; }
    if (open) lessons.removeAttribute('hidden');
    else lessons.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    return true;
  }

  function focusFirstQuizQuestion(id) {
    if (!root) return;
    const box = root.querySelector('[data-quiz-q^="' + attrEscape(id) + ':"]');
    if (box && typeof box.focus === 'function') box.focus({ preventScroll: true });
  }

  function openConcept(id) {
    if (!isValidConceptId(id)) return;
    // No-op navigation: already on this block — just ensure the drawer is
    // closed (surgically) instead of tearing down the whole tree.
    if (ui.view === 'block' && ui.selectedConceptId === id) {
      if (ui.menuOpen) setMenuOpenSurgical(false);
      return;
    }
    ui.selectedConceptId = id;
    ui.view = 'block';
    // Promote not-started -> in-progress silently so we render exactly once.
    // Locked blocks must never be promoted (root cause of phantom in-progress).
    if (!isLockedByPrereqs(id) && getProgress(state, id).status === 'not-started') {
      const cur = getProgress(state, id);
      state = {
        ...state,
        lastActiveConceptId: id,
        progress: { ...state.progress, [id]: { ...cur, status: 'in-progress' } },
      };
      invalidateDerivedCache();
      saveState();
    } else {
      // Keep last-active tracking without mutating status.
      state = { ...state, lastActiveConceptId: id };
      invalidateDerivedCache();
      saveState();
    }
    // Opening a lesson always closes the mobile drawer; the fresh render
    // already reflects menuOpen=false so no separate surgical close needed.
    ui.menuOpen = false;
    render();
    scrollTop();
  }

  function scrollTop() {
    if (typeof window.scrollTo === 'function') {
      try { window.scrollTo(0, 0); } catch (_) {}
    }
  }

  // ---------- Global event delegation (attached once, survives re-renders) ----------
  let eventsBound = false;

  function dispatchClick(action, el) {
    if (action === 'toggle-theme') {
      // Surgical: only the toggle button label/icon changes; the CSS keys
      // off documentElement dataset.theme (already flipped in applyTheme).
      toggleThemeSurgical();
      return;
    }

    if (action === 'toggle-menu') {
      const opening = !ui.menuOpen;
      setMenuOpenSurgical(opening);

      if (opening) {
        const first = root.querySelector('#rmc-sidebar button');
        if (first) first.focus();
      } else {
        const btn = root.querySelector('[data-action="toggle-menu"]');
        if (btn) btn.focus();
      }
      return;
    }

    if (action === 'set-view') {
      const v = el.dataset.view;
      if (!VALID_VIEWS.includes(v)) return;
      ui.view = v;
      if (ui.view !== 'block') ui.selectedConceptId = null;
      ui.menuOpen = false;
      render();
      scrollTop();
      return;
    }

    if (action === 'toggle-sidebar-module') {
      // Surgical: flip hidden + aria-expanded in place, keep focus/scroll.
      toggleSidebarModuleSurgical(el.dataset.module);
      return;
    }

    if (action === 'toggle-module') {
      // Surgical: flip hidden + caret rotation in place, keep focus/scroll.
      toggleRoadmapModuleSurgical(el.dataset.module);
      return;
    }

    if (action === 'open-concept') {
      if (!isValidConceptId(el.dataset.concept)) return;
      openConcept(el.dataset.concept);
      return;
    }

    if (action === 'show-checkpoint') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      ui.checkpoint[id] = { ...(ui.checkpoint[id] || {}), show: true };
      render();
      focusFirstQuizQuestion(id);
      return;
    }

    if (action === 'retake-checkpoint') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      ui.checkpoint[id] = { show: true, answers: {}, outcome: null };
      render();
      focusFirstQuizQuestion(id);
      return;
    }

    if (action === 'reveal-checkpoint') {
      const id = el.dataset.concept;
      const qi = Number(el.dataset.q || 0);
      if (!isValidConceptId(id)) return;
      const concept = derived().byId[id];
      const qs = concept && concept.checkpoint && concept.checkpoint.questions;
      if (!qs || !qs[qi] || qs[qi].type === 'multiple_choice') return;
      const answers = { ...quizAnswers(id) };
      if (answers[qi] && answers[qi].revealed) return;
      answers[qi] = { ...(answers[qi] || {}), revealed: true };
      ui.checkpoint[id] = { ...(ui.checkpoint[id] || {}), show: true, answers };
      const box = findQuizBox(id, qi);
      if (!box) { render(); return; }
      const btn = box.querySelector('button[data-action="reveal-checkpoint"]');
      if (!btn) { render(); return; }
      moveChildrenInto(box, quizQuestionTail(concept, qs[qi], qi, answers[qi]));
      btn.remove();
      const yes = box.querySelector('button[data-action="self-check"][data-passed="true"]');
      if (yes) yes.focus({ preventScroll: true });
      return;
    }

    if (action === 'answer-mc') {
      const id = el.dataset.concept;
      const option = el.dataset.option;
      const qi = Number(el.dataset.q || 0);
      if (!isValidConceptId(id) || typeof option !== 'string') return;
      const concept = derived().byId[id];
      const qs = concept && concept.checkpoint && concept.checkpoint.questions;
      const q = qs && qs[qi];
      if (!q || q.type !== 'multiple_choice') return;
      const validOptions = (q.options || []).map((o) => o.id);
      if (!validOptions.includes(option)) return;
      // Ignore re-answers: buttons are disabled post-answer, but guard double-clicks.
      const answers = { ...quizAnswers(id) };
      if (answers[qi] && answers[qi].selected != null) return;
      answers[qi] = { selected: option };
      ui.checkpoint[id] = { ...(ui.checkpoint[id] || {}), show: true, answers };
      if (maybeFinishQuiz(id)) return;
      // Surgical paint: only this question changes, so the rest of the page
      // (and its in-page translation) is left untouched.
      const box = findQuizBox(id, qi);
      if (!box) { render(); return; }
      const correct = option === q.correct;
      box.querySelectorAll('button[data-action="answer-mc"]').forEach((b) => {
        b.disabled = true;
        if (b.dataset.option === q.correct) b.classList.add('correct');
        else if (b.dataset.option === option) b.classList.add('incorrect');
      });
      moveChildrenInto(box, quizResultHTML(correct, correct ? 'Correct.' : 'Not quite.', q.explain));
      refreshQuizProgress(id);
      return;
    }

    if (action === 'self-check') {
      const id = el.dataset.concept;
      const qi = Number(el.dataset.q || 0);
      if (!isValidConceptId(id)) return;
      const concept = derived().byId[id];
      const qs = concept && concept.checkpoint && concept.checkpoint.questions;
      const q = qs && qs[qi];
      if (!q || q.type === 'multiple_choice') return;
      const answers = { ...quizAnswers(id) };
      const cur = answers[qi] || {};
      if (!cur.revealed || cur.passed !== undefined) return;
      answers[qi] = { revealed: true, passed: el.dataset.passed === 'true' };
      ui.checkpoint[id] = { ...(ui.checkpoint[id] || {}), show: true, answers };
      if (maybeFinishQuiz(id)) return;
      const box = findQuizBox(id, qi);
      if (!box) { render(); return; }
      // BUGFIX: the revealed tail (explanation + honesty prompt + Yes/No) must
      // be replaced, not appended to — otherwise the explanation renders twice
      // and the stale "Be honest" paragraph lingers next to the verdict.
      replaceQuizTail(box, quizQuestionTail(concept, q, qi, answers[qi]));
      box.focus({ preventScroll: true });
      refreshQuizProgress(id);
      return;
    }

    if (action === 'review-mark') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;

      // Idempotency guard: ignore duplicate clicks if already rescheduled into the future
      const pCheck = getProgress(state, id);
      if (pCheck.review && Number.isFinite(pCheck.review.nextReviewAt) && Date.now() < pCheck.review.nextReviewAt) return;

      const gotIt = el.dataset.gotIt === 'true';
      const now = Date.now();
      const prevP = getProgress(state, id);
      const prevReps = prevP.review && Number.isFinite(prevP.review.repetitions) && prevP.review.repetitions >= 0
        ? Math.floor(prevP.review.repetitions) : 0;
      const prevInterval = prevP.review && Number.isFinite(prevP.review.intervalDays) && prevP.review.intervalDays >= 1
        ? Math.floor(prevP.review.intervalDays) : REVIEW_FIRST_INTERVAL_DAYS;
      // SRS ladder [1,3,7,14,30,60]: success advances, failure resets to a
      // 1-day interval due tomorrow. Self-rating dots are never touched here.
      const intervalDays = gotIt ? nextIntervalDays(prevInterval) : 1;
      const repetitions = gotIt ? prevReps + 1 : 0;
      if (!gotIt) {
        // Single-render path: apply the SRS reschedule silently, then let
        // openConcept() perform the one and only render + scroll. The old
        // code called setState() (render #1) followed by openConcept()
        // (render #2) — two full innerHTML sweeps back-to-back.
        state = {
          ...state,
          progress: {
            ...state.progress,
            [id]: {
              ...prevP,
              review: { nextReviewAt: now + intervalDays * DAY_MS, intervalDays, repetitions },
            },
          },
        };
        invalidateDerivedCache();
        saveState();
        openConcept(id);
        return;
      }
      setState((s) => {
        const p = getProgress(s, id);
        return {
          ...s,
          progress: {
            ...s.progress,
            [id]: {
              ...p,
              review: { nextReviewAt: now + intervalDays * DAY_MS, intervalDays, repetitions },
            },
          },
          reviewLog: { ...s.reviewLog, [id]: now },
        };
      });
      return;
    }

    if (action === 'open-resource') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      markInProgress(id);
      return;
    }
  }

  function dispatchChange(action, el) {
    if (action === 'toggle-rbe') {
      const id = el.dataset.concept;
      const url = el.dataset.url;
      if (!isValidConceptId(id) || typeof url !== 'string' || !url) return;
      const concept = derived().byId[id];
      if (!concept || !(concept.rbe || []).some((r) => r.url === url)) return;
      if (isLockedByPrereqs(id)) return;
      const checked = el.checked === true;
      setStateQuiet((s) => {
        const p = getProgress(s, id);
        return {
          ...s,
          lastActiveConceptId: id,
          progress: {
            ...s.progress,
            [id]: {
              ...p,
              status: p.status === 'not-started' ? 'in-progress' : p.status,
              rbeSeen: { ...p.rbeSeen, [url]: checked },
            },
          },
        };
      }, id, { action: 'toggle-rbe', key: 'url', value: url });
    }

    if (action === 'toggle-rustlings') {
      const id = el.dataset.concept;
      const name = el.dataset.name;
      if (!isValidConceptId(id) || typeof name !== 'string' || !name) return;
      const concept = derived().byId[id];
      if (!concept || !(concept.rustlings || []).some((r) => r.name === name)) return;
      if (isLockedByPrereqs(id)) return;
      const checked = el.checked === true;
      setStateQuiet((s) => {
        const p = getProgress(s, id);
        return {
          ...s,
          lastActiveConceptId: id,
          progress: {
            ...s.progress,
            [id]: {
              ...p,
              status: p.status === 'not-started' ? 'in-progress' : p.status,
              rustlingsDone: { ...p.rustlingsDone, [name]: checked },
            },
          },
        };
      }, id, { action: 'toggle-rustlings', key: 'name', value: name });
    }

    if (action === 'toggle-practice') {
      const id = el.dataset.concept;
      const task = el.dataset.task;
      if (!isValidConceptId(id) || typeof task !== 'string' || !task) return;
      const concept = derived().byId[id];
      if (!concept || !((concept.practice || []).some((t) => t.id === task))) return;
      if (isLockedByPrereqs(id)) return;
      const checked = el.checked === true;
      setStateQuiet((s) => {
        const p = getProgress(s, id);
        return {
          ...s,
          lastActiveConceptId: id,
          progress: {
            ...s.progress,
            [id]: {
              ...p,
              status: p.status === 'not-started' ? 'in-progress' : p.status,
              practiceDone: { ...p.practiceDone, [task]: checked },
            },
          },
        };
      }, id, { action: 'toggle-practice', key: 'task', value: task });
    }
  }

  function bindEvents() {
    if (eventsBound) return;
    if (!root) return;
    eventsBound = true;
    root.addEventListener('click', (e) => {
      const actionEl = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!actionEl || !root.contains(actionEl)) return;
      dispatchClick(actionEl.dataset.action, actionEl);
    });
    root.addEventListener('change', (e) => {
      const actionEl = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!actionEl || !root.contains(actionEl)) return;
      dispatchChange(actionEl.dataset.action, actionEl);
    });
    // Keyboard activation for custom row controls.
    // Native buttons/links already fire click on Enter/Space — skip them.
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target;
      if (!t || !t.closest || typeof t.closest !== 'function') return;
      if (t.closest('button, a, input, summary, select, textarea')) return;
      const row = t.closest('[role="button"][data-action]');
      if (!row) return;
      e.preventDefault();
      dispatchClick(row.dataset.action, row);
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = loadState();
      invalidateDerivedCache();
      render();
    }
  });

  // Mobile drawer keyboard behavior: Escape closes it (and returns focus to
  // the toggle button); Tab is trapped inside it while open.
  document.addEventListener('keydown', (e) => {
    if (!ui.menuOpen) return;
    if (e.key === 'Escape') {
      // Surgical close: no full rebuild, focus returns to the Menu button.
      setMenuOpenSurgical(false);
      const btn = root ? root.querySelector('[data-action="toggle-menu"]') : null;
      if (btn) btn.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    const sidebar = document.getElementById('rmc-sidebar');
    if (!sidebar) return;
    const focusables = sidebar.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Close the mobile drawer when crossing the 767px breakpoint.
  // No-op when already closed: the old code re-rendered the entire tree on
  // every breakpoint crossing even with nothing to close.
  (function syncDrawerOnViewportChange() {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => {
      if (!ui.menuOpen) return;
      setMenuOpenSurgical(false);
    };
    if (mq && typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (mq && typeof mq.addListener === 'function') mq.addListener(onChange);
  })();

  initTheme();
  render();
})();
