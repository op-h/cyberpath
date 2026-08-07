/*
 * CYBERPATH — career-match recommender ("behavioural" track inference)
 * ------------------------------------------------------------------
 * A transparent, explainable scoring model (NOT a black box, no server, no ML lib):
 * the learner's aptitude answers form a feature vector → per-track scores → a
 * softmax turns those into confidence percentages that read like a model's output.
 * It powers the "I'm not sure yet" path and an "also points to…" nudge.
 *
 * The aptitude QUESTIONS themselves live in data.js (so the wizard renders them and
 * share-links encode them); this file holds the weights and the maths.
 */
(function () {
  'use strict';

  var TRACK_KEYS = ['offensive', 'defensive', 'grc', 'cloud', 'appsec', 'dfir'];

  /*
   * WEIGHTS: answer value → contribution vector across the six tracks (scale -2..+3).
   * +3 = "this answer basically IS that job"; negatives = actively unlike that track.
   * Nested by question id so option values can't collide.
   */
  var TRACK_WEIGHTS = {
    apt_drive: {
      break:       { offensive: 3, appsec: 2, grc: -1 },      // breaking in = offensive; web-breaking feeds appsec
      watch:       { defensive: 3, dfir: 1, offensive: -1 },  // watching alerts = blue team
      build:       { cloud: 3, appsec: 1, grc: 1 },           // building/hardening = cloud/appsec
      investigate: { dfir: 3, defensive: 1 },                 // reconstruct after the fact = DFIR
      govern:      { grc: 3, offensive: -2 },                 // rules-first = GRC, opposite of hacking
    },
    apt_mindset: {
      adversarial: { offensive: 3, appsec: 2 },
      layered:     { defensive: 2, cloud: 2 },
      evidence:    { dfir: 3, defensive: 1 },
      systems:     { cloud: 2, appsec: 1, defensive: 1 },
      rules:       { grc: 3 },
    },
    apt_medium: {
      code:        { appsec: 3, offensive: 1, dfir: 1 },      // living in source/debugger = AppSec
      exploit:     { offensive: 3, appsec: 1 },
      cloudiac:    { cloud: 3 },
      siem:        { defensive: 3, dfir: 1 },
      forensics:   { dfir: 3, defensive: 1 },
      frameworks:  { grc: 3 },
    },
    apt_social: {
      solo:        { offensive: 2, dfir: 2, appsec: 1 },
      'ops-team':  { defensive: 3, dfir: 1 },
      'with-devs': { appsec: 2, cloud: 2 },
      stakeholders: { grc: 3, defensive: -1, offensive: -1 },
    },
    apt_report: {
      energizes:   { grc: 2, dfir: 2, defensive: 1 },
      professional: { appsec: 1, cloud: 1, defensive: 1 },
      minimal:     { offensive: 2, cloud: 1, grc: -1 },
    },
  };

  // Small secondary nudge from the existing "style" answer — never overrides aptitude.
  var STYLE_WEIGHTS = {
    hands:      { offensive: 1, appsec: 1, dfir: 1 },
    structured: { defensive: 1, cloud: 1 },
    reading:    { grc: 2, dfir: 1 },
    balanced:   {},
  };

  var MATCH_REASONS = {
    apt_drive:   { break: 'wanting to find the way in', watch: 'wanting to catch attacks in progress', build: 'wanting to build systems that resist attack', investigate: 'wanting to reconstruct what happened', govern: 'wanting to set the rules' },
    apt_mindset: { adversarial: 'an instinct for spotting flaws', layered: 'a defense-in-layers mindset', evidence: 'an evidence-first mindset', systems: 'a whole-systems mindset', rules: 'a policy-and-accountability mindset' },
    apt_medium:  { code: 'a pull toward code and debuggers', exploit: 'a pull toward exploit tooling', cloudiac: 'a pull toward cloud and infrastructure-as-code', siem: 'a pull toward SIEM and detection', forensics: 'a pull toward forensic analysis', frameworks: 'a pull toward risk and control frameworks' },
    apt_social:  { solo: 'preferring deep solo work', 'ops-team': 'thriving in a live response team', 'with-devs': 'wanting to work alongside developers', stakeholders: 'being comfortable with the business' },
    apt_report:  { energizes: 'enjoying writing findings up', professional: 'treating documentation as part of the craft', minimal: 'wanting to stay hands-on' },
  };

  // answers -> ranked [{track, score, confidencePct}] high-to-low.
  function scoreTracks(answers, opts) {
    opts = opts || {};
    var T = opts.temperature || 3.5; // tuned so a clean persona lands ~70-85%
    var raw = {}; TRACK_KEYS.forEach(function (k) { raw[k] = 0; });

    function apply(table, value) {
      if (!table || value == null) return;
      var vec = table[value]; if (!vec) return;
      Object.keys(vec).forEach(function (k) { if (raw[k] != null) raw[k] += vec[k]; });
    }
    Object.keys(TRACK_WEIGHTS).forEach(function (qid) { apply(TRACK_WEIGHTS[qid], answers[qid]); });
    apply(STYLE_WEIGHTS, answers.style);

    var scores = TRACK_KEYS.map(function (k) { return raw[k]; });
    var max = Math.max.apply(null, scores);
    var exps = scores.map(function (s) { return Math.exp((s - max) / T); });
    var sum = exps.reduce(function (a, b) { return a + b; }, 0) || 1;

    return TRACK_KEYS
      .map(function (k, i) { return { track: k, score: raw[k], confidencePct: Math.round((exps[i] / sum) * 100) }; })
      .sort(function (a, b) { return b.score - a.score || b.confidencePct - a.confidencePct; });
  }

  // Top two within `margin` raw points AND both positive => genuine "explore both".
  function detectCloseCall(ranked, margin) {
    margin = margin == null ? 3 : margin;
    if (ranked.length < 2) return { close: false, tracks: ranked.map(function (r) { return r.track; }) };
    var a = ranked[0], b = ranked[1];
    var close = a.score > 0 && (a.score - b.score) <= margin;
    return { close: close, tracks: close ? [a.track, b.track] : [a.track] };
  }

  // Cites the two answers that contributed most to topTrack.
  function explainMatch(topTrack, answers, nameFor) {
    nameFor = nameFor || function (k) {
      return (window.CYBERPATH_DATA && window.CYBERPATH_DATA.TRACKS[k]) ? window.CYBERPATH_DATA.TRACKS[k].name : k;
    };
    var contribs = [];
    Object.keys(TRACK_WEIGHTS).forEach(function (qid) {
      var val = answers[qid];
      var vec = val != null && TRACK_WEIGHTS[qid][val];
      var c = vec && vec[topTrack] ? vec[topTrack] : 0;
      if (c > 0 && MATCH_REASONS[qid] && MATCH_REASONS[qid][val]) contribs.push({ c: c, phrase: MATCH_REASONS[qid][val] });
    });
    contribs.sort(function (a, b) { return b.c - a.c; });
    var top = contribs.slice(0, 2).map(function (x) { return x.phrase; });
    var name = nameFor(topTrack);
    if (top.length === 0) return 'Your answers point most toward ' + name + '.';
    if (top.length === 1) return 'You showed ' + top[0] + ', which points toward ' + name + '.';
    return 'You showed ' + top[0] + ' and ' + top[1] + ', which point toward ' + name + '.';
  }

  window.CYBERPATH_MATCH = {
    TRACK_KEYS: TRACK_KEYS,
    scoreTracks: scoreTracks,
    detectCloseCall: detectCloseCall,
    explainMatch: explainMatch,
  };
})();
