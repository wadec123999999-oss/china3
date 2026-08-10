import { decide } from './core.mjs';

const OPERATIONS = {
  CDM01: {
    shape: 'One neighbourhood rhythm—tea, public space, food and ordinary movement—not a rush between landmarks.',
    body: 'Low-to-moderate walking, but heat, humidity and unstructured time determine whether the day works.',
    lowEnergy: 'Keep one public-life loop and protect a long seated break; remove the extra district.',
    rain: 'Use indoor cultural or food layers and let the slower pace remain the point.'
  },
  CDM02: {
    shape: 'A panda operations decision: early access, animal activity, transfer cost and the rest of the day.',
    body: 'Low-to-moderate walking but high early-start, crowd and reservation friction.',
    lowEnergy: 'Leave after the planned conservation/animal question; do not add a distant attraction by default.',
    rain: 'Keep only after current admission, weather and animal-activity conditions are checked.'
  },
  CDM03: {
    shape: 'One tea-and-park loop long enough to observe how Chengdu shares public time.',
    body: 'Low transfer cost; heat, rain, seating and etiquette matter more than distance.',
    lowEnergy: 'Stay within one park and let unstructured time do the work.',
    rain: 'Use a covered tea or cultural layer after current opening is confirmed.'
  },
  CDM04: {
    shape: 'One meal or snack progression that explains ordering, spice and sharing—not a restaurant ranking.',
    body: 'Low walking load but high dietary, spice, waiting and language sensitivity.',
    lowEnergy: 'Keep one confirmed food context and remove any second meal stop.',
    rain: 'Food is a strong weather branch, subject to written dietary and venue checks where needed.'
  },
  CDM05: {
    shape: 'One memory/poetry/religion question in a calm cultural area, not a historic-site checklist.',
    body: 'Low-to-moderate walking with attention and etiquette requirements.',
    lowEnergy: 'Choose one cultural anchor and finish before adding another temple or memorial.',
    rain: 'Protect the confirmed indoor/covered core and cut the garden extension.'
  },
  CDM06: {
    shape: 'One contemporary-city question—night, design or performance—in one district.',
    body: 'Moderate evening load with programme, crowd and return-transport uncertainty.',
    lowEnergy: 'Keep one confirmed evening layer and return early.',
    rain: 'Use a confirmed indoor programme; do not fill the evening with venue-hopping.'
  },
  CDM07: {
    shape: 'A day-trip decision based on engineering, landscape, religion and transfer cost—not simply leaving the city.',
    body: 'High transfer and day-length cost; it should earn a full day.',
    lowEnergy: 'Stay in Chengdu and keep the city rhythm rather than forcing a thin excursion.',
    rain: 'Release only after current transport, weather and site conditions are checked.'
  },
  CDM08: {
    shape: 'A contrast handoff between Chengdu dwelling and Chongqing vertical movement, not an automatic two-city bundle.',
    body: 'Transfer fatigue and hotel/rail timing are the main costs.',
    lowEnergy: 'Keep the stronger base city unless the transfer clearly adds a new question.',
    rain: 'Use current rail and indoor programme conditions before changing cities.'
  }
};

const INTEREST_LABELS = {
  panda_priority: 'pandas as a priority',
  no_pandas: 'a panda-free Chengdu',
  slow_travel: 'a slower rhythm',
  food_driven: 'food and everyday eating',
  history: 'memory, poetry and religion',
  art_design: 'contemporary art and design',
  dujiangyan: 'a deliberate western-Sichuan day-trip decision',
  chongqing_extension: 'a Chengdu–Chongqing contrast'
};

function operationFor(module) {
  const profile=module.decisionProfile;
  if(profile)return {shape:profile.point_mode==='choose_one'?'Choose one coherent branch; do not combine alternatives by default.':profile.point_mode==='method'?'Use the method to protect pace or make a decision, then stop before adding another district.':profile.point_mode==='conditional'?'Use the core sequence only while the question remains legible; add no branch without a dated check.':'Follow one coherent sequence and stop when the route question is answered.',body:profile.body_cost,lowEnergy:profile.low_energy_branch,rain:profile.rain_branch};
  return OPERATIONS[module.id] || {
    shape: 'Use one coherent public sequence to answer the module question, then stop before adding another transfer.',
    body: 'Walking, weather, crowding and current access need a dated check.',
    lowEnergy: 'Keep the shortest coherent version of this module.',
    rain: 'Preserve the question and remove exposed movement unless current conditions support it.'
  };
}

function clientBrief(input, decision) {
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const heard = interests.map(item => INTEREST_LABELS[item] || item).filter(Boolean);
  const inferred = [];
  if (input.firstVisit) inferred.push('A first visit needs Chengdu to become legible as a rhythm before adding regional extensions.');
  if (interests.includes('panda_priority')) inferred.push('The panda visit is an operational anchor, not the definition of the whole city.');
  if (interests.includes('food_driven')) inferred.push('Food is treated as social geography and ordering practice, not a list of famous restaurants.');
  if (input.weatherConstraint) inferred.push('Weather changes the route shape, not just the clothing advice.');
  if (decision.requiredFollowUps.length) inferred.push('The draft stays provisional until the highest-value operating questions are answered.');
  return { heard: heard.length ? heard : ['a coherent reading of Chengdu'], inferred };
}

function exclusions(input, decision) {
  const items = [
    'A panda visit, hotpot meal and distant day trip compressed into the same day.',
    'A second food venue added only to make the itinerary look fuller.',
    'A day trip added automatically when Chengdu itself has not been understood.',
    'Private homes, staged “local” encounters or unconsented portraits.'
  ];
  if (input.interests?.includes('no_pandas')) items.push('Panda Base as a default first-visit obligation.');
  if (decision.selectedModules?.some(module => module.id === 'CDM07')) items.push('A second regional excursion after the first transfer has already consumed the day.');
  return items;
}

function decisionLedger(input,decision){
 const selected=decision.selectedModules;const rows=[];
 if(selected.length)rows.push(['One Chengdu rhythm before more attractions',`Start with ${selected[0].name}.`,'A panda, food and day-trip checklist compressed into one day.']);
 if(input.interests?.includes('panda_priority'))rows.push(['Pandas as an operational anchor','Use one verified panda question and protect the rest of the day.','Another distant attraction added automatically.']);
 if(input.interests?.includes('food_driven'))rows.push(['Food as social geography','Choose one safe, understood food format.','A ranked restaurant crawl or unverified venue promise.']);
 if(selected.some(m=>m.decisionProfile?.point_mode==='choose_one'))rows.push(['Alternatives remain alternatives','Choose one cultural, food, performance or day-trip branch by date and guest question.','Combining every option in one itinerary.']);
 return rows;
}

export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const brief = clientBrief(input, decision);
  const ledger=decisionLedger(input,decision);
  const lines = [
    '# A Deeper China | Chengdu draft',
    '',
    `**Shape:** ${decision.days} day${decision.days > 1 ? 's' : ''}, built around ${decision.selectedModules.map(module => module.name).join(' · ')}.`,
    '',
    '## Why this Chengdu',
    'This is not a panda-and-hotpot checklist. It gives one strong anchor, a food and public-life rhythm, and enough unplanned time for Chengdu to work as a city.',
    '',
    '## Client decision brief',
    `- **What we heard:** ${brief.heard.join(', ')}.`,
    ...(brief.inferred.length ? ['- **What we inferred:**', ...brief.inferred.map(item => `  - ${item}`)] : []),
    '- **Route promise:** one readable Chengdu question per day, with a shorter version when weather, energy or access changes.',
    '',
    '## Client decision ledger',
    ...(ledger.length?['| Decision | We chose | We deliberately left out |','|---|---|---|',...ledger.map(([a,b,c])=>`| ${a} | ${b} | ${c} |`)]:['The route remains provisional until the guest’s priorities and constraints are clear.']),
    '',
    '## What we deliberately leave out',
    ...exclusions(input, decision).map(item => `- ${item}`),
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
        ...(module.decisionProfile?.why_this_over_nearby_alternative?[`  - **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`]:[]),
        `  - **Stop rule:** ${module.decisionProfile?.stop_condition??'Stop when the route question is answered; preserve time for rest and unexpected city life.'}`
      );
    }
  }
  lines.push('', '## On-the-ground notes');
  for (const point of decision.selectedPoints){lines.push(`- **${point.name}:** ${point.why_it_matters} **Check:** ${point.friction.join(', ')}.`);if(point.decisionProfile)lines.push(`  - Use when: ${point.decisionProfile.choose_rule} Stop after: ${point.decisionProfile.stop_after}`);}
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(question => `- ${question}`));
  lines.push('', '## Verification boundary', '- Dynamic details need a date-specific check before delivery.', '- We do not book, bundle or sell third-party travel services.');
  lines.push('', '## Important', ...decision.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
