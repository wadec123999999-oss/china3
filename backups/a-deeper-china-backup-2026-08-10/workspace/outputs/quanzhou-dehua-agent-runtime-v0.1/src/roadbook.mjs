import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (!profile) return { shape: 'Use one coherent public sequence, then stop before another transfer.', body: 'Walking, heat and access need a dated check.', lowEnergy: 'Keep the shortest coherent version.', rain: 'Preserve the maritime question and remove exposed movement.' };
  const shape = profile.point_mode === 'choose_one'
    ? 'Choose one coherent sacred, public-life or production branch; do not combine alternatives by default.'
    : profile.point_mode === 'method'
      ? 'Use the method to protect pace, etiquette, safety or purchase boundaries, then stop.'
      : profile.point_mode === 'conditional'
        ? 'Use the core sequence only while the maritime question remains legible; add no unverified branch.'
        : 'Follow one coherent sequence and stop when the maritime question is answered.';
  return { shape, body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch };
}

function ledger(decision) {
  const rows = decision.selectedModules.map(module => {
    const profile = module.decisionProfile || {};
    return [module.name, profile.why_this_over_nearby_alternative || 'Choose the smallest route that answers the guest question.', profile.point_mode === 'choose_one' ? 'Other temples, performances or maker branches not needed for this question.' : 'Extra monuments or a rushed Dehua transfer that adds no new question.'];
  });
  if (decision.selectedModules.some(module => module.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one sacred, public-life or ceramic branch by date, etiquette and release status.', 'Combining every temple, performance and workshop in one route.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const lines = [
    '# A Deeper China | Quanzhou–Dehua draft',
    '',
    `**Shape:** ${decision.days} day${decision.days > 1 ? 's' : ''}, built around ${decision.selectedModules.map(module => module.name).join(' · ')}.`,
    '',
    '## Why this Quanzhou–Dehua',
    'This is not a temple checklist or ceramic-shopping detour. It makes a maritime system visible through production, port movement, belief, public life and—only when separately justified—Dehua ceramics.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${input.interests?.length ? input.interests.join(', ') : 'a coherent reading of Quanzhou as a maritime system'}.`,
    '- **What we inferred:** The useful route is one port, belief, infrastructure or public-life question per day, with etiquette and heat treated as part of the product.',
    '- **Route promise:** a public, paced route with compact rain/heat versions; Dehua and any maker activity require their own time and release gates.',
    '',
    '## Client decision ledger',
    ...(ledger(decision).length ? ['| Decision | We chose | We deliberately left out |', '|---|---|---|', ...ledger(decision).map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`)] : ['The route remains provisional until the guest’s maritime question and available days are clear.']),
    '',
    '## What we deliberately leave out',
    '- Sacred-site access, photography or worship presented without current etiquette and access checks.',
    '- Private courtyards, staged local contact, unconsented filming or a performance promise without a current programme.',
    '- Dehua squeezed into a two-day Quanzhou plan, or ceramics sold with authentication, provenance, shipping or maker guarantees.',
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
        `  - **Stop rule:** ${module.decisionProfile?.stop_condition || 'Stop when the maritime question is answered; preserve time for recovery and respectful observation.'}`
      );
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints) {
    lines.push(`- **${point.name}:** ${point.why_it_matters} **Check:** ${point.friction.join(', ')}.`);
    if (point.decisionProfile) lines.push(`  - **Use when:** ${point.decisionProfile.choose_rule} **Stop after:** ${point.decisionProfile.stop_after}`);
  }
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => `- ${question}`));
  lines.push('', '## Verification boundary', '- Recheck opening, ritual conditions, photography, programme, food safety, transport, weather and language immediately before release.', '- We do not book, bundle or sell third-party travel services.', '', '## Important', ...decision.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
