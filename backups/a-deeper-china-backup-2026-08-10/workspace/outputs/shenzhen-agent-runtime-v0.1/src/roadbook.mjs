import { decide } from './core.mjs';

function operationFor(module) {
  const profile = module.decisionProfile;
  if (profile) return {
    shape: profile.point_mode === 'choose_one' ? 'Choose one coherent branch; do not combine alternatives by default.' : profile.point_mode === 'method' ? 'Use the method to clarify the technology question or boundary, then stop before adding another district.' : profile.point_mode === 'conditional' ? 'Use the public core only while the technology question remains legible; add no branch without a dated check.' : 'Follow one coherent sequence and stop when the question is answered.',
    body: profile.body_cost, lowEnergy: profile.low_energy_branch, rain: profile.rain_branch,
  };
  return {shape:'Use one coherent public sequence to answer the module question, then stop before adding another transfer.',body:'Walking, weather, crowding and current access need a dated check.',lowEnergy:'Keep the shortest coherent version of this module.',rain:'Preserve the question and remove exposed movement unless current conditions support it.'};
}

function decisionLedger(input, decision) {
  const selected = decision.selectedModules; const rows = [];
  if (selected.length) rows.push(['One technology question before more places', `Start with ${selected[0].name}.`, 'A fictional factory tour or company-name checklist.']);
  if (input.interests?.some(x => ['factory_visit','sourcing'].includes(x))) rows.push(['Public evidence before private access', 'Redirect to markets, interfaces, exhibitions and public realm.', 'Factory, R&D campus, supplier or private-company promises.']);
  if (input.interests?.includes('hong_kong_extension')) rows.push(['Border as a separate decision', 'Use current official passport, visa and border checks.', 'A casual Hong Kong add-on assumed to work for every traveller.']);
  if (selected.some(m => m.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one market, design, showroom or layered-city branch by the date and question.', 'Combining every tech venue in one day.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const d = decide(input); const ledger = decisionLedger(input, d);
  const lines = [
    '# A Deeper China | Shenzhen technology-observation draft', '',
    `**Shape:** ${d.days} day${d.days > 1 ? 's' : ''}, built around ${d.selectedModules.map(m => m.name).join(' · ')}.`, '',
    '## Why this Shenzhen',
    'This is not a fictional factory tour. It uses public evidence—hardware markets, consumer interfaces, design and urban systems—to make a technology city legible.', '',
    '## Client decision brief',
    `- **What we heard:** ${Array.isArray(input.interests) && input.interests.length ? input.interests.join(', ') : 'a coherent public reading of Shenzhen technology'}.`,
    '- **What we inferred:** Shenzhen is sold through a question and an evidence path, not through a claim of private company access.',
    '- **Route promise:** one public technology question per day, with a shorter version when weather, access or privacy changes.', '',
    '## Client decision ledger',
    ...(ledger.length ? ['| Decision | We chose | We deliberately left out |','|---|---|---|',...ledger.map(([a,b,c])=>`| ${a} | ${b} | ${c} |`)] : ['The route remains provisional until the technology question and access boundaries are clear.']), '',
    '## What we deliberately leave out',
    '- Factory, R&D campus, supplier meeting or private company access.',
    '- Sourcing, quality or bargain guarantees based on a market walk.',
    '- Photographing prototypes, faces or restricted spaces without permission.',
    '- A Hong Kong crossing without current traveller-specific official confirmation.', '',
    '## Day structure'
  ];
  for (const day of d.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    for (const m of day.modules) {
      const op = operationFor(m);
      lines.push(`- **${m.name}**`,`  - **Reading question:** ${m.question}`,`  - **Route shape:** ${op.shape}`,`  - **Body and time budget:** ${op.body}`,`  - **Low-energy version:** ${op.lowEnergy}`,`  - **Rain version:** ${op.rain}`,...(m.decisionProfile?.why_this_over_nearby_alternative?[`  - **Why this over a nearby alternative:** ${m.decisionProfile.why_this_over_nearby_alternative}`]:[]),`  - **Stop rule:** ${m.decisionProfile?.stop_condition ?? 'Stop when the technology question is answered; preserve time for rest and public observation.'}`);
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const p of d.selectedPoints) { lines.push(`- **${p.name}:** ${p.why_it_matters} **Check:** ${p.friction.join(', ')}.`); if (p.decisionProfile) lines.push(`  - Use when: ${p.decisionProfile.choose_rule} Stop after: ${p.decisionProfile.stop_after}`); }
  if (d.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...d.requiredFollowUps.map(q=>`- ${q}`));
  lines.push('', '## Verification boundary','- Dynamic details need a date-specific check before delivery.','- We do not arrange company access, make sourcing claims, book, bundle or sell third-party travel services.','','## Important',...d.warnings.map(w=>`- ${w}`));
  return lines.join('\n');
}
