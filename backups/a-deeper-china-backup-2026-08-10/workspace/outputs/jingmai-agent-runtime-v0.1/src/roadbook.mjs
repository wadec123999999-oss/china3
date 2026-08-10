import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (!profile) return { shape: 'Use one coherent public sequence, then stop before another transfer.', body: 'Roads, weather and access need a dated check.', lowEnergy: 'Keep the shortest coherent version.', rain: 'Preserve the landscape question and remove exposed movement.' };
  const shape = profile.point_mode === 'choose_one'
    ? 'Choose one coherent public-life or interaction branch; do not combine alternatives by default.'
    : profile.point_mode === 'method'
      ? 'Use the method to protect pace, consent, ecology or purchase boundaries, then stop.'
      : profile.point_mode === 'conditional'
        ? 'Use the core landscape route only while road, weather and ecological conditions remain acceptable; add no unverified branch.'
        : 'Follow one coherent sequence and stop when the landscape question is answered.';
  return { shape, body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch };
}

function ledger(decision) {
  const rows = decision.selectedModules.map(module => {
    const profile = module.decisionProfile || {};
    return [module.name, profile.why_this_over_nearby_alternative || 'Choose the smallest route that answers the guest question.', profile.point_mode === 'choose_one' ? 'Private homes, tea gardens or interaction branches not needed for this question.' : 'Extra roads, villages or sellers that add no new question.'];
  });
  if (decision.selectedModules.some(module => module.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one public, tasting or interaction branch by consent, date and release status.', 'Combining every village, tea garden and provider in one route.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const lines = [
    '# A Deeper China | Jingmai Mountain research draft',
    '',
    `**Shape:** ${decision.nights === null ? 'night count to confirm' : `${decision.nights} night${decision.nights === 1 ? '' : 's'}`}, built around ${decision.selectedModules.map(module => module.name).join(' · ')}.`,
    '',
    '## Why this Jingmai',
    'This is not an old-tree-tea shopping trip or an authenticity performance. It reads Jingmai as a living cultural landscape of forest, tea cultivation, villages, roads and consent, with all local interaction behind a separate release gate.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${input.interests?.length ? input.interests.join(', ') : 'a coherent reading of Jingmai as a tea-forest landscape'}.`,
    '- **What we inferred:** Remote roads, mud, weather, connectivity, community privacy and recovery capacity decide whether the landscape can be enjoyed.',
    '- **Route promise:** one readable landscape question per day, with low-energy and rain versions; no farmer, home, tea-garden, driver or guide promise by default.',
    '',
    '## Client decision ledger',
    ...(ledger(decision).length ? ['| Decision | We chose | We deliberately left out |', '|---|---|---|', ...ledger(decision).map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`)] : ['The route remains provisional until nights, terrain limits and the landscape question are clear.']),
    '',
    '## What we deliberately leave out',
    '- Private homes, tea gardens, ceremonies, children or work processes without consent and community review.',
    '- Tea authentication, old-tree age claims, quality, health, investment, price, shipping or export guarantees.',
    '- Scooter/self-drive advice, local guide or driver promises without current licence, road, safety and provider evidence.',
    '',
    '## Day structure'
  ];
  for (const day of decision.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    for (const module of day.modules) {
      const operation = operationFor(module);
      lines.push(`- **${module.name}**`, `  - **Reading question:** ${module.question}`, `  - **Route shape:** ${operation.shape}`, `  - **Body and time budget:** ${operation.body}`, `  - **Low-energy version:** ${operation.lowEnergy}`, `  - **Rain version:** ${operation.rain}`, ...(module.decisionProfile?.why_this_over_nearby_alternative ? [`  - **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`] : []), `  - **Stop rule:** ${module.decisionProfile?.stop_condition || 'Stop when the landscape question is answered; preserve time for recovery.'}`);
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints) {
    lines.push(`- **${point.name}:** ${point.why_it_matters} **Check:** ${point.friction.join(', ')}.`);
    if (point.decisionProfile) lines.push(`  - **Use when:** ${point.decisionProfile.choose_rule} **Stop after:** ${point.decisionProfile.stop_after}`);
  }
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => `- ${question}`));
  lines.push('', '## Verification boundary', '- Recheck road, weather, access, community rules, accommodation, connectivity, food, language and provider evidence immediately before release.', '- We do not book, bundle or sell third-party travel services.', '', '## Important', ...decision.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
