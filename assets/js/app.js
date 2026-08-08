/*
 * CYBERPATH — application
 * Progressive enhancement: the static reference works with no JS. When this
 * boots, it enhances the page into an interactive planner and generates a
 * personalised, printable roadmap. No dependencies, no build step.
 */
(function () {
  'use strict';

  var DATA = window.CYBERPATH_DATA;
  if (!DATA) return; // data.js failed to load → static fallback stays visible

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var byId = function (id) { return document.getElementById(id); };

  /* Stroke icon set (feather-style) — replaces emoji for a crafted, professional look.
   * Monochrome, inherits currentColor, 1.75 stroke, rounded joins. */
  var ICON_PATHS = {
    download: '<path d="M12 4v10m0 0l-4-4m4 4l4-4"/><path d="M5 20h14"/>',
    file: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l2.5-2.5a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-2.5 2.5a4 4 0 0 0 5.66 5.66l1-1"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    rotate: '<path d="M4.5 12a7.5 7.5 0 1 1 2.4 5.5"/><path d="M4 19v-5h5"/>',
    flag: '<path d="M6 21V4"/><path d="M6 4h11l-2 3.2L17 10H6"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4a6.2 6.2 0 0 0 9.5 9.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
  };
  function icon(name) {
    return '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (ICON_PATHS[name] || '') + '</svg>';
  }
  var prefersReduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Persistence: last plan (so returning shows your roadmap) + per-phase progress. */
  var PLAN_KEY = 'cyberpath-plan-v1';
  var PROGRESS_KEY = 'cyberpath-progress-v1';
  function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function removeKey(k) { try { localStorage.removeItem(k); } catch (e) {} }
  // Progress is keyed only by answers that change WHICH phases exist (not duration/cost),
  // so the in-result "tweak" selects (time/budget) never wipe your checkmarks (BUG-2).
  var PROGRESS_EXCLUDE = { hours: 1, budget: 1, deadline: 1, style: 1 };
  function progressSig(a) {
    return QUESTIONS.filter(function (q) { return !PROGRESS_EXCLUDE[q.id]; }).map(function (q) {
      var v = a[q.id];
      if (q.type === 'checkbox') v = (Array.isArray(v) ? v.slice().sort() : []).join('+');
      return v == null ? '' : v;
    }).join('|');
  }
  function getProgress(sig) { var all = loadJSON(PROGRESS_KEY) || {}; return all[sig] || {}; }
  function setPhaseDone(sig, id, done) {
    var all = loadJSON(PROGRESS_KEY) || {}; all[sig] = all[sig] || {};
    if (done) all[sig][id] = 1; else delete all[sig][id];
    saveJSON(PROGRESS_KEY, all);
  }

  /* ----------------------------------------------------------------
   * THEME
   * ---------------------------------------------------------------- */
  var THEME_KEY = 'cyberpath-theme';
  var root = document.documentElement;
  var toggle = byId('theme-toggle');

  function systemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  function currentTheme() {
    return root.getAttribute('data-theme') || systemTheme();
  }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (!toggle) return; // theming still works via the attribute; just no button to sync
    var isLight = t === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    $('.theme-toggle__label', toggle).textContent = isLight ? 'Light' : 'Dark';
    $('.theme-toggle__icon', toggle).innerHTML = isLight ? icon('sun') : icon('moon');
  }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved || systemTheme());
  } catch (e) { applyTheme(systemTheme()); }

  if (toggle) toggle.addEventListener('click', function () {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  // Follow the OS theme when the user has NOT made an explicit choice.
  if (window.matchMedia) {
    var mqLight = window.matchMedia('(prefers-color-scheme: light)');
    var onSys = function (e) {
      var pref = null; try { pref = localStorage.getItem(THEME_KEY); } catch (_) {}
      if (!pref) applyTheme(e.matches ? 'light' : 'dark');
    };
    if (mqLight.addEventListener) mqLight.addEventListener('change', onSys);
    else if (mqLight.addListener) mqLight.addListener(onSys);
  }

  /* ----------------------------------------------------------------
   * STATIC "browse" grid (JS-on) built from the same data
   * ---------------------------------------------------------------- */
  (function renderStaticTracks() {
    var host = byId('static-tracks');
    if (!host) return;
    var order = ['offensive', 'defensive', 'grc', 'cloud', 'appsec', 'dfir'];
    host.innerHTML = order.map(function (key) {
      var t = DATA.TRACKS[key];
      var certs = t.phases.reduce(function (acc, p) { return acc.concat(p.certs || []); }, [])
        .concat(t.advancedCerts || []);
      var certNames = certs.map(function (c) { return c.name; }).slice(0, 5).join(' → ');
      return '<article class="static-card"><h3>' + esc(t.name) + '</h3>' +
        '<p>' + esc(t.tagline) + '</p>' +
        '<p><strong>Roles:</strong> ' + esc(t.roles.join(', ')) + '</p>' +
        (certNames ? '<p><strong>Certs:</strong> ' + esc(certNames) + '</p>' : '') +
        '</article>';
    }).join('');

    var note = byId('static-note');
    if (note) { note.textContent = 'Prefer to skim first? Here are the six tracks. Use “Build my roadmap” for a plan tailored to you.'; note.hidden = false; }
    var heading = byId('static-heading');
    if (heading) heading.textContent = 'Or browse the six tracks';
  })();

  /* ----------------------------------------------------------------
   * WIZARD
   * ---------------------------------------------------------------- */
  var QUESTIONS = DATA.QUESTIONS;
  var answers = {};
  var stepIndex = 0;

  var els = {
    hero: byId('hero'),
    wizard: byId('wizard'),
    result: byId('result'),
    steps: byId('steps'),
    form: byId('quiz-form'),
    back: byId('back-btn'),
    next: byId('next-btn'),
    generate: byId('generate-btn'),
    bar: byId('progress-bar'),
    stepNow: byId('step-now'),
    stepTotal: byId('step-total'),
    progress: $('.progress'),
    error: byId('step-error'),
    start: byId('start-btn'),
    static: byId('tracks-static'),
  };

  els.stepTotal.textContent = QUESTIONS.length;
  els.progress.setAttribute('aria-valuemax', String(QUESTIONS.length));

  // Build all steps once
  els.steps.innerHTML = QUESTIONS.map(function (q, i) {
    var opts = q.options.map(function (o) {
      var type = q.type === 'checkbox' ? 'checkbox' : 'radio';
      var name = q.type === 'checkbox' ? q.id + '[]' : q.id;
      var id = q.id + '-' + o.value;
      return '<label class="option" for="' + id + '">' +
        '<input type="' + type + '" name="' + esc(name) + '" id="' + esc(id) + '" value="' + esc(o.value) + '">' +
        '<span class="option__body">' +
          '<span class="option__label">' + esc(o.label) + '</span>' +
          '<span class="option__desc">' + esc(o.desc) + '</span>' +
        '</span></label>';
    }).join('');
    return '<fieldset class="step" data-step="' + i + '" data-type="' + q.type + '"' + (i === 0 ? '' : ' hidden') + '>' +
      '<legend class="step__legend" tabindex="-1">' + esc(q.legend) + '</legend>' +
      '<p class="step__help">' + esc(q.help) + '</p>' +
      '<div class="options">' + opts + '</div>' +
      '</fieldset>';
  }).join('');

  var stepEls = Array.prototype.slice.call(els.steps.querySelectorAll('.step'));

  function showView(view) {
    // Single source of truth for which of hero / wizard / result is on screen.
    els.hero.hidden = view !== 'hero';
    els.wizard.hidden = view !== 'wizard';
    els.result.hidden = view !== 'result';
    if (els.static) els.static.hidden = view !== 'hero'; // browse grid only makes sense on the landing view
  }

  function startWizard() {
    showView('wizard');
    stepIndex = 0;
    showStep(0, true);
    els.wizard.scrollIntoView({ block: 'start' });
  }
  els.start.addEventListener('click', startWizard);

  // ONE delegated listener on the (persistent) result section — handles per-phase
  // progress checkboxes and the "regenerate with tweaks" selects without accumulating.
  els.result.addEventListener('change', function (e) {
    var el = e.target;
    if (el && el.classList && el.classList.contains('phase__check')) {
      setPhaseDone(progressSig(answers), el.getAttribute('data-phase'), el.checked);
      updateCompletion();
    } else if (el && el.matches && el.matches('select[data-tweak]')) {
      var k = el.getAttribute('data-tweak');
      if (answers[k] === el.value) return;
      answers[k] = el.value;
      generate(true, { keepView: true });
      var again = els.result.querySelector('select[data-tweak="' + k + '"]');
      if (again) again.focus();
      setStatus('Plan updated: ' + k + ' → ' + ((LABELS[k] && LABELS[k][el.value]) || el.value) + '.');
    }
  });

  // Reopen the wizard WITHOUT clearing answers, so the learner can tweak and regenerate.
  function editAnswers() {
    QUESTIONS.forEach(function (q) {
      var v = answers[q.id];
      if (q.type === 'checkbox') (v || []).forEach(function (x) { var el = byId(q.id + '-' + x); if (el) el.checked = true; });
      else { var el = byId(q.id + '-' + v); if (el) el.checked = true; }
    });
    showView('wizard');
    stepIndex = 0;
    showStep(0, true);
    els.wizard.scrollIntoView({ block: 'start' });
  }

  // A question is active unless its showIf(answers) predicate says otherwise. This is
  // what lets the aptitude block appear only on the "I'm not sure yet" path.
  function isActive(i) { var q = QUESTIONS[i]; return !q.showIf || !!q.showIf(answers); }
  function activeIndices() { var r = []; for (var i = 0; i < QUESTIONS.length; i++) if (isActive(i)) r.push(i); return r; }
  function nextActive(i) { for (var j = i + 1; j < QUESTIONS.length; j++) if (isActive(j)) return j; return -1; }
  function prevActive(i) { for (var j = i - 1; j >= 0; j--) if (isActive(j)) return j; return -1; }

  function showStep(i, focus) {
    stepEls.forEach(function (s, idx) { s.hidden = idx !== i; });
    var active = stepEls[i];
    // Restart the entrance animation without a synchronous layout flush.
    if (!prefersReduce) {
      active.classList.remove('step-enter');
      requestAnimationFrame(function () { requestAnimationFrame(function () { active.classList.add('step-enter'); }); });
    }

    var act = activeIndices();
    var pos = act.indexOf(i); if (pos < 0) pos = 0;
    var total = act.length;
    els.stepNow.textContent = pos + 1;
    els.stepTotal.textContent = total;
    els.bar.style.width = ((pos + 1) / total) * 100 + '%';
    els.progress.setAttribute('aria-valuemax', String(total));
    els.progress.setAttribute('aria-valuenow', String(pos + 1));
    els.progress.setAttribute('aria-valuetext', 'Step ' + (pos + 1) + ' of ' + total);

    els.back.hidden = pos === 0;
    var last = pos === total - 1;
    els.next.hidden = last;
    els.generate.hidden = !last;
    els.error.textContent = '';

    if (focus) { $('.step__legend', active).focus(); }
    updateLean();
  }

  function readStep(i) {
    var q = QUESTIONS[i];
    var fs = stepEls[i];
    if (q.type === 'checkbox') {
      return Array.prototype.slice.call(fs.querySelectorAll('input:checked')).map(function (n) { return n.value; });
    }
    var picked = fs.querySelector('input:checked');
    return picked ? picked.value : null;
  }

  function validateStep(i) {
    var q = QUESTIONS[i];
    if (q.type === 'checkbox') return true; // "select any" — none is valid
    if (!readStep(i)) {
      els.error.textContent = 'Please choose one option to continue.';
      var first = stepEls[i].querySelector('input');
      if (first) first.focus();
      return false;
    }
    return true;
  }

  function commitStep(i) { answers[QUESTIONS[i].id] = readStep(i); }

  els.next.addEventListener('click', function () {
    if (!validateStep(stepIndex)) return;
    commitStep(stepIndex); // commit BEFORE computing the next active step (goal drives showIf)
    var nx = nextActive(stepIndex);
    if (nx !== -1) { stepIndex = nx; showStep(stepIndex, true); }
  });
  els.back.addEventListener('click', function () {
    commitStep(stepIndex);
    var pv = prevActive(stepIndex);
    if (pv !== -1) { stepIndex = pv; showStep(stepIndex, true); }
  });

  // Clear the validation error the moment a choice is made. We deliberately do NOT
  // auto-advance — keyboard and screen-reader users must keep control of pacing.
  els.steps.addEventListener('change', function (e) {
    if (e.target && (e.target.type === 'radio' || e.target.type === 'checkbox')) { els.error.textContent = ''; updateLean(); }
  });

  // Live "leaning toward X" readout — shows the recommender working, in real time,
  // as the learner answers the aptitude questions on the "I'm not sure yet" path.
  function updateLean() {
    var lean = byId('wizard-lean');
    if (!lean || !window.CYBERPATH_MATCH) return;
    var q = QUESTIONS[stepIndex];
    var goalVal = answers.goal || (q.id === 'goal' ? readStep(stepIndex) : null);
    if (goalVal !== 'unsure') { lean.hidden = true; return; }
    var temp = {}; for (var k in answers) temp[k] = answers[k];
    if (q.id.indexOf('apt_') === 0) { var v = readStep(stepIndex); if (v) temp[q.id] = v; }
    var hasApt = Object.keys(temp).some(function (k) { return k.indexOf('apt_') === 0 && temp[k]; });
    if (!hasApt) { lean.hidden = true; return; }
    var ranked = window.CYBERPATH_MATCH.scoreTracks(temp);
    var top = ranked[0];
    var name = DATA.TRACKS[top.track] ? DATA.TRACKS[top.track].short : top.track;
    lean.hidden = false;
    lean.innerHTML = '<span class="wizard__lean-k">Leaning toward</span> <strong>' + esc(name) + '</strong> <span class="wizard__lean-pct">' + top.confidencePct + '% fit</span>';
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var act = activeIndices();
    var isLast = stepIndex === act[act.length - 1];
    // Enter on an earlier step must ADVANCE, never generate a half-filled plan (B1).
    if (!isLast) {
      if (validateStep(stepIndex)) { commitStep(stepIndex); var nx = nextActive(stepIndex); if (nx !== -1) { stepIndex = nx; showStep(stepIndex, true); } }
      return;
    }
    if (!validateStep(stepIndex)) return;
    commitStep(stepIndex);
    generate(true);
  });

  // Build + render the plan. When `pushHash` is true we also encode the answers into
  // the URL so the plan is bookmarkable/shareable.
  function generate(pushHash, opts) {
    var plan = buildPlan(answers);
    renderPlan(plan, opts || {});
    saveJSON(PLAN_KEY, answers); // remember so a return visit restores this roadmap
    if (pushHash) updateHash(answers);
  }

  // On a return visit (no share-link in the URL), bring the learner back to their plan.
  function restoreLastPlan() {
    var a = loadJSON(PLAN_KEY);
    if (!a || !validState(a)) return false;
    answers = a;
    generate(false);
    updateHash(answers); // BUG-1: so "Copy link" on a return visit shares a real #plan= URL
    return true;
  }

  /* ---- Shareable state (URL hash) ----
   * v2 is a versioned, KEY-based encoding (id-value tokens) so adding/reordering
   * questions can never silently corrupt an old link. The legacy positional decoder
   * is kept as a fallback so links from before v2 still resolve. */
  var STATE_V = '2';
  function encodeState(a) {
    return STATE_V + '!' + QUESTIONS.map(function (q) {
      if (q.showIf && !q.showIf(a)) return null; // don't encode inactive (e.g. stale apt_*) answers
      var v = a[q.id];
      if (v == null || v === '') return null;
      if (q.type === 'checkbox') { if (!v.length) return null; v = v.join('.'); }
      return q.id + '-' + encodeURIComponent(v);
    }).filter(Boolean).join('~');
  }
  function decodeState(str) {
    str = String(str);
    var bang = str.indexOf('!');
    if (bang > -1 && str.slice(0, bang) === STATE_V) {
      var a = {};
      str.slice(bang + 1).split('~').forEach(function (tok) {
        var dash = tok.indexOf('-'); if (dash < 0) return;   // question ids contain no '-'
        var id = tok.slice(0, dash), raw = decodeURIComponent(tok.slice(dash + 1));
        var q = null; QUESTIONS.some(function (x) { if (x.id === id) { q = x; return true; } });
        if (!q) return;                                       // unknown id (future version) → skip, don't corrupt
        a[id] = q.type === 'checkbox' ? (raw ? raw.split('.') : []) : raw;
      });
      return a;
    }
    return decodeLegacy(str);
  }
  // Pre-v2 links: '~'-joined positional values (with a shim for the pre-aptitude layout).
  function decodeLegacy(str) {
    var parts = String(str).split('~'), a = {};
    var nonApt = QUESTIONS.filter(function (q) { return q.id.indexOf('apt_') !== 0; });
    var mapQs = (parts.length === nonApt.length) ? nonApt : QUESTIONS;
    mapQs.forEach(function (q, i) {
      var raw = decodeURIComponent(parts[i] || '');
      a[q.id] = q.type === 'checkbox' ? (raw ? raw.split('+') : []) : raw;
    });
    return a;
  }
  function validState(a) {
    if (!a || typeof a !== 'object') return false;
    return QUESTIONS.every(function (q) {
      if (q.showIf && !q.showIf(a)) return true;   // inactive for this answer set → ignore
      if (q.type === 'checkbox') {                  // must be absent or an array of valid values
        var v = a[q.id];
        if (v == null) return true;
        return Array.isArray(v) && v.every(function (x) { return q.options.some(function (o) { return o.value === x; }); });
      }
      return q.options.some(function (o) { return o.value === a[q.id]; });
    });
  }
  function updateHash(a) {
    try { history.replaceState(null, '', '#plan=' + encodeState(a)); } catch (e) {}
  }
  function restoreFromHash() {
    var h = location.hash || '';
    if (h.indexOf('#plan=') !== 0) return false;
    try {
      var a = decodeState(h.slice('#plan='.length));
      if (!validState(a)) return false;
      answers = a;
      generate(false);
      return true;
    } catch (e) { return false; }
  }

  /* ----------------------------------------------------------------
   * ENGINE — assemble & scale the plan
   * ---------------------------------------------------------------- */
  var EXP_TRACK = { none: 1, it: 0.9, 'some-sec': 0.75, pro: 0.6 };
  // No `pro` entry: a "working in tech/security" learner drops the generic
  // foundations entirely (handled in the filter below), so it's never scaled here.
  var EXP_FOUND = { none: 1, it: 0.85, 'some-sec': 0.7 };
  var WEEKS_PER_MONTH = 4.345;

  function buildPlan(a) {
    // Recommender: infer best-fit track from aptitude answers (behavioural model).
    var MATCH = window.CYBERPATH_MATCH;
    var recommendation = null;
    if (MATCH) {
      var ranked = MATCH.scoreTracks(a);
      recommendation = { ranked: ranked, top: ranked[0], closeCall: MATCH.detectCloseCall(ranked) };
    }

    var trackKey = a.goal === 'unsure' ? null : a.goal;
    // "I'm not sure yet" → let the recommender pick the top-matching track for a REAL plan.
    if (a.goal === 'unsure' && recommendation) trackKey = recommendation.top.track;
    var track = trackKey ? DATA.TRACKS[trackKey] : null;
    var hours = Number(a.hours) || 8;
    // Sub-linear: doubling weekly hours doesn't halve calendar time (fatigue, spacing).
    // Baseline is 10h/week (factor 1); clamp the extremes so estimates stay believable.
    var hoursFactor = Math.min(2.6, Math.max(0.55, Math.pow(10 / hours, 0.8)));
    var bg = Array.isArray(a.background) ? a.background.slice() : []; // coerce (poisoned state safety)
    var exp = a.experience || 'none';
    // System administrators live in the shell and manage OSes, so credit them the
    // Linux foundation (otherwise the "sysadmin" answer would trim nothing).
    if (bg.indexOf('sysadmin') !== -1 && bg.indexOf('linux') === -1) bg.push('linux');

    // 1) Foundations (dropped where already covered)
    var foundations = DATA.FOUNDATIONS.filter(function (f) {
      if (exp === 'pro') return false;               // already working in tech/security
      if (f.skipIfExperienced && (exp === 'some-sec')) return false;
      if (f.skill && bg.indexOf(f.skill) !== -1) return false;
      return true;
    });

    // 2) Track phases (or the explore phase for "not sure")
    var trackPhases;
    if (!track) {
      trackPhases = [DATA.EXPLORE_PHASE];
    } else {
      trackPhases = track.phases.filter(function (p) {
        if (a.appetite === 'hobby') return p.tier === 'core' || p.tier === 'specialization';
        return true;
      });
    }

    // 3) Scale durations
    var allPhases = foundations.concat(trackPhases).map(function (p) {
      var isFound = p.tier === 'foundation';
      var factor = isFound ? (EXP_FOUND[exp] || 1) : (EXP_TRACK[exp] || 1);
      var weeks = Math.max(1, Math.round(p.weeks * hoursFactor * factor));
      return { def: p, weeks: weeks };
    });

    var totalWeeks = allPhases.reduce(function (s, p) { return s + p.weeks; }, 0);

    // 4) Certification ladder — built from the phases actually in THIS plan, so a
    //    beginner's foundation certs (ISC2 CC, Security+) show, while a pro who skips
    //    foundations doesn't see them. Optional foundation certs are excluded.
    var ladder = [];
    if (track && a.appetite !== 'hobby') {
      var wanted = a.appetite === 'advanced' ? ['entry', 'core', 'advanced'] : ['entry', 'core'];
      allPhases.forEach(function (p) {
        (p.def.certs || []).forEach(function (c) {
          if (!c.optional && wanted.indexOf(c.level) !== -1) ladder.push(c);
        });
      });
      if (a.appetite === 'advanced') {
        (track.advancedCerts || []).forEach(function (c) { ladder.push(c); });
      }
    }
    // de-dup by name
    var seen = {};
    ladder = ladder.filter(function (c) { if (seen[c.name]) return false; seen[c.name] = 1; return true; });

    // Rough exam-fee estimate from the tier bands (never exact — verify current prices).
    var TIER_COST = { free: [0, 0], low: [100, 300], mid: [300, 800], high: [800, 2000] };
    var costLo = 0, costHi = 0;
    ladder.forEach(function (c) { var r = TIER_COST[c.tier.key] || [0, 0]; costLo += r[0]; costHi += r[1]; });

    return {
      answers: a, track: track, trackKey: trackKey, isExplore: !track,
      matched: a.goal === 'unsure' && !!track, // track was inferred, not chosen
      recommendation: recommendation,
      phases: allPhases, totalWeeks: totalWeeks,
      months: totalWeeks / WEEKS_PER_MONTH,
      ladder: ladder, hours: hours,
      costLo: costLo, costHi: costHi,
    };
  }

  /* ----------------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------------- */
  var LABELS = {
    experience: { none: 'Complete beginner', it: 'Some IT background', 'some-sec': 'Some security exposure', pro: 'Working in tech/security' },
    hours: { '3': '1–5h/week', '8': '5–10h/week', '15': '10–20h/week', '25': '20h+/week' },
    budget: { free: 'Free only', mixed: 'Mostly free', paid: 'Willing to invest' },
    appetite: { hobby: 'Hobby / interest', entry: 'First security job', advanced: 'Advance & specialise' },
    deadline: { '3': 'Within 3 months', '6': 'Within 6 months', '12': 'Within a year', '0': 'No deadline' },
    style: { hands: 'Hands-on labs', structured: 'Structured courses', reading: 'Reading & docs', balanced: 'A mix' },
  };

  // Study-method guidance, keyed to the learner's chosen style.
  var STYLE_TIPS = {
    hands: 'You learn by doing, so live in the labs: for every concept, immediately break or defend something. Lead with the hands-on platforms in each phase (TryHackMe, Hack The Box, PortSwigger, CyberDefenders) and only read theory when you hit a wall.',
    structured: 'You do best with a guided path, so anchor each phase to one structured course and finish it before moving on. Use the video/course resources as your spine and the labs to cement each module.',
    reading: 'You prefer to read, so build each phase around the documentation and books listed, then prove your understanding with one or two labs. Keep a written notebook — teaching it back is your fastest feedback loop.',
    balanced: 'You like variety, so rotate: watch or read to understand a topic, then immediately practise it in a lab, then write a short note. That watch → do → explain loop is the most reliable way to retain security skills.',
  };

  function fmtDuration(weeks) {
    if (weeks < 4) return weeks + (weeks === 1 ? ' week' : ' weeks');
    var mo = weeks / WEEKS_PER_MONTH;
    var moTxt = mo < 1.5 ? '~1 month' : '~' + Math.round(mo) + ' months';
    return weeks + ' wks · ' + moTxt;
  }
  function fmtTotal(months) {
    // Very short plans read better in weeks; guarantee a sane, non-inverted range.
    if (months < 1.4) {
      var wk = Math.max(1, Math.round(months * WEEKS_PER_MONTH));
      return '~' + wk + (wk === 1 ? ' week' : ' weeks');
    }
    var lo = Math.max(1, Math.round(months * 0.9));
    var hi = Math.max(lo, Math.round(months * 1.15));
    if (lo === hi) return '~' + lo + (lo === 1 ? ' month' : ' months');
    return lo + '–' + hi + ' months';
  }

  var NEW_TAB = '<span class="visually-hidden"> (opens in a new tab)</span>';

  function resourceList(items) {
    return items.map(function (r) {
      return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.name) + NEW_TAB + '</a>' +
        (r.note ? '<span class="res-note">' + esc(r.note) + '</span>' : '') + '</li>';
    }).join('');
  }

  function certRow(c) {
    var t = c.tier;
    return '<li class="cert">' +
      '<span class="cert__name"><a href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer">' + esc(c.name) + NEW_TAB + '</a></span>' +
      (c.optional
        ? '<span class="cert__lvl">optional</span>'
        : (c.level ? '<span class="cert__lvl">' + esc(c.level) + '</span>' : '')) +
      '<span class="tier" data-tier="' + esc(t.key) + '" aria-label="Cost tier: ' + esc(t.label) + ' — ' + esc(t.hint) + '">' + esc(t.label) + '</span>' +
      '</li>';
  }

  function renderPhase(p, idx, opts) {
    var def = p.def;
    var budget = opts.budget, style = opts.style, appetite = opts.appetite, shown = opts.shown;
    var showPaid = budget !== 'free';
    var free = (def.free || []).slice();
    var paid = showPaid ? (def.paid || []).slice() : [];
    // Structured learners lead with guided courses; everyone else leads with free/hands-on.
    var resources = (style === 'structured' && paid.length) ? paid.concat(free) : free.concat(paid);

    // Hobby learners aren't chasing certs; and never show the same cert twice across phases.
    var certs = (appetite === 'hobby') ? [] : (def.certs || []).filter(function (c) {
      if (shown[c.name]) return false; shown[c.name] = 1; return true;
    });

    var tierLabel = { foundation: 'Foundation', core: 'Core skills', specialization: 'Specialisation', certification: 'Certification', career: 'Career launch' }[def.tier] || def.tier;
    var emptyMsg = budget === 'free'
      ? 'These exams charge a fee. Build the skills for free using the earlier phases, then treat a paid exam as an optional next step — the one no-cost credential is ISC2 CC.'
      : 'This phase is the exam itself. Prepare with the resources from earlier phases, then book a certification below.';

    var done = opts.progress && opts.progress[def.id];
    return '<article class="phase" data-tier="' + esc(def.tier) + '">' +
      '<div class="phase__top">' +
        '<div><span class="phase__idx">PHASE ' + (idx + 1) + '</span> ' +
          '<span class="phase__badge">' + esc(tierLabel) + '</span>' +
          '<h3 class="phase__name">' + esc(def.name) + '</h3></div>' +
        '<div class="phase__meta">' +
          '<span class="phase__dur">' + esc(fmtDuration(p.weeks)) + '</span>' +
          '<label class="phase__check-label"><input type="checkbox" class="phase__check" data-phase="' + esc(def.id) + '"' + (done ? ' checked' : '') + '> Done</label>' +
        '</div>' +
      '</div>' +
      '<p class="phase__focus">' + esc(def.focus) + '</p>' +
      (opts.prevName ? '<p class="phase__prereq"><span aria-hidden="true">↳</span> Builds on: <strong>' + esc(opts.prevName) + '</strong></p>' : '') +
      '<div class="phase__grid">' +
        '<div class="phase__block"><h4>What you’ll learn</h4><ul class="phase__list">' +
          def.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="phase__block"><h4>' + (showPaid ? 'Resources' : 'Free resources') + '</h4>' +
          (resources.length
            ? '<ul class="phase__list res-list">' + resourceList(resources) + '</ul>'
            : '<p class="phase__focus">' + emptyMsg + '</p>') +
        '</div>' +
      '</div>' +
      (certs.length ? '<div class="certs-box"><h4>Target certification(s)</h4><ul class="cert-list">' +
        certs.map(certRow).join('') + '</ul></div>' : '') +
      '</article>';
  }

  // Compares the plan's estimated length against the learner's target date and
  // gives an honest, actionable verdict (the whole point of asking for a deadline).
  function deadlineCheck(plan) {
    if (plan.isExplore) return ''; // a sampler has no "job-ready" date to check
    var target = Number(plan.answers.deadline);
    if (!target) return ''; // "no deadline" → nothing to check
    var months = plan.months;
    // Compare the pessimistic end of the band we actually display, so the verdict
    // can never claim "on track" while printing a range that exceeds the target.
    var hi = Math.max(1, Math.round(months * 1.15));
    if (hi <= target) {
      return '<div class="callout callout--ok">' +
        '<strong>On track.</strong> At ' + esc(String(plan.hours)) + ' hours a week, your plan lands around ' +
        esc(fmtTotal(months)) + ' — inside your ' + target + '-month target. Keep the pace steady and you’ll make it.</div>';
    }
    // Not enough time at current pace → compute the hours it would actually take.
    // hoursFactor is sub-linear (pow 0.8), so hours scale ~ (months/target)^1.25.
    var neededHours = Math.ceil(plan.hours * Math.pow(months / target, 1.25));
    var advice;
    if (neededHours <= 40) {
      advice = 'To hit ' + target + ' months you’d need roughly <strong>' + neededHours + ' hours a week</strong>. ' +
        'If that’s not realistic, either extend your target or narrow the scope (e.g. aim for one entry certification first).';
    } else {
      advice = 'Reaching ' + target + ' months from here would take an unrealistic ~' + neededHours + ' hours a week. ' +
        'A ' + target + '-month goal is very ambitious for your starting point — consider extending to ' + hi +
        ' months, or focus on a single entry-level certification and role first.';
    }
    return '<div class="callout callout--warn">' +
      '<strong>Heads-up on your deadline.</strong> Your plan estimates about ' + esc(fmtTotal(months)) +
      ' at ' + esc(String(plan.hours)) + ' h/week, which is longer than your ' + target + '-month target. ' + advice + '</div>';
  }

  // Colour key for the timeline nodes (only the tiers actually present).
  function tierLegend(phases) {
    var present = {}; phases.forEach(function (p) { present[p.def.tier] = 1; });
    var labels = { foundation: 'Foundations', core: 'Core skills', specialization: 'Specialisation', certification: 'Certification', career: 'Career launch' };
    var order = ['foundation', 'core', 'specialization', 'certification', 'career'];
    var items = order.filter(function (t) { return present[t]; })
      .map(function (t) { return '<li data-tier="' + t + '">' + esc(labels[t]) + '</li>'; }).join('');
    return items ? '<ul class="tier-legend" aria-label="Timeline colour key">' + items + '</ul>' : '';
  }

  // "We matched you to X" banner — shown when the track was inferred (goal = unsure).
  function matchCallout(plan) {
    if (!plan.matched || !plan.recommendation || !window.CYBERPATH_MATCH) return '';
    var r = plan.recommendation, top = r.top;
    var why = window.CYBERPATH_MATCH.explainMatch(top.track, plan.answers);
    var html = '<div class="callout callout--match"><strong>We matched you to ' + esc(plan.track.name) +
      ' <span class="match__pct">' + top.confidencePct + '% fit</span>.</strong> ' + esc(why);
    if (r.closeCall && r.closeCall.close && r.ranked[1]) {
      var second = r.ranked[1];
      var secondName = DATA.TRACKS[second.track] ? DATA.TRACKS[second.track].name : second.track;
      html += ' It’s close, though — your answers also fit <strong>' + esc(secondName) + '</strong> (' + second.confidencePct + '%). Worth sampling both before you commit.';
    }
    html += ' Not feeling it? Use <strong>Edit answers</strong> to pick a track directly.';
    // a compact confidence bar for the top 3
    var bars = r.ranked.slice(0, 3).map(function (x) {
      var nm = DATA.TRACKS[x.track] ? DATA.TRACKS[x.track].short : x.track;
      return '<li><span class="match__label">' + esc(nm) + '</span>' +
        '<span class="match__track"><span class="match__fill" style="width:' + x.confidencePct + '%"></span></span>' +
        '<span class="match__val">' + x.confidencePct + '%</span></li>';
    }).join('');
    html += '<ul class="match__bars" aria-label="Top track matches">' + bars + '</ul></div>';
    return html;
  }

  // The path-network map: phases as tier-coloured nodes, with optional branch stubs and
  // milestone markers injected after the phase that earns them. A visual summary of the plan.
  function pathNetwork(plan) {
    if (plan.isExplore) return '';
    var MS = DATA.MILESTONES || [];
    var seenMs = {};
    var nodes = '';
    plan.phases.forEach(function (p, i) {
      var def = p.def;
      var tierLabel = { foundation: 'Foundation', core: 'Core', specialization: 'Specialisation', certification: 'Certification', career: 'Career' }[def.tier] || def.tier;
      var branches = (def.branches || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      nodes += '<li class="pathnet__node" data-tier="' + esc(def.tier) + '">' +
        '<span class="pathnet__dot" aria-hidden="true"></span>' +
        '<span class="pathnet__idx">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="pathnet__name">' + esc(def.name) + '</span>' +
        '<span class="pathnet__tier">' + esc(tierLabel) + '</span>' +
        (branches ? '<ul class="pathnet__branches" aria-label="Optional side-specialisations">' + branches + '</ul>' : '') +
        '</li>';
      // milestones anchored to this tier for this track (once each)
      MS.forEach(function (m, mi) {
        if (seenMs[mi]) return;
        if ((m.track === '*' || m.track === plan.trackKey) && m.tier === def.tier) {
          seenMs[mi] = 1;
          nodes += '<li class="pathnet__node pathnet__node--ms" data-kind="milestone">' +
            '<span class="pathnet__dot" aria-hidden="true"></span>' +
            '<span class="pathnet__name pathnet__name--ms"><span class="visually-hidden">Milestone: </span>' + icon('flag') + ' ' + esc(m.name) + '</span>' +
            '<span class="pathnet__ms-blurb">' + esc(m.blurb) + '</span>' +
            '</li>';
        }
      });
    });
    return '<nav class="pathnet" aria-label="Path network overview"><ol class="pathnet__spine" role="list">' + nodes + '</ol></nav>';
  }

  // "Where this path can take you next" — accurate cross-track pivots.
  function bridgesSection(plan) {
    if (plan.isExplore || !DATA.BRIDGES) return '';
    var list = DATA.BRIDGES[plan.trackKey];
    if (!list || !list.length) return '';
    var items = list.map(function (b) {
      var t = DATA.TRACKS[b.to];
      if (!t) return '';
      return '<li class="bridge"><span class="bridge__to"><span aria-hidden="true">⇄</span> ' + esc(t.name) + '</span>' +
        '<span class="bridge__why">' + esc(b.why) + '</span></li>';
    }).join('');
    return '<h2 style="margin-top:var(--sp-6)">Where this path can take you next</h2>' +
      '<p class="step__help">Cybersecurity is a network, not a ladder. These are the accurate pivots from your track — the skills genuinely overlap.</p>' +
      '<ul class="bridges">' + items + '</ul>';
  }

  // "Community & getting hired" — where to find your people, jobs, and interview prep.
  function hiringSection(plan) {
    if (plan.isExplore || !DATA.HIRING || !plan.track) return '';
    var H = DATA.HIRING, t = plan.track;
    var comms = (t.community ? [t.community] : []).concat(H.communities);
    function links(arr) {
      return arr.map(function (x) { return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.name) + NEW_TAB + '</a></li>'; }).join('');
    }
    return '<h2 style="margin-top:var(--sp-6)">Community &amp; getting hired</h2>' +
      '<div class="callout"><strong>Demand: ' + esc(t.demand || 'High') + '.</strong> ' + esc(H.salaryNote) +
        ' <a href="' + esc(H.salarySource.url) + '" target="_blank" rel="noopener noreferrer">' + esc(H.salarySource.name) + NEW_TAB + '</a></div>' +
      '<div class="hiring">' +
        '<div class="hiring__col"><h4>Communities</h4><ul class="phase__list res-list">' + links(comms) + '</ul></div>' +
        '<div class="hiring__col"><h4>Job boards</h4><ul class="phase__list res-list">' + links(H.jobBoards) + '</ul></div>' +
        '<div class="hiring__col"><h4>Interview prep</h4><ul class="phase__list res-list">' + links(H.interview) + '</ul></div>' +
      '</div>';
  }

  function budgetCallout(budget) {
    if (budget === 'free') {
      return '<div class="callout"><strong>Free path.</strong> Every phase above lists no-cost resources you can start today. ' +
        'Most certifications still charge an exam fee — the clearest genuinely-free option is <strong>ISC2 Certified in Cybersecurity (CC)</strong>. ' +
        'You can build real, hireable skill without paying; treat paid certs as an optional later investment.</div>';
    }
    if (budget === 'mixed') {
      return '<div class="callout"><strong>Balanced path.</strong> Learn on free platforms, then spend where it counts: one or two recognised certifications that hiring managers actually search for.</div>';
    }
    return '<div class="callout"><strong>Full path.</strong> You’ll see the strongest options including paid labs and premium certifications. Spend deliberately — free resources are still the best place to build fundamentals first.</div>';
  }

  var TWEAKS = [{ id: 'hours', label: 'Time' }, { id: 'budget', label: 'Budget' }, { id: 'appetite', label: 'Goal' }];
  function tweakBar(a) {
    return '<form class="tweaks" aria-label="Adjust and regenerate"><span class="tweaks__lead">Tweak &amp; regenerate:</span>' +
      TWEAKS.map(function (t) {
        var opts = QUESTIONS.filter(function (q) { return q.id === t.id; })[0].options.map(function (o) {
          return '<option value="' + esc(o.value) + '"' + (String(a[t.id]) === o.value ? ' selected' : '') + '>' + esc(LABELS[t.id][o.value] || o.value) + '</option>';
        }).join('');
        return '<label class="tweak"><span class="tweak__k">' + esc(t.label) + '</span><select data-tweak="' + esc(t.id) + '">' + opts + '</select></label>';
      }).join('') + '</form>';
  }

  function renderPlan(plan, opts) {
    opts = opts || {};
    var a = plan.answers;
    var trackName = plan.isExplore ? 'Explore & Choose Your Path' : plan.track.name;
    var tagline = plan.isExplore
      ? 'You’re not sure yet — and that’s fine. This plan builds your foundations, then guides you through sampling every track so you can commit with confidence.'
      : plan.track.tagline;
    var roles = plan.isExplore ? [] : plan.track.roles;

    var chipData = [
      ['Level', LABELS.experience[a.experience] || a.experience],
      ['Time', LABELS.hours[a.hours] || a.hours],
      ['Budget', LABELS.budget[a.budget] || a.budget],
      ['Style', LABELS.style[a.style] || a.style],
      ['Goal', LABELS.appetite[a.appetite] || a.appetite],
    ];
    if (a.deadline && a.deadline !== '0') chipData.splice(3, 0, ['Target', LABELS.deadline[a.deadline] || a.deadline]);
    if (!plan.isExplore && plan.track && plan.track.demand) chipData.push(['Demand', plan.track.demand]);
    var chips = chipData.map(function (c) {
      return '<span class="chip" data-k="' + esc(c[0]) + '">' + esc(c[0]) + ': <strong>' + esc(c[1]) + '</strong></span>';
    }).join('');

    var certCount = plan.ladder.length;
    var jobLabel = plan.isExplore ? 'to explore & choose'
      : a.appetite === 'hobby' ? 'of focused learning'
      : 'estimated to job-ready';
    var totalHours = Math.max(10, Math.round(plan.totalWeeks * plan.hours / 10) * 10);
    var stats = [
      [fmtTotal(plan.months), jobLabel, true],
      [String(plan.phases.length), plan.phases.length === 1 ? 'phase' : 'phases', false],
      ['~' + totalHours + 'h', 'total study time', false],
      [certCount ? String(certCount) : '—', certCount ? 'certifications mapped' : 'skills-first (no certs)', false],
    ].map(function (s) {
      return '<div class="stat' + (s[2] ? ' stat--lead' : '') + '"><div class="stat__num">' + esc(s[0]) + '</div><div class="stat__label">' + esc(s[1]) + '</div></div>';
    }).join('');

    var costLine = (!plan.isExplore && plan.ladder.length && a.budget !== 'free' && plan.costHi > 0)
      ? '<p class="step__help">Estimated exam fees for this ladder: <strong>~$' + plan.costLo + '–$' + plan.costHi + '</strong> — a rough band from the tiers, not a quote. Always verify current prices.</p>'
      : '';

    var ladderHtml = '';
    if (plan.ladder.length) {
      ladderHtml = '<h2 style="margin-top:var(--sp-6)">Your certification ladder</h2>' +
        '<p class="step__help">Work up this ladder in order. Tiers show relative cost, not exact price — always verify current fees.</p>' +
        costLine +
        '<ul class="cert-list cert-list--ladder">' + plan.ladder.map(certRow).join('') + '</ul>';
    } else if (!plan.isExplore) {
      ladderHtml = '<div class="callout" style="margin-top:var(--sp-6)"><strong>Skills first.</strong> You chose a hobby/interest goal, so this plan skips the certification grind. If you later want a job, use “Edit answers” and pick “Land my first security job”.</div>';
    }

    var roleHtml = roles.length
      ? '<p class="plan-head__sub"><strong>Roles this path leads to:</strong> ' + esc(roles.join(' · ')) + '</p>'
      : '';

    var shown = {}; // de-dup certs across phase boxes within this plan
    var progress = getProgress(progressSig(a)); // restore per-phase completion for this plan

    els.result.innerHTML =
      '<div class="result__inner">' +
        '<div class="plan-head">' +
          '<p class="plan-head__eyebrow" id="result-eyebrow">Your CYBERPATH roadmap</p>' +
          '<h1 class="plan-head__title" id="result-heading" tabindex="-1" aria-describedby="result-eyebrow">' + esc(trackName) + '</h1>' +
          '<p class="plan-head__sub">' + esc(tagline) + '</p>' +
          roleHtml +
          '<div class="plan-meta">' + chips + '</div>' +
        '</div>' +

        matchCallout(plan) +

        '<div class="plan-actions">' +
          '<button type="button" class="btn btn--primary" id="print-btn">' + icon('download') + ' Download as PDF</button>' +
          '<button type="button" class="btn btn--ghost" id="md-btn">' + icon('file') + ' Markdown</button>' +
          '<button type="button" class="btn btn--ghost" id="copy-btn" aria-label="Copy a shareable link to this roadmap">' + icon('link') + ' Copy link</button>' +
          '<button type="button" class="btn btn--ghost" id="edit-btn">' + icon('edit') + ' Edit answers</button>' +
          '<button type="button" class="btn btn--outline" id="restart-btn">' + icon('rotate') + ' Start over</button>' +
          '<span class="visually-hidden" id="plan-status" role="status" aria-live="polite"></span>' +
        '</div>' +

        '<div class="plan-progress" id="plan-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Roadmap completion">' +
          '<div class="plan-progress__track"><span class="plan-progress__fill" id="plan-progress-fill"></span></div>' +
          '<p class="plan-progress__text" id="plan-progress-text">Tick phases off as you finish them — your progress is saved on this device.</p>' +
        '</div>' +

        (plan.isExplore ? '' : tweakBar(a)) +

        '<div class="plan-summary">' + stats + '</div>' +

        deadlineCheck(plan) +
        budgetCallout(a.budget) +
        '<div class="callout callout--study"><strong>How to study this (' + esc(LABELS.style[a.style] || 'your way') + '):</strong> ' + esc(STYLE_TIPS[a.style] || STYLE_TIPS.balanced) + '</div>' +

        (plan.isExplore ? '' :
          '<h2 style="margin-top:var(--sp-6)">Your path network</h2>' +
          '<p class="step__help">The map of your journey — foundations feed your track, your specialisation branches into optional lanes, and flag markers call out the milestones that prove real progress.</p>' +
          tierLegend(plan.phases) +
          pathNetwork(plan)) +

        '<h2 style="margin-top:var(--sp-6)">Your step-by-step plan</h2>' +
        '<p class="step__help">Timeframes assume about ' + esc(LABELS.hours[a.hours] || (plan.hours + 'h/week')) + ' and adjust to your experience — roughly <strong>~' + totalHours + ' hours</strong> of study in total. Life happens: treat them as a compass, not a deadline.</p>' +
        '<div class="timeline">' +
          plan.phases.map(function (p, i) { return renderPhase(p, i, { budget: a.budget, style: a.style, appetite: a.appetite, shown: shown, progress: progress, prevName: i > 0 ? plan.phases[i - 1].def.name : null }); }).join('') +
        '</div>' +

        bridgesSection(plan) +

        hiringSection(plan) +

        ladderHtml +

        '<div class="callout" style="margin-top:var(--sp-6)">' +
          '<strong>Reminder:</strong> certification prices and free-program availability change often — confirm on each provider’s official site before paying. ' +
          'Only ever practise on systems you own or are explicitly authorised to test.' +
        '</div>' +
      '</div>';

    // reveal; skip the scroll/focus jump on in-place tweak refreshes (keepView).
    showView('result');
    if (!opts.keepView) {
      if (!prefersReduce) window.scrollTo({ top: 0, behavior: 'smooth' }); else window.scrollTo(0, 0);
      var heading = byId('result-heading');
      if (heading) heading.focus({ preventScroll: true });
    }

    wirePlanActions(plan, trackName);
  }

  function setStatus(msg) { var s = byId('plan-status'); if (s) s.textContent = msg; }

  function wirePlanActions(planRef, trackName) {
    byId('print-btn').addEventListener('click', function () {
      wantPrintTitle = 'CYBERPATH roadmap — ' + trackName; // applied via beforeprint (deterministic)
      window.print();
    });

    var copyBtn = byId('copy-btn');
    copyBtn.addEventListener('click', function () {
      var url = location.href;
      var flash = function () {
        setStatus('Link copied to clipboard.');
        var original = copyBtn.innerHTML;
        copyBtn.innerHTML = icon('check') + ' Copied!';
        setTimeout(function () { copyBtn.innerHTML = original; }, 1600);
      };
      var fallback = function () {
        try {
          var t = document.createElement('input');
          t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
          document.body.appendChild(t); t.select();
          document.execCommand('copy'); document.body.removeChild(t); flash();
        } catch (e) { setStatus('Couldn’t copy automatically — copy the URL from your address bar.'); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(flash, fallback);
      } else { fallback(); }
    });

    byId('edit-btn').addEventListener('click', editAnswers);

    var mdBtn = byId('md-btn');
    if (mdBtn) mdBtn.addEventListener('click', function () { downloadMarkdown(planRef, trackName); });

    byId('restart-btn').addEventListener('click', function () {
      answers = {}; stepIndex = 0;
      stepEls.forEach(function (fs) {
        Array.prototype.forEach.call(fs.querySelectorAll('input'), function (n) { n.checked = false; });
      });
      showStep(0, false);          // keep the wizard DOM coherent for any re-entry
      els.result.innerHTML = '';
      showView('hero');
      removeKey(PLAN_KEY);          // don't auto-restore after an explicit reset
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      window.scrollTo({ top: 0, behavior: prefersReduce ? 'auto' : 'smooth' });
      els.start.focus();
    });

    updateCompletion(); // the change handling itself is delegated once, at init
  }

  function updateCompletion() {
    var boxes = els.result.querySelectorAll('.phase__check');
    if (!boxes.length) return;
    var done = 0;
    Array.prototype.forEach.call(boxes, function (b) { if (b.checked) done++; });
    var total = boxes.length, pct = Math.round((done / total) * 100);
    var fill = byId('plan-progress-fill'); if (fill) fill.style.width = pct + '%';
    var txt = byId('plan-progress-text');
    if (txt) txt.textContent = done + ' of ' + total + ' phases complete (' + pct + '%)';
    var wrap = byId('plan-progress'); if (wrap) wrap.setAttribute('aria-valuenow', String(pct));
  }

  // Download the plan as a Markdown file (great for notes / a GitHub repo).
  function downloadMarkdown(plan, trackName) {
    var md = buildMarkdown(plan, trackName);
    try {
      var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'cyberpath-' + slug(trackName) + '.md';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      setStatus('Markdown file downloaded.');
    } catch (e) { setStatus('Could not generate the Markdown file.'); }
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function buildMarkdown(plan, trackName) {
    var a = plan.answers, L = LABELS, lines = [];
    lines.push('# CYBERPATH roadmap — ' + trackName, '');
    if (!plan.isExplore && plan.track) lines.push('> ' + plan.track.tagline, '');
    lines.push('**Profile:** ' + (L.experience[a.experience] || a.experience) +
      ' · ' + (L.hours[a.hours] || a.hours) + ' · ' + (L.budget[a.budget] || a.budget) +
      ' · ' + (L.style[a.style] || a.style) + ' · goal: ' + (L.appetite[a.appetite] || a.appetite));
    lines.push('', '**Estimate:** ~' + fmtTotal(plan.months) + ' to job-ready · ' + plan.phases.length +
      ' phases · ~' + Math.max(10, Math.round(plan.totalWeeks * plan.hours / 10) * 10) + ' hours total', '');
    if (plan.matched && plan.recommendation) {
      lines.push('_Matched by aptitude: ' + plan.recommendation.top.confidencePct + '% fit._', '');
    }
    lines.push('## Step-by-step plan', '');
    plan.phases.forEach(function (p, i) {
      var d = p.def;
      lines.push('### ' + (i + 1) + '. ' + d.name + '  _(' + fmtDuration(p.weeks) + ')_');
      lines.push('', d.focus, '');
      lines.push('**Learn:** ' + d.skills.join(', '), '');
      var showPaid = a.budget !== 'free';
      var res = (d.free || []).concat(showPaid ? (d.paid || []) : []);
      if (res.length) {
        lines.push('**Resources:**');
        res.forEach(function (r) { lines.push('- [' + r.name + '](' + r.url + ')' + (r.note ? ' — ' + r.note : '')); });
        lines.push('');
      }
      if (a.appetite !== 'hobby' && (d.certs || []).length) {
        lines.push('**Target certs:** ' + d.certs.map(function (c) { return c.name + ' (' + c.tier.label + ')'; }).join(', '), '');
      }
    });
    if (plan.ladder && plan.ladder.length) {
      lines.push('## Certification ladder', '');
      plan.ladder.forEach(function (c, i) { lines.push((i + 1) + '. ' + c.name + ' — ' + c.tier.label + ' — ' + c.url); });
      if (a.budget !== 'free' && plan.costHi > 0) lines.push('', '_Rough exam fees: ~$' + plan.costLo + '–$' + plan.costHi + ' (verify current prices)._');
      lines.push('');
    }
    if (!plan.isExplore && DATA.BRIDGES && DATA.BRIDGES[plan.trackKey]) {
      lines.push('## Where this can take you next', '');
      DATA.BRIDGES[plan.trackKey].forEach(function (b) {
        var t = DATA.TRACKS[b.to]; if (t) lines.push('- **' + t.name + '** — ' + b.why);
      });
      lines.push('');
    }
    lines.push('---', '_Generated by CYBERPATH · https://op-h.github.io/cyberpath/ · Verify cert prices before paying._');
    return lines.join('\n');
  }

  /* ----------------------------------------------------------------
   * util
   * ---------------------------------------------------------------- */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Deterministic PDF filename: set the title only during printing (covers Ctrl+P too). */
  var wantPrintTitle = null, savedTitle = null;
  window.addEventListener('beforeprint', function () {
    if (wantPrintTitle) { savedTitle = document.title; document.title = wantPrintTitle; }
  });
  window.addEventListener('afterprint', function () {
    if (savedTitle != null) { document.title = savedTitle; savedTitle = null; }
  });

  // A #plan= link pasted into an open tab (or Back/Forward across plans) re-renders.
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#plan=') === 0) restoreFromHash();
  });

  // Offline / installable: register the service worker (relative path → correct scope
  // on GitHub Pages project sites). Makes the footer's "works offline" claim true.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  /* ----------------------------------------------------------------
   * BOOT — a shared "#plan=…" link wins; otherwise restore the last plan.
   * ---------------------------------------------------------------- */
  if (!restoreFromHash()) restoreLastPlan();

  var lr = byId('last-reviewed'); if (lr && DATA.LAST_REVIEWED) lr.textContent = DATA.LAST_REVIEWED;
})();
