/**
 * Lightweight, explainable customer-roadbook quality gate.
 *
 * This is a structural heuristic, not a substitute for editorial judgement or
 * field verification. Its purpose is to prevent a generic attraction list
 * from being mistaken for an A Deeper China decision-led roadbook.
 */

const INTERNAL_PATTERNS = [
  /\b(?:SHM|RM|BJM|CDM|GZM|SZM|GYM|HZM|SZUM|QZM|JDZM|WDM|JMM)\d{2,3}\b/i,
  /selected_module_ids/i,
  /supplier_id/i,
  /source_ids?/i
];

const CRITERIA = [
  {
    id: 'client_intent',
    label: 'Client intent is visible',
    weight: 15,
    patterns: [/what we heard/i, /what we are protecting/i, /client decision brief/i, /trip brief used for this draft/i]
  },
  {
    id: 'route_thesis',
    label: 'Route thesis explains the city',
    weight: 10,
    patterns: [/route thesis/i, /route promise/i, /route is built around/i]
  },
  {
    id: 'tradeoffs',
    label: 'Selection and deletion reasons are explicit',
    weight: 15,
    patterns: [/deliberate(?:ly)? trade[- ]off/i, /decision ledger/i, /deliberately left out/i, /why this over a nearby alternative/i]
  },
  {
    id: 'day_controls',
    label: 'Days have questions, anchors and stop rules',
    weight: 20,
    patterns: [/reading question/i, /physical anchor/i, /stop rule/i, /stop after/i]
  },
  {
    id: 'body_budget',
    label: 'Physical and transfer cost is stated',
    weight: 10,
    patterns: [/body and time budget/i, /body budget/i, /main friction/i, /transfer cost/i]
  },
  {
    id: 'fallbacks',
    label: 'Low-energy and rain fallbacks preserve the route question',
    weight: 10,
    patterns: [/low[- ]energy/i, /rain version/i, /fallback logic/i]
  },
  {
    id: 'verification_boundary',
    label: 'Dynamic checks and delivery boundary are honest',
    weight: 10,
    patterns: [/checks before delivery/i, /verification boundary/i, /research draft/i, /human verification/i]
  },
  {
    id: 'privacy_and_public_boundary',
    label: 'Privacy, safety or public-access boundary is present',
    weight: 10,
    patterns: [/privacy/i, /do not direct guests/i, /private access/i, /not a booking/i, /safety/i]
  }
];

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

export function scoreRoadbookMarkdown(markdown = '') {
  const text = String(markdown || '');
  const criteria = CRITERIA.map(item => ({
    id: item.id,
    label: item.label,
    weight: item.weight,
    passed: hasAny(text, item.patterns),
    evidence_patterns: item.patterns.map(pattern => pattern.source)
  }));
  const score = criteria.reduce((total, item) => total + (item.passed ? item.weight : 0), 0);
  const internal_matches = INTERNAL_PATTERNS.filter(pattern => pattern.test(text)).map(pattern => pattern.source);
  const penalty = internal_matches.length ? 20 : 0;
  const final_score = Math.max(0, score - penalty);
  const band = final_score >= 85 ? 'decision_led' : final_score >= 65 ? 'partially_decision_led' : 'generic_or_incomplete';
  return {
    version: '1.0',
    heuristic_only: true,
    score,
    internal_field_penalty: penalty,
    final_score,
    band,
    criteria,
    internal_matches,
    release_note: 'A high score does not prove current opening, safety, field reality or human verification.'
  };
}

export { CRITERIA };
