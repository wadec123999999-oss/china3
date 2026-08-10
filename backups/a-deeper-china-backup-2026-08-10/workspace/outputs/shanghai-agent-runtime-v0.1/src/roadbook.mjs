import { database, decide } from './core.mjs';

const storyCardsByModule = new Map(
  (database.story_cards || []).map(card => [card.module, card])
);

// Editorial guidance is deliberately more specific than a sightseeing list.
// It tells the renderer what the guest should do with a module, where to stop,
// and what makes the route different from a generic AI itinerary.
const publicGuidanceByModule = {
  SHM01: {
    anchor: 'Read the river from one bank before crossing it; the contrast is the point, not the number of viewpoints.',
    notice: 'Institutional scale, river movement and the old/new skyline relationship.',
    stop: 'Once the two riverbanks make sense, stop. Do not add an observation deck merely to collect a higher view.',
    friction: 'Crowds, heat and cross-river transfers can consume the day faster than expected.'
  },
  SHM02: {
    anchor: 'Walk one continuous historic-street sequence slowly enough to see how grand façades meet ordinary life.',
    notice: 'Setbacks, trees, entrances, reused buildings and the boundary between public street and private home.',
    stop: 'End the walk when the street pattern has become legible; do not turn residential life into a photo hunt.',
    friction: 'Shade, pavement, traffic crossings and resident privacy need active management.'
  },
  SHM04: {
    anchor: 'Choose one museum and give it one question; a second museum usually dilutes the first.',
    notice: 'Which objects or displays answer the guest’s China question, rather than which museum is most famous.',
    stop: 'Leave with a usable mental frame, not after exhausting every gallery.',
    friction: 'Timed entry, bag rules, temporary exhibitions and English interpretation must be checked for the date.'
  },
  SHM06: {
    anchor: 'Use the waterfront as evidence of work becoming public space, not as another skyline promenade.',
    notice: 'Industrial traces, path continuity, bridges, shade and who uses the river edge now.',
    stop: 'Keep the segment only while the regeneration question is visible; cut the far end before adding a forced transfer.',
    friction: 'Long distances, uneven shade and incomplete continuity can make the route look easier on a map than it feels.'
  }
};

// V1.2 operational cards. These are deliberately written as customer-facing
// planning constraints rather than promises about opening hours or access.
// They make the route usable: the guest can see the body's cost, the shape of
// the movement, and what survives rain or low energy.
const operationsByModule = {
  SHM01: {
    shape: 'One riverbank reading, one deliberate crossing, then stop once the old/new city contrast is clear.',
    body: 'Usually a moderate walking day with one exposed river segment; protect shade and a seated break.',
    lowEnergy: 'Keep the Bund-side reading and skip the cross-river segment; the city contrast can still be explained from one bank.',
    rain: 'Shorten the waterfront and use one confirmed indoor cultural stop; do not add a second skyline viewpoint.'
  },
  SHM02: {
    shape: 'One continuous Hengfu street loop, not a hunt for isolated famous façades.',
    body: 'Low-to-moderate walking intensity, but crossings, heat and uneven shade matter more than the map distance.',
    lowEnergy: 'Use one short street section around Wukang Building and finish with a nearby seated stop.',
    rain: 'Keep the street reading brief and move the main interpretation indoors; resident privacy remains non-negotiable.'
  },
  SHM04: {
    shape: 'One museum, one question, one exit—not a museum marathon.',
    body: 'Mostly indoor and lower-friction physically, but attention fatigue is real; leave time to process what was seen.',
    lowEnergy: 'Choose the smaller question and the shorter gallery route; do not compensate with another museum.',
    rain: 'This is the primary weather branch, subject to dated opening, reservation and exhibition checks.'
  },
  SHM06: {
    shape: 'One readable waterfront segment showing work becoming public space; cut the far end before the route becomes a transfer exercise.',
    body: 'Potentially long and exposed; treat distance, shade and toilets as design inputs, not footnotes.',
    lowEnergy: 'Use the nearest coherent section and leave before continuity breaks; do not force the full river edge.',
    rain: 'Replace the outdoor segment with an indoor design or making layer only if current access is confirmed.'
  },
  SHM03: {
    shape: 'One old-city question linking form, commerce and ritual; avoid turning the district into a shopping circuit.',
    body: 'Crowd and sensory load can be higher than walking distance suggests; schedule a quiet reset.',
    lowEnergy: 'Keep one public street and one contextual stop; omit the most congested edge.',
    rain: 'Retain the interpretive core and remove outdoor retail wandering.'
  },
  SHM05: {
    shape: 'One park/public-life loop observed respectfully, with Tai Chi treated as conditional rather than guaranteed.',
    body: 'Low transfer cost, but weather and social etiquette determine whether the experience works.',
    lowEnergy: 'Stay within one park and protect unstructured time; do not add another district.',
    rain: 'Use an indoor public-life or cultural layer; never stage or promise a class without release.'
  },
  SHM07: {
    shape: 'One after-dark public-space sequence, not a nightlife venue crawl.',
    body: 'Shorter walking distance but higher crowd, lighting and return-transport sensitivity.',
    lowEnergy: 'Keep one well-connected public edge and return early.',
    rain: 'Use a confirmed indoor evening programme or end the day earlier.'
  },
  SHM08: {
    shape: 'A decision handoff: compare the value of another Shanghai day with a Jiangnan extension before adding a transfer.',
    body: 'Transfer fatigue is the main cost; the extension is not automatically an upgrade.',
    lowEnergy: 'Keep the night in Shanghai unless the onward movement is simple and clearly worthwhile.',
    rain: 'Do not decide from scenery alone; use the destination-specific indoor offer and current rail conditions.'
  }
};

function intentBrief(input = {}) {
  const context = input.tripContext || {};
  const priorities = context.explicit_priorities || input.interests || [];
  const avoidances = context.explicit_avoidances || (has(input, 'slow') ? ['rushing'] : []);
  const heard = priorities.length ? priorities.join(', ') : 'a coherent first reading of Shanghai';
  const inferred = [];
  if (input.firstVisit === true || context.inferred_needs?.length) inferred.push('A first-time visitor needs a legible city frame before detail.');
  if (priorities.includes('architecture')) inferred.push('Architecture is being used to understand history, money and public life—not only to collect façades.');
  if (priorities.includes('slow') || avoidances.includes('rushing')) inferred.push('Recovery time and route continuity are part of the product, not spare time left over.');
  return { heard, avoidances, inferred };
}

function exclusions(input = {}, decision = {}) {
  const items = [
    'A second museum on the same day, unless the first museum cannot answer the chosen question.',
    'An observation-deck stop added only for height or a guaranteed photograph.',
    'Residential compounds, private interiors or staged encounters with residents.',
    'A long waterfront extension when the route question has already been answered.'
  ];
  if (has(input, 'architecture')) items.push('Nanjing Road as a standalone sightseeing objective; it is useful only if the guest wants a retail/public-movement contrast.');
  if (decision.selectedModules?.some(module => module.id === 'SHM08')) items.push('A Jiangnan day trip by default; the transfer must earn its place against another Shanghai day.');
  return items;
}

function operationFor(module) {
  const profile = module.decisionProfile;
  if (profile) {
    return {
      shape: profile.point_mode === 'choose_one'
        ? 'Choose one coherent branch; do not combine alternatives by default.'
        : profile.point_mode === 'method'
          ? 'Use the method across one public setting, then stop before observation becomes extraction.'
          : profile.point_mode === 'conditional'
            ? 'Use the core segment only while the route question remains legible; add no conditional branch without a dated check.'
            : 'Follow one continuous sequence and stop when the route question is answered.',
      body: profile.body_cost,
      lowEnergy: profile.low_energy_branch,
      rain: profile.rain_branch
    };
  }
  return operationsByModule[module.id] || {
    shape: 'Use this module to answer one question, then stop before adding another transfer.',
    body: 'Walking, crowding, weather and current access need a dated check.',
    lowEnergy: 'Keep the shortest coherent version of the module.',
    rain: 'Preserve the question and move indoors only after current access is confirmed.'
  };
}

function guidanceFor(module, points = []) {
  const editorial = publicGuidanceByModule[module.id] || {};
  const profile = module.decisionProfile || {};
  return {
    anchor: editorial.anchor || `Use ${module.name} to answer one concrete question, not to accumulate another stop.`,
    notice: editorial.notice || module.question || 'Notice how the place works in ordinary use, not only how it photographs.',
    stop: editorial.stop || profile.stop_condition || 'Stop when the route question is answered; preserve time for rest and unexpected city life.',
    friction: editorial.friction || points[0]?.friction || 'Current access, weather, crowding and walking conditions need confirmation.'
  };
}

function has(input, value) {
  return Array.isArray(input?.interests) && input.interests.includes(value);
}

function tripThesis(input, decision) {
  const architecture = has(input, 'architecture');
  const firstVisit = input?.firstVisit === true;
  const slow = has(input, 'slow');
  if (architecture && firstVisit && slow) {
    return 'Read Shanghai through a few deliberate contrasts—river finance, one cultural frame, and lived twentieth-century streets—without turning the first visit into a checklist.';
  }
  if (architecture) {
    return 'Use architecture as a way to understand how Shanghai changes scale, time and public life.';
  }
  return 'Build a coherent first reading of Shanghai, leaving room for weather, energy and ordinary city life.';
}

function skipList(input) {
  const skips = [
    'Do not try to cover every famous building in one district.',
    'Do not treat residential streets or private compounds as attractions.',
    'Do not promise a specific photo position, sunset or skyline condition.'
  ];
  if (has(input, 'architecture')) skips.push('Do not add a second museum simply because it is nearby; one museum should answer one clear question.');
  return skips;
}

function pointLines(points) {
  return points.map(point => {
    const profile = point.decisionProfile || {};
    return [
      `- **${point.name}** — ${point.why}`,
      `  - Best used: ${point.best_time || 'timing to be confirmed'}.`,
      `  - Use it when: ${profile.choose_rule || 'the point answers the selected route question.'}`,
      `  - Stop after: ${profile.stop_after || 'the route question is answered.'}`,
      `  - Friction: ${point.friction || 'confirm current conditions before delivery.'}`
    ];
  }).flat();
}

function verificationLines(decision) {
  const checks = new Set([
    'Museum opening arrangements, reservations and current programmes.',
    'Weather, shade, rest points and crowd load for the planned walking windows.',
    'Transport time and any roadworks or temporary access restrictions.'
  ]);
  for (const module of decision.selectedModules) {
    for (const check of String(module.dynamic_checks || '').split('|').map(x => x.trim()).filter(Boolean)) {
      checks.add(`${check} for the selected route.`);
    }
  }
  return [...checks].map(check => `- ${check}`);
}

// The differentiator is not a longer list of places. It is a visible record
// of the trade-offs made for this particular traveller. Keeping this logic in
// the renderer makes the public roadbook explain why one branch won and what
// was deliberately sacrificed, without exposing module IDs or source scores.
function clientDecisionLedger(input, decision) {
  const ids = new Set(decision.selectedModules.map(module => module.id));
  const rows = [];
  if (input.firstVisit === true && ids.has('SHM01')) {
    rows.push(['Orientation before detail', 'Start with one river-scale frame so the rest of Shanghai has a readable reference point.', 'A second landmark cluster on the first morning.']);
  }
  if (has(input, 'architecture') && ids.has('SHM02')) {
    rows.push(['Street life before façade collecting', 'Use one continuous Hengfu walk and read entrances, setbacks, trees and reuse.', 'A checklist of famous buildings and private interiors.']);
  }
  if (ids.has('SHM04')) {
    rows.push(['One cultural question, not a museum marathon', 'Choose the museum branch that answers the guest’s actual China question on the travel date.', 'A second museum added only because it is nearby.']);
  }
  if (has(input, 'slow') || has(input, 'architecture')) {
    rows.push(['Recovery is part of the route', 'Protect a seated pause and an early stop when the reading question is already answered.', 'Nanjing Road or another transfer added for “more”.']);
  }
  if (ids.has('SHM06')) {
    rows.push(['Regeneration only while legible', 'Keep the working-waterfront segment only while industrial traces and public reuse can still be read.', 'Completing the whole riverfront as a distance goal.']);
  }
  return rows;
}

function routeExecutionCard(day, decision) {
  const core = day.modules[0];
  const optional = day.modules.slice(1);
  const corePoints = decision.selectedPoints.filter(point => point.module === core?.id);
  const first = corePoints[0]?.name || 'The first confirmed point in this day’s area';
  const last = corePoints.at(-1)?.name || 'The final confirmed point before the stop rule';
  const coreMovement = core?.decisionProfile?.point_mode === 'choose_one'
    ? `Choose one: ${corePoints.map(point => point.name).join(' or ')}`
    : corePoints.length > 1
      ? corePoints.map(point => point.name).join(' → ')
      : 'Keep the movement continuous inside one coherent area.';
  const optionalBranch = optional.length
    ? ` Optional branch only if energy, weather and dated access still work: ${optional.map(module => module.name).join(' + ')}.`
    : '';
  return {
    movement: coreMovement,
    exit: core?.decisionProfile?.point_mode === 'choose_one' ? 'the selected branch' : last,
    optionalBranch
  };
}

/**
 * Customer-facing V1.1 renderer.
 * It exposes the route thesis, trade-offs, reading questions and verification
 * ledger while keeping module IDs, raw sources and internal fields private.
 */
export function renderRoadbook(input = {}) {
  const decision = decide(input);
  const brief = intentBrief(input);
  const ledger = clientDecisionLedger(input, decision);
  const lines = [
    '# A Deeper China | Shanghai',
    '',
    '## Decision-led roadbook draft',
    '',
    `**Shape:** ${decision.days} day${decision.days > 1 ? 's' : ''} · ${decision.selectedModules.map(m => m.name).join(' · ')}`,
    `**Status:** ${decision.status}`,
    '',
    '## The route thesis',
    tripThesis(input, decision),
    '',
    '## Client decision brief',
    `- **What we heard:** ${brief.heard}.`,
    ...(brief.avoidances.length ? [`- **What we are protecting:** ${brief.avoidances.join(', ')}.`] : []),
    ...(brief.inferred.length ? ['- **What we inferred:**', ...brief.inferred.map(item => `  - ${item}`)] : []),
    '- **Route promise:** one readable urban question per day, with a shorter version available when weather, energy or access changes.',
    '',
    '## Why this route fits',
    '- It gives a first-time visitor an orientation frame before asking for detail.',
    '- It turns architecture into questions about money, migration, public life and reuse—not just façades.',
    '- It keeps one main idea per day and leaves an exit when heat, rain or tired feet change the plan.',
    '',
    '## What makes this a different kind of roadbook',
    '- This is not a ranking of Shanghai attractions and it is not a fixed booking promise.',
    '- Every day has one reading question, one physical anchor and one stop rule.',
    '- The route is allowed to become shorter when the guest has understood the idea; more stops are not automatically better.',
    '- The database is used to make and explain trade-offs, not to dump every researched place into the itinerary.',
    '',
    '## Client-specific decision ledger',
    ...(ledger.length ? [
      '| Decision | We chose | We deliberately gave up |',
      '|---|---|---|',
      ...ledger.map(([decisionName, chosen, sacrificed]) => `| ${decisionName} | ${chosen} | ${sacrificed} |`)
    ] : ['The route is provisional until the guest’s priorities and constraints are clear.']),
    '',
    '## What we deliberately leave out',
    ...[...skipList(input), ...exclusions(input, decision)].map(item => `- ${item}`),
    '',
    '## Day structure'
  ];
  for (const day of decision.dayPlan) {
    lines.push('', `### Day ${day.day} — ${day.theme}`);
    const execution = routeExecutionCard(day, decision);
    lines.push(`**Execution card:** Core: ${execution.movement} → stop at ${execution.exit}.${execution.optionalBranch}`);
    for (const module of day.modules) {
      const card = storyCardsByModule.get(module.id);
      const modulePoints = decision.selectedPoints.filter(point => point.module === module.id);
      const guidance = guidanceFor(module, modulePoints);
      lines.push(`- **Reading question:** ${module.question}`);
      if (card) lines.push(`- **Story lens:** ${card.title}`);
      lines.push(`- **Why it is here:** ${module.roles ? module.roles.split('|').join(', ') : 'selected for route coherence'}.`);
      if (module.decisionProfile?.why_this_over_nearby_alternative) {
        lines.push(`- **Why this over a nearby alternative:** ${module.decisionProfile.why_this_over_nearby_alternative}`);
      }
      lines.push(`- **Physical anchor:** ${guidance.anchor}`);
      lines.push(`- **What to notice:** ${guidance.notice}`);
      lines.push(`- **Stop rule:** ${guidance.stop}`);
      lines.push(`- **Main friction:** ${guidance.friction}`);
      const operation = operationFor(module);
      lines.push(`- **Route shape:** ${operation.shape}`);
      lines.push(`- **Body and time budget:** ${operation.body}`);
      lines.push(`- **Low-energy version:** ${operation.lowEnergy}`);
      lines.push(`- **Rain version:** ${operation.rain}`);
    }
  }
  lines.push('', '## Suggested points and how to use them', ...pointLines(decision.selectedPoints));
  lines.push('', '## How to use this on the day', '- Start with the day’s reading question, not with a race to the first landmark.', '- At each anchor, spend enough time to answer the question and then use the stop rule.', '- If the guest’s energy, weather or access changes, keep the question and use the shorter branch; do not silently replace the day with a generic attraction list.');
  lines.push('', '## Fallback logic', '- If heat, rain or crowding makes a long walk uncomfortable, keep the same question but shorten the outdoor segment and use one indoor cultural frame.', '- If arrival or departure reduces usable time, keep the river frame and one neighborhood walk; drop the second district rather than rushing both.', '- If the travelers prefer a quieter day, stay within one walkable area and add a longer meal or rest instead of another transfer.');
  if (decision.requiredFollowUps.length) lines.push('', '## Before I finalize it', ...decision.requiredFollowUps.map(q => `- ${q}`));
  lines.push('', '## Checks required before delivery', ...verificationLines(decision));
  lines.push('', '## Verification boundary', '- This is a tailored research draft, not a booking, live-availability check or guarantee of access.', '- We do not direct guests into residential compounds or frame strangers’ everyday activity as a spectacle.');
  if (decision.warnings.length) lines.push('', '## Important', ...decision.warnings.map(w => `- ${w}`));
  return lines.join('\n');
}
