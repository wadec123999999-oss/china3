import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (!profile) return { shape: 'Use one coherent public sequence, then stop before another transfer.', body: 'Stairs, weather and access need a dated check.', lowEnergy: 'Keep the shortest coherent version.', rain: 'Preserve the heritage question and remove exposed movement.' };
  const shape = profile.point_mode === 'choose_one'
    ? 'Choose one coherent public, sacred or training branch; do not combine alternatives by default.'
    : profile.point_mode === 'method'
      ? 'Use the method to protect pace, etiquette, safety or release boundaries, then stop.'
      : profile.point_mode === 'conditional'
        ? 'Use the core route only while terrain, weather and exertion remain acceptable; add no unverified branch.'
        : 'Follow one coherent sequence and stop when the heritage question is answered.';
  return { shape, body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch };
}

function ledger(decision) {
  const rows = decision.selectedModules.map(module => {
    const profile = module.decisionProfile || {};
    return [module.name, profile.why_this_over_nearby_alternative || 'Choose the smallest route that answers the guest question.', profile.point_mode === 'choose_one' ? 'Other temples, viewpoints or provider branches not needed for this question.' : 'Extra steps, transfers or promises that add no new question.'];
  });
  if (decision.selectedModules.some(module => module.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one heritage, sacred or Tai Chi branch by date, body capacity and release status.', 'Combining every temple, viewpoint and provider in one day.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const lines = [
    '# A Deeper China | Wudang Mountains research draft',
    '',
    `**Shape:** ${decision.nights === null ? 'night count to confirm' : `${decision.nights} night${decision.nights === 1 ? '' : 's'}`}, built around ${decision.selectedModules.map(module => module.name).join(' · ')}.`,
    '',
    '## Why this Wudang',
    'This is not a kung-fu fantasy or spiritual-transformation promise. It reads Wudang through mountain movement, public Taoist architecture, history and respectful boundaries, with Tai Chi kept behind a separate safety and provider release.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${input.interests?.length ? input.interests.join(', ') : 'a coherent reading of Wudang heritage'}.`,
    '- **What we inferred:** Stairs, weather, transfer time, worship etiquette and body capacity are part of the product.',
    '- **Route promise:** one readable heritage question per day, with shorter low-energy and rain versions; no private religious access or training promise by default.',
    '',
    '## Client decision ledger',
    ...(ledger(decision).length ? ['| Decision | We chose | We deliberately left out |', '|---|---|---|', ...ledger(decision).map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`)] : ['The route remains provisional until nights, body limits and the heritage question are clear.']),
    '',
    '## What we deliberately leave out',
    '- Private temples, masters, rituals or non-public spaces without consent and release.',
    '- Guaranteed sunrise, mist, cable-car operation, clear views or empty scenes.',
    '- Tai Chi, martial-arts training, healing or medical outcomes without a separate provider and safety gate.',
    '',
    '## Day structure'
  ];
  for (const day of decision.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    for (const module of day.modules) {
      const operation = operationFor(module);
      lines.push(`- **${module.name}**`, `  - **Reading question:** ${module.question}`, `  - **Route shape:** ${operation.shape}`, `  - **Body and time budget:** ${operation.body}`, `  - **Low-energy version:** ${operation.lowEnergy}`, `  - **Rain version:** ${operation.rain}`, ...(module.decisionProfile?.why_this_over_nearby_alternative ? [`  - **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`] : []), `  - **Stop rule:** ${module.decisionProfile?.stop_condition || 'Stop when the heritage question is answered; preserve time for recovery.'}`);
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints) {
    lines.push(`- **${point.name}:** ${point.why_it_matters} **Check:** ${point.friction.join(', ')}.`);
    if (point.decisionProfile) lines.push(`  - **Use when:** ${point.decisionProfile.choose_rule} **Stop after:** ${point.decisionProfile.stop_after}`);
  }
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => `- ${question}`));
  lines.push('', '## Verification boundary', '- Recheck weather warnings, access, stairs, cable-car operation, transport, etiquette, language and provider evidence immediately before release.', '- We do not book, bundle or sell third-party travel services.', '', '## Important', ...decision.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
