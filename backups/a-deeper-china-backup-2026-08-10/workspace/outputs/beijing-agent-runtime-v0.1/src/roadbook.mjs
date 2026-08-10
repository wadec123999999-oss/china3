import { decide } from './core.mjs';

const OPERATIONS = {
  BJM01: {
    shape: 'One imperial-axis reading with a clear entry, one contrast and a planned exit—not every hall.',
    body: 'Moderate walking and high attention load; exposed heat, screening and queues can dominate the day.',
    lowEnergy: 'Keep one palace/civic sequence and use a short elevation reset; do not add another monumental site.',
    rain: 'Protect the confirmed indoor core and cut exposed park movement if weather or queues rise.'
  },
  BJM02: {
    shape: 'One ritual-and-public-life contrast linking a civic or sacred space to how Beijing is used now.',
    body: 'Low-to-moderate walking, with large open areas and weather exposure.',
    lowEnergy: 'Choose one park or ritual anchor and preserve time for sitting rather than adding another district.',
    rain: 'Keep the indoor/covered interpretation and remove the long park segment.'
  },
  BJM03: {
    shape: 'One hutong neighbourhood sequence, not a commercial street checklist or a private-home tour.',
    body: 'Moderate walking with crossings, shade changes, crowd and resident-privacy friction.',
    lowEnergy: 'Use the shortest public lane sequence and finish at a calm public stop.',
    rain: 'Keep one covered/indoor neighbourhood layer and avoid forcing a long lane walk.'
  },
  BJM04: {
    shape: 'A Wall decision based on transfer, terrain, weather and turnaround—not reputation alone.',
    body: 'High transfer and variable step load; the return plan matters as much as the ascent.',
    lowEnergy: 'Choose the lower-load section or remove the Wall rather than turning the day into an endurance test.',
    rain: 'Do not release the Wall route without a current weather, surface and transport check.'
  },
  BJM05: {
    shape: 'One water-and-garden contrast to the compact imperial axis, only when it adds a new question.',
    body: 'Large-site walking and weather exposure can create hidden fatigue.',
    lowEnergy: 'Use the smaller central option or shorten the garden route before adding another landmark.',
    rain: 'Keep only the confirmed indoor/covered layer and remove long lakeside movement.'
  },
  BJM06: {
    shape: 'One contemporary-production question in one district, not a gallery or creative-venue crawl.',
    body: 'Lower physical intensity but high programme and transfer uncertainty.',
    lowEnergy: 'Choose one confirmed exhibition or public-facing district and stop there.',
    rain: 'Useful weather branch after programme, opening and ticket checks.'
  },
  BJM07: {
    shape: 'A first-24-hours reliability layer: payment, identity, reservations, data and realistic energy.',
    body: 'Low sightseeing load; it prevents operational friction from ruining the first day.',
    lowEnergy: 'Keep the arrival plan simple and reserve the first full cultural anchor for the next day.',
    rain: 'Use it as the default arrival-day branch when outdoor plans are fragile.'
  },
  BJM08: {
    shape: 'A stay-length decision: compare another Beijing day with the cost of adding a new city.',
    body: 'Transfer fatigue and reservation order are the main costs.',
    lowEnergy: 'Keep the stronger Beijing question rather than adding a thin extension.',
    rain: 'Use the strongest indoor contrast and current transport conditions before changing cities.'
  }
};

const PROFILE_LABELS = {
  firstVisit: 'first visit',
  architecture: 'architecture and urban history',
  history_architecture: 'imperial history and architecture',
  hutong_not_touristy: 'neighbourhood life beyond the tourist script',
  great_wall_must: 'a deliberate Great Wall decision',
  art_design: 'contemporary art and design',
  slow: 'a slower pace'
};

function operationFor(module) {
  const profile = module.decisionProfile;
  if (profile) {
    return {
      shape: profile.point_mode === 'choose_one'
        ? 'Choose one coherent branch; do not combine alternatives by default.'
        : profile.point_mode === 'method'
          ? 'Use the method to remove friction or make a decision, then stop before adding another district.'
          : profile.point_mode === 'conditional'
            ? 'Use the core sequence only while the neighbourhood question remains legible; add no branch without a dated check.'
            : 'Follow one coherent sequence and stop when the route question is answered.',
      body: profile.body_cost,
      lowEnergy: profile.low_energy_branch,
      rain: profile.rain_branch,
    };
  }
  return OPERATIONS[module.id] || {
    shape: 'Use one coherent public sequence to answer the module question, then stop before adding another transfer.',
    body: 'Walking, weather, crowding and current access need a dated check.',
    lowEnergy: 'Keep the shortest coherent version of this module.',
    rain: 'Preserve the question and remove exposed movement unless current conditions support it.'
  };
}

function clientBrief(input, decision) {
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const heard = interests.map(item => PROFILE_LABELS[item] || item).filter(Boolean);
  const inferred = [];
  if (input.firstVisit) inferred.push('A first visit needs a legible Beijing frame before detail accumulates.');
  if (interests.includes('great_wall_must')) inferred.push('The Wall is a route-and-body decision, not an automatic add-on.');
  if (interests.includes('hutong_not_touristy') || interests.includes('ethical_photo')) inferred.push('Neighbourhood life must remain public, respectful and non-staged.');
  if (input.weatherConstraint) inferred.push('Weather changes the route shape, not just the clothing advice.');
  if (decision.requiredFollowUps.length) inferred.push('The draft stays provisional until the highest-value operating questions are answered.');
  return { heard: heard.length ? heard : ['a coherent reading of Beijing'], inferred };
}

function exclusions(input, decision) {
  const items = [
    'A second imperial monument added after the main question is already answered.',
    'A Wall section chosen only because it is famous, without checking transfer, terrain and return cost.',
    'Private courtyards, residential interiors or staged encounters with hutong residents.',
    'A full Summer Palace day added automatically after the Forbidden City.'
  ];
  if (input.interests?.includes('hutong_not_touristy')) items.push('Nanluoguxiang as the default hutong experience when the brief asks for quieter neighbourhood observation.');
  if (decision.selectedModules?.some(module => module.id === 'BJM06')) items.push('Multiple contemporary-art districts in one day; programme quality matters more than venue count.');
  return items;
}

function decisionLedger(input, decision) {
  const selected = decision.selectedModules;
  const rows = [];
  if (selected.length) rows.push(['One imperial question before more monuments', `Start with ${selected[0].name}.`, 'A second monumental site added simply because it is nearby.']);
  if (input.interests?.includes('great_wall_must')) rows.push(['Wall as a body-and-transfer decision', 'Choose one verified section with a return plan.', 'A famous section promised without current transport, weather or terrain checks.']);
  if (input.interests?.includes('hutong_not_touristy')) rows.push(['Public neighbourhood life before private access', 'Use a public lane sequence and explicit photo boundaries.', 'Private courtyards or staged resident encounters.']);
  if (selected.some(module => module.decisionProfile?.point_mode === 'choose_one')) rows.push(['Alternatives remain alternatives', 'Choose one garden, Wall or contemporary branch by the date and guest question.', 'Combining every option in one day.']);
  return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const brief = clientBrief(input, decision);
  const ledger = decisionLedger(input, decision);
  const lines = [
    '# A Deeper China | Beijing draft',
    '',
    '**Shape:** ' + decision.days + ' day' + (decision.days > 1 ? 's' : '') + ', built around ' + decision.selectedModules.map(m => m.name).join(' · ') + '.',
    '',
    '## Why this Beijing',
    'This is not a monument checklist. It connects imperial order, public everyday life, a Wall landscape decision and one contemporary layer at a pace the traveller can actually absorb.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${brief.heard.join(', ')}.`,
    ...(brief.inferred.length ? ['- **What we inferred:**', ...brief.inferred.map(item => `  - ${item}`)] : []),
    '- **Route promise:** one readable Beijing question per day, with a shorter version when weather, energy or access changes.',
    '',
    '## Client decision ledger',
    ...(ledger.length ? ['| Decision | We chose | We deliberately left out |', '|---|---|---|', ...ledger.map(([name, chose, leftOut]) => `| ${name} | ${chose} | ${leftOut} |`)] : ['The route remains provisional until the guest’s priorities and constraints are clear.']),
    '',
    '## What we deliberately leave out',
    ...exclusions(input, decision).map(item => `- ${item}`),
    '',
    '## Day structure'
  ];
  for(const day of decision.dayPlan){
    lines.push('', '### Day '+day.day+' — '+day.theme);
    for(const module of day.modules){
      const operation = operationFor(module);
      lines.push(
        `- **${module.name}**`,
        `  - **Reading question:** ${module.question}`,
        `  - **Route shape:** ${operation.shape}`,
        `  - **Body and time budget:** ${operation.body}`,
        `  - **Low-energy version:** ${operation.lowEnergy}`,
        `  - **Rain version:** ${operation.rain}`,
        ...(module.decisionProfile?.why_this_over_nearby_alternative ? [`  - **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`] : []),
        `  - **Stop rule:** ${module.decisionProfile?.stop_condition ?? 'Stop when the route question is answered; preserve time for rest and unexpected city life.'}`
      );
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints) {
    lines.push('- **' + point.name + ':** ' + point.why_it_matters + ' **Check:** ' + point.friction.join(', ') + '.');
    if (point.decisionProfile) lines.push(`  - Use when: ${point.decisionProfile.choose_rule} Stop after: ${point.decisionProfile.stop_after}`);
  }
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => '- ' + question));
  lines.push('', '## Verification boundary', '- Dynamic details need a date-specific check before delivery.', '- We do not book, bundle or sell third-party travel services, and do not direct visitors into private homes.');
  lines.push('', '## Important', ...decision.warnings.map(warning => '- ' + warning));
  return lines.join('\n');
}
