import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (profile) return {
    shape: profile.point_mode === 'choose_one' ? 'Choose one coherent branch; do not combine alternatives by default.' : profile.point_mode === 'method' ? 'Use the method to protect pace or make a decision, then stop before adding another district.' : profile.point_mode === 'conditional' ? 'Use the core sequence only while the question remains legible; add no branch without a dated check.' : 'Follow one coherent sequence and stop when the route question is answered.',
    body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch,
  };
  return {shape:'Use one coherent public sequence to answer the module question, then stop before adding another transfer.',body:'Walking, weather, crowding and current access need a dated check.',lowEnergy:'Keep the shortest coherent version of this module.',rain:'Preserve the question and remove exposed movement unless current conditions support it.'};
}

function decisionLedger(input, decision) {
  const selected = decision.selectedModules; const rows = [];
  if (selected.length) rows.push(['One Guangzhou question before more stops', `Start with ${selected[0].name}.`, 'A food, old-city and skyline checklist compressed into one day.']);
  if (input.interests?.some(x => ['food_driven','dim_sum'].includes(x))) rows.push(['Food as a social system', 'Choose one safe, understood meal format.', 'A ranked restaurant list or unverified venue promise.']);
  if (input.interests?.includes('shenzhen_extension')) rows.push(['Trade/heritage before technology contrast', 'Add Shenzhen only when it answers a new question.', 'A two-city bundle with no minimum time or transfer plan.']);
  if (selected.some(m => m.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one food, architecture or skyline branch by date and guest question.', 'Combining every option in one itinerary.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const d = decide(input); const ledger = decisionLedger(input, d);
  const lines = [
    '# A Deeper China | Guangzhou draft', '',
    `**Shape:** ${d.days} day${d.days > 1 ? 's' : ''}, built around ${d.selectedModules.map(m => m.name).join(' · ')}.`, '',
    '## Why this Guangzhou',
    'This is not a restaurant ranking plus a colonial-photo stop. It connects eating, port-city layers, public old-city texture and one contemporary contrast.', '',
    '## Client decision brief',
    `- **What we heard:** ${Array.isArray(input.interests) && input.interests.length ? input.interests.join(', ') : 'a coherent reading of Guangzhou'}.`,
    '- **What we inferred:** Guangzhou works when food, humidity, old-city texture and transfer cost are designed together—not listed separately.',
    '- **Route promise:** one readable Guangzhou question per day, with a shorter version when weather, energy or access changes.', '',
    '## Client decision ledger',
    ...(ledger.length ? ['| Decision | We chose | We deliberately left out |','|---|---|---|',...ledger.map(([a,b,c])=>`| ${a} | ${b} | ${c} |`)] : ['The route remains provisional until the guest’s priorities and constraints are clear.']), '',
    '## What we deliberately leave out',
    '- A second food venue added only to make the itinerary look fuller.',
    '- Private courtyards, staged resident encounters or unconsented portraits.',
    '- A skyline viewpoint added only for height.',
    '- A Guangzhou–Shenzhen or Guangzhou–Guilin extension without a separate question and transfer plan.', '',
    '## Day structure'
  ];
  for (const day of d.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    for (const m of day.modules) {
      const op = operationFor(m);
      lines.push(`- **${m.name}**`,`  - **Reading question:** ${m.question}`,`  - **Route shape:** ${op.shape}`,`  - **Body and time budget:** ${op.body}`,`  - **Low-energy version:** ${op.lowEnergy}`,`  - **Rain version:** ${op.rain}`,...(m.decisionProfile?.why_this_over_nearby_alternative?[`  - **Why this over a nearby alternative:** ${m.decisionProfile.why_this_over_nearby_alternative}`]:[]),`  - **Stop rule:** ${m.decisionProfile?.stop_condition ?? 'Stop when the route question is answered; preserve time for rest and unexpected city life.'}`);
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const p of d.selectedPoints) { lines.push(`- **${p.name}:** ${p.why_it_matters} **Check:** ${p.friction.join(', ')}.`); if (p.decisionProfile) lines.push(`  - Use when: ${p.decisionProfile.choose_rule} Stop after: ${p.decisionProfile.stop_after}`); }
  if (d.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...d.requiredFollowUps.map(q => `- ${q}`));
  lines.push('', '## Verification boundary','- Dynamic details need a date-specific check before delivery.','- We do not book, bundle or sell third-party travel services.','','## Important',...d.warnings.map(w=>`- ${w}`));
  return lines.join('\n');
}
