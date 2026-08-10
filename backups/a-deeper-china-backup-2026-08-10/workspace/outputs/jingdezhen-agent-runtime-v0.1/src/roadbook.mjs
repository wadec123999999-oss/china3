import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (!profile) return { shape: 'Use one coherent public sequence, then stop before another transfer.', body: 'Walking, weather and access need a dated check.', lowEnergy: 'Keep the shortest coherent version.', rain: 'Preserve the material question and remove unsafe exposure.' };
  const shape = profile.point_mode === 'choose_one'
    ? 'Choose one coherent branch; do not combine alternatives by default.'
    : profile.point_mode === 'method'
      ? 'Use the method to protect pace, safety or purchase boundaries, then stop.'
      : profile.point_mode === 'conditional'
        ? 'Use the core sequence only while the ceramic question remains legible; add no unverified branch.'
        : 'Follow one coherent sequence and stop when the ceramic question is answered.';
  return { shape, body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch };
}

function ledger(decision) {
  const rows = decision.selectedModules.map(module => {
    const profile = module.decisionProfile || {};
    return [module.name, profile.why_this_over_nearby_alternative || 'Choose the smallest route that answers the guest question.', profile.point_mode === 'choose_one' ? 'Other museums, studios or branches not needed for this question.' : 'Extra stops that add objects without adding a new material question.'];
  });
  if (decision.selectedModules.some(module => module.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one heritage, contemporary or making branch by date and release status.', 'Combining every venue, studio or workshop in one day.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const lines = [
    '# A Deeper China | Jingdezhen draft',
    '',
    `**Shape:** ${decision.days} day${decision.days > 1 ? 's' : ''}, built around ${decision.selectedModules.map(module => module.name).join(' · ')}.`,
    '',
    '## Why this Jingdezhen',
    'This is not a ceramic-shopping stop. It reads material, process, kiln, labour, standards and contemporary design as one living system, with buying and making kept behind explicit boundaries.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${input.interests?.length ? input.interests.join(', ') : 'a coherent reading of Jingdezhen as a ceramic system'}.`,
    '- **What we inferred:** The useful route is one observable material question per day, not a list of museums or private studios.',
    '- **Route promise:** a public, paced route with shorter low-energy and rain versions; making appears only after a separate partner and safety release.',
    '',
    '## Client decision ledger',
    ...(ledger(decision).length ? ['| Decision | We chose | We deliberately left out |', '|---|---|---|', ...ledger(decision).map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`)] : ['The route remains provisional until the guest’s material question and available days are clear.']),
    '',
    '## What we deliberately leave out',
    '- Private artist access, filming or studio visits without consent and release.',
    '- Ceramic authentication, valuation, export, shipping or seller guarantees.',
    '- A workshop, residency or apprenticeship presented as bookable before partner, safety, language and delivery checks pass.',
    '',
    '## Day structure'
  ];
  for (const day of decision.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    for (const module of day.modules) {
      const operation = operationFor(module);
      lines.push(
        `- **${module.name}**`,
        `  - **Reading question:** ${module.question}`,
        `  - **Route shape:** ${operation.shape}`,
        `  - **Body and time budget:** ${operation.body}`,
        `  - **Low-energy version:** ${operation.lowEnergy}`,
        `  - **Rain version:** ${operation.rain}`,
        ...(module.decisionProfile?.why_this_over_nearby_alternative ? [`  - **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`] : []),
        `  - **Stop rule:** ${module.decisionProfile?.stop_condition || 'Stop when the material question is answered; preserve time for recovery and unplanned observation.'}`
      );
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints) {
    lines.push(`- **${point.name}:** ${point.why_it_matters} **Check:** ${point.friction.join(', ')}.`);
    if (point.decisionProfile) lines.push(`  - **Use when:** ${point.decisionProfile.choose_rule} **Stop after:** ${point.decisionProfile.stop_after}`);
  }
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => `- ${question}`));
  lines.push('', '## Verification boundary', '- Recheck opening, programmes, access, transport, weather, language, safety and delivery immediately before release.', '- We do not book, bundle or sell third-party travel services.', '', '## Important', ...decision.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
