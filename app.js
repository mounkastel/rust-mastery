// ================= App Runtime =================
(function () {
  'use strict';

  const STORAGE_KEY = 'rust-mastery-course-v2';
  const THEME_KEY = 'rust-mastery-theme';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
  const REVIEW_FIRST_INTERVAL_DAYS = REVIEW_INTERVALS_DAYS[0]; // 1 day — must be a ladder rung, not an off-ladder seed
  const root = document.getElementById('app');

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

  const ui = {
    view: 'roadmap',
    selectedConceptId: null,
    expandedModule: modules[0] ? String(modules[0].key) : null,
    sidebarExpanded: modules[0] ? { [String(modules[0].key)]: true } : {},
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
    return typeof id === 'string' && concepts.some((c) => c.id === id);
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
    saveState();
    render();
  }

  // Checkbox ticks must not rebuild the DOM: in-page translators treat a full
  // innerHTML replacement as a brand-new page and re-translate everything.
  // A tick changes nothing visible except a possible not-started -> in-progress
  // flip, so re-render only then (restoring focus to the ticked box).
  function refocusCheckbox(action, id, key, value) {
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

  function computeStatus(s, concept, upNextId) {
    const p = getProgress(s, concept.id);
    const locked = concept.prerequisites.some((pid) => !isCompleted(s, pid));
    if (locked) return 'locked';
    if (p.status === 'needs-review') return 'needs-review';
    if (p.status === 'completed') return 'completed';
    if (p.status === 'in-progress') return 'in-progress';
    if (concept.id === upNextId) return 'up-next';
    return 'not-started';
  }

  function statusLabel(s) {
    return ({
      locked: 'Locked',
      'up-next': 'Up next',
      'in-progress': 'In progress',
      completed: 'Completed',
      'needs-review': 'Needs review',
      'not-started': 'Not started',
    })[s] || s;
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

  const CONCEPT_BY_ID = Object.fromEntries(concepts.map((c) => [c.id, c]));

  function conceptById() {
    return CONCEPT_BY_ID;
  }

  function derived() {
    const byId = conceptById();
    let upNextId = null;
    for (const c of concepts) {
      const locked = c.prerequisites.some((pid) => !isCompleted(state, pid));
      if (!locked && getProgress(state, c.id).status !== 'completed') {
        upNextId = c.id;
        break;
      }
    }
    const statusMap = {};
    concepts.forEach((c) => { statusMap[c.id] = computeStatus(state, c, upNextId); });
    return { byId, upNextId, statusMap };
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
    const firstUnlocked = m.concepts.find((c) => statusMap[c.id] !== 'locked') || m.concepts[0];
    const allDone = m.concepts.every((c) => statusMap[c.id] === 'completed');
    const anyActive = m.concepts.some((c) => c.id === selectedConceptId);
    const dot = allDone ? 'completed' : (firstUnlocked && statusMap[firstUnlocked.id] === 'locked' ? 'locked' : 'in-progress');
    return { anyActive, dot };
  }

  function isSidebarOpen(key) {
    return !!ui.sidebarExpanded[String(key)];
  }

  function ensureSidebarExpanded() {
    if (ui.selectedConceptId && CONCEPT_BY_ID[ui.selectedConceptId]) {
      const c = CONCEPT_BY_ID[ui.selectedConceptId];
      const mod = modules.find((m) => m.concepts.some((x) => x.id === c.id));
      if (mod) ui.sidebarExpanded[String(mod.key)] = true;
    }
  }

  function sidebarLessonLabel(c) {
    if (c.trpl && c.trpl.length && c.trpl[0].num && c.trpl[0].title) {
      return `${c.trpl[0].num} ${c.trpl[0].title}`;
    }
    return c.concept;
  }

  function Sidebar(view, selectedConceptId, statusMap) {
    const dueCount = reviewQueue(statusMap).length;
    // Docs-grade primary views: Course (tree) + Review (SRS queue).
    const navItems = [
      { key: 'roadmap', label: 'Course' },
      { key: 'review', label: 'Review', count: dueCount },
    ];
    const courseView = view === 'review' ? 'review' : 'roadmap';

    const completedCount = concepts.filter((c) => statusMap[c.id] === 'completed').length;

    return `
      <nav class="rmc-sidebar${ui.menuOpen ? ' open' : ''}" id="rmc-sidebar" aria-label="Course navigation">
        <button type="button" class="rmc-brand" data-action="set-view" data-view="roadmap" title="Back to Course Roadmap" aria-label="Back to Course Roadmap">
          <span class="rmc-brand-mark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.8C3 2.36 3.36 2 3.8 2H8v11.2H3.8c-.44 0-.8-.36-.8-.8V2.8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2h4.2c.44 0 .8.36.8.8v8.6c0 .44-.36.8-.8.8H8" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2v11.2" stroke="currentColor" stroke-width="1.2"/></svg></span>
          <span class="rmc-brand-title">${esc(courseMeta.title)}</span>
        </button>
        <div class="rmc-nav-section">
          ${navItems.map((item) => `<button type="button" class="rmc-nav-item${courseView === item.key ? ' active' : ''}" data-action="set-view" data-view="${esc(item.key)}">${esc(item.label)}${item.count > 0 ? `<span class="rmc-nav-count">${item.count}</span>` : ''}</button>`).join('')}
        </div>
        <div class="rmc-nav-section rmc-nav-section--modules">
          <p class="rmc-nav-label">Course</p>
          <div class="rmc-module-list">
            ${modules.map((m) => {
              const st = moduleStatus(m, selectedConceptId, statusMap);
              const open = isSidebarOpen(m.key);
              const activeChapter = st.anyActive;
              return `<div class="rmc-tree-chapter" data-chapter="${esc(m.key)}">
                <button type="button" class="rmc-tree-chapter-btn${activeChapter ? ' active' : ''}" aria-expanded="${open ? 'true' : 'false'}" title="${esc(m.title)}" data-action="toggle-sidebar-module" data-module="${esc(m.key)}">
                  <span class="rmc-tree-caret" aria-hidden="true">›</span>
                  <span class="rmc-tree-chapter-num">${m.bonus ? 'Bonus' : `Ch ${esc(m.chapterNum)}`}</span>
                  <span class="rmc-tree-chapter-title">${esc(m.title)}</span>
                  <span class="rmc-dot rmc-dot-${st.dot}"></span>
                </button>
                <div class="rmc-tree-lessons"${open ? '' : ' hidden'}>
                  ${m.concepts.map((c) => {
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
        <div class="rmc-sidebar-foot"><span>Completed ${completedCount} / ${concepts.length}</span><button type="button" class="rmc-theme-toggle" data-action="toggle-theme" aria-label="Toggle dark theme" title="Toggle dark theme">${themeToggleInner()}</button></div>
      </nav>`;
  }

  function MobileBar() {
    return `
      <div class="rmc-mobilebar">
        <button type="button" class="rmc-mobilebar-brand" data-action="set-view" data-view="roadmap" title="Back to Course Roadmap" aria-label="Back to Course Roadmap"><span class="rmc-brand-mark" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.8C3 2.36 3.36 2 3.8 2H8v11.2H3.8c-.44 0-.8-.36-.8-.8V2.8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2h4.2c.44 0 .8.36.8.8v8.6c0 .44-.36.8-.8.8H8" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 2v11.2" stroke="currentColor" stroke-width="1.2"/></svg></span>${esc(courseMeta.title)}</button>
        <button type="button" class="rmc-btn-ghost" data-action="toggle-menu" aria-label="Toggle navigation" aria-expanded="${ui.menuOpen ? 'true' : 'false'}" aria-controls="rmc-sidebar"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Menu</button>
      </div>`;
  }

  function CourseRoadmap(statusMap) {
    return modules.map((m) => {
      const visibleConcepts = m.concepts;
      const doneCount = m.concepts.filter((c) => statusMap[c.id] === 'completed').length;
      const isOpen = String(ui.expandedModule) === String(m.key);
      return `<div class="rmc-roadmap-chapter" data-chapter="${esc(m.key)}">
        <div class="rmc-roadmap-row" role="button" tabindex="0" aria-expanded="${isOpen ? 'true' : 'false'}" aria-label="${esc(m.title)} — ${doneCount} of ${m.concepts.length} completed" data-action="toggle-module" data-module="${esc(m.key)}">
          <span class="rmc-roadmap-num">${m.bonus ? 'Bonus' : `Ch ${esc(m.chapterNum)}`}</span>
          <div class="rmc-roadmap-main">
            <p class="rmc-roadmap-title">${esc(m.title)}${m.integrative ? ' — integrative project' : ''}</p>
            <p class="rmc-roadmap-meta">${doneCount}/${m.concepts.length} concepts completed</p>
          </div>
          ${RustBar(doneCount / m.concepts.length, doneCount === m.concepts.length)}
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
      <p class="rmc-quiz-progress">Answered ${judged} of ${qs.length} — all must be correct to pass.</p>
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
    const state = quizQuestionState(q, a);
    const head = `<p class="rmc-checkpoint-prompt"><strong>Q${qi + 1}.</strong> ${fmtMultiline(q.prompt)}</p>`;
    if (q.type === 'multiple_choice') {
      const judged = state === 'correct' || state === 'wrong';
      return `<div style="margin-bottom:14px">${head}
        ${q.options.map((opt) => {
          let cls = 'rmc-option-btn';
          if (judged && opt.id === q.correct) cls += ' correct';
          else if (judged && opt.id === (a && a.selected)) cls += ' incorrect';
          return `<button type="button" class="${cls}" ${judged ? 'disabled' : ''} data-action="answer-mc" data-concept="${esc(concept.id)}" data-q="${qi}" data-option="${esc(opt.id)}">${esc(opt.text)}</button>`;
        }).join('')}
        ${judged ? `<div class="rmc-checkpoint-result ${state === 'correct' ? 'pass' : 'fail'}"><strong>${state === 'correct' ? 'Correct.' : 'Not quite.'}</strong> ${fmtMultiline(q.explain)}</div>` : ''}
      </div>`;
    }
    // Self-assessed (predict_output / find_bug / explain): reveal, then honest Yes/No.
    if (state === 'open') {
      return `<div style="margin-bottom:14px">${head}
        <button type="button" class="rmc-btn-ghost" data-action="reveal-checkpoint" data-concept="${esc(concept.id)}" data-q="${qi}">Reveal answer &amp; self-check</button>
      </div>`;
    }
    if (state === 'revealed') {
      return `<div style="margin-bottom:14px">${head}
        <div class="rmc-checkpoint-result pass" style="margin-bottom:10px">${fmtMultiline(q.explain)}</div>
        <p style="font-size:12.5px;color:var(--text-2);margin-bottom:8px">Be honest: did you get this right before revealing the answer?</p>
        <button type="button" class="rmc-btn-ghost" style="margin-right:8px" data-action="self-check" data-concept="${esc(concept.id)}" data-q="${qi}" data-passed="true">Yes — mark passed</button>
        <button type="button" class="rmc-btn-ghost" data-action="self-check" data-concept="${esc(concept.id)}" data-q="${qi}" data-passed="false">No — needs review</button>
      </div>`;
    }
    return `<div style="margin-bottom:14px">${head}
      <div class="rmc-checkpoint-result ${state === 'correct' ? 'pass' : 'fail'}"><strong>${state === 'correct' ? 'Marked as passed.' : 'Marked as needs review.'}</strong> ${fmtMultiline(q.explain)}</div>
    </div>`;
  }

  function isLockedByPrereqs(conceptId) {
    const c = CONCEPT_BY_ID[conceptId];
    if (!c) return true;
    return c.prerequisites.some((pid) => !isCompleted(state, pid));
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
      return `<div>
        <h2 class="rmc-block-title">${esc(concept.concept)}</h2>
        <div class="rmc-locked-banner">
          <strong>This block is locked.</strong> Finish and pass the checkpoint for its prerequisite${concept.prerequisites.length > 1 ? 's' : ''} first:
          <div class="rmc-chip-list" style="margin-top:10px">
            ${concept.prerequisites.map((pid) => {
              const met = statusMap[pid] === 'completed';
              return `<button type="button" class="rmc-prereq-chip ${met ? 'met' : 'unmet'}" data-action="open-concept" data-concept="${esc(pid)}">${met ? '✓' : '○'} ${esc(byId[pid] ? byId[pid].concept : pid)} — ${esc(statusLabel(statusMap[pid]))}</button>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    }

    const practiceTasks = Array.isArray(concept.practice) ? concept.practice : [];

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
        ${concept.trpl.map((t) => `<div class="rmc-resource-row">
          <span class="rmc-resource-name">${esc(t.num)} ${esc(t.title)}</span>
          <div class="rmc-resource-actions">
            <a class="rmc-btn rmc-btn-ghost" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" data-action="open-resource" data-concept="${esc(concept.id)}">Open TRPL</a>
          </div>
        </div>`).join('')}
      </div>

      ${concept.rbe.length === 0 ? '' : `<div class="rmc-panel">
        <h3>See — Rust by Example</h3>
        ${concept.rbe.map((r) => `<div class="rmc-resource-row">
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

      ${concept.rustlings.length === 0 && practiceTasks.length === 0 ? '' : `<div class="rmc-panel">
        <h3>Do — Rustlings practice</h3>
        ${concept.rustlings.map((r) => resourceExerciseMarkup(concept, p, r)).join('')}
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
          ${concept.trpl[0] ? `<a href="${esc(concept.trpl[0].url)}" target="_blank" rel="noopener noreferrer">Review TRPL</a>` : ''}
          ${concept.rbe[0] ? `<span class="arrow">→</span><a href="${esc(concept.rbe[0].url)}" target="_blank" rel="noopener noreferrer">Review RBE</a>` : ''}
          ${concept.rustlings[0] ? `<span class="arrow">→</span><a href="${esc(concept.rustlings[0].url)}" target="_blank" rel="noopener noreferrer">Redo ${esc(concept.rustlings[0].name)}</a>` : ''}
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
    return concepts
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
    if (!VALID_VIEWS.includes(ui.view)) ui.view = 'roadmap';
    if (ui.selectedConceptId !== null && !isValidConceptId(ui.selectedConceptId)) ui.selectedConceptId = null;
    if (ui.view === 'block' && !ui.selectedConceptId) ui.view = 'roadmap';
    if (typeof ui.menuOpen !== 'boolean') ui.menuOpen = false;
    if (document.body) document.body.style.overflow = ui.menuOpen ? 'hidden' : '';
    ensureSidebarExpanded();
    const { byId, statusMap } = derived();
    root.innerHTML = `<div class="rmc-app">`
      + MobileBar()
      + Sidebar(ui.view, ui.selectedConceptId, statusMap)
      + renderScrim()
      + `<main class="rmc-main">${mainContent(statusMap, byId)}</main>`
      + `</div>`;
    bindEvents();
  }

  function openConcept(id) {
    if (!isValidConceptId(id)) return;
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
      saveState();
    } else {
      // Keep last-active tracking without mutating status.
      state = { ...state, lastActiveConceptId: id };
      saveState();
    }
    render();
  }

  // ---------- Global event delegation (attached once, survives re-renders) ----------
  let eventsBound = false;

  function dispatchClick(action, el) {
    if (action === 'toggle-theme') {
      applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
      render();
      return;
    }

    if (action === 'toggle-menu') {
      const opening = !ui.menuOpen;
      ui.menuOpen = opening;
      render();

      if (opening) {
        const first = root.querySelector('#rmc-sidebar button');
        if (first) first.focus();
      } else {
        const btn = root.querySelector('[data-action="toggle-menu"]');
        if (btn) btn.focus();
      }
    }

    if (action === 'set-view') {
      const v = el.dataset.view;
      if (!VALID_VIEWS.includes(v)) return;
      ui.view = v;
      if (ui.view !== 'block') ui.selectedConceptId = null;
      ui.menuOpen = false;
      render();
    }

    if (action === 'toggle-sidebar-module') {
      toggleSidebarModule(el.dataset.module);
      render();
      return;
    }

    if (action === 'toggle-module') {
      toggleRoadmapModule(el.dataset.module);
      render();
      return;
    }

    if (action === 'open-concept') {
      if (!isValidConceptId(el.dataset.concept)) return;
      ui.menuOpen = false;
      openConcept(el.dataset.concept);
    }

    if (action === 'show-checkpoint') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      ui.checkpoint[id] = { ...(ui.checkpoint[id] || {}), show: true };
      render();
    }

    if (action === 'retake-checkpoint') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      ui.checkpoint[id] = { show: true, answers: {}, outcome: null };
      render();
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
      render();
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
      if (!maybeFinishQuiz(id)) render();
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
      if (!maybeFinishQuiz(id)) render();
    }

    if (action === 'review-mark') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;

      // Idempotency guard: ignore duplicate clicks if already rescheduled into the future
      const pCheck = getProgress(state, id);
      if (pCheck.review && Number.isFinite(pCheck.review.nextReviewAt) && Date.now() < pCheck.review.nextReviewAt) return;

      const gotIt = el.dataset.gotIt === 'true';
      const now = Date.now();
      setState((s) => {
        const p = getProgress(s, id);
        const prevReps = p.review && Number.isFinite(p.review.repetitions) && p.review.repetitions >= 0
          ? Math.floor(p.review.repetitions) : 0;
        const prevInterval = p.review && Number.isFinite(p.review.intervalDays) && p.review.intervalDays >= 1
          ? Math.floor(p.review.intervalDays) : REVIEW_FIRST_INTERVAL_DAYS;
        // SRS ladder [1,3,7,14,30,60]: success advances, failure resets to a
        // 1-day interval due tomorrow. Self-rating dots are never touched here.
        const intervalDays = gotIt ? nextIntervalDays(prevInterval) : 1;
        const repetitions = gotIt ? prevReps + 1 : 0;
        return {
          ...s,
          progress: {
            ...s.progress,
            [id]: {
              ...p,
              review: { nextReviewAt: now + intervalDays * DAY_MS, intervalDays, repetitions },
            },
          },
          reviewLog: gotIt ? { ...s.reviewLog, [id]: now } : s.reviewLog,
        };
      });
      if (!gotIt) openConcept(id);
    }

    if (action === 'open-resource') {
      const id = el.dataset.concept;
      if (!isValidConceptId(id)) return;
      markInProgress(id);
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
      render();
    }
  });

  // Mobile drawer keyboard behavior: Escape closes it (and returns focus to
  // the toggle button); Tab is trapped inside it while open.
  document.addEventListener('keydown', (e) => {
    if (!ui.menuOpen) return;
    if (e.key === 'Escape') {
      ui.menuOpen = false;
      render();
      const btn = root.querySelector('[data-action="toggle-menu"]');
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
  (function syncDrawerOnViewportChange() {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => {
      ui.menuOpen = false;
      render();
    };
    if (mq && typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (mq && typeof mq.addListener === 'function') mq.addListener(onChange);
  })();

  initTheme();
  render();
})();
