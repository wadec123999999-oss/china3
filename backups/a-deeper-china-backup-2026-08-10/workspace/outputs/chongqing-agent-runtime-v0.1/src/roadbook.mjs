const FITNESS_LABELS = {
  低: "lower walking load",
  中: "moderate walking load",
  高: "higher walking load",
  未知: "walking capacity still to be confirmed",
};

const PROFILE_LABELS = {
  首次经典: "first visit / classic orientation",
  赛博摄影: "cyberpunk photography",
  文化历史: "culture and history",
  美食生活: "food and everyday life",
  亲子轻松: "family and lower-friction pace",
  复游客: "repeat visit / deeper layer",
};

const INTENT_LABELS = {
  视觉奇观: "visual impact",
  历史理解: "historical understanding",
  在地生活: "everyday local life",
  饮食互动: "food interaction",
  低摩擦: "low-friction movement",
  摄影创作: "photography",
  亲子教育: "family learning",
  复游新鲜感: "freshness for a repeat visit",
};

const DYNAMIC_CHECK_LABELS = {
  official_traffic_control: "current official traffic and crowd-control notice",
  official_airspace_and_event_notice: "official airspace and event restrictions",
  commercial_filming_permission: "commercial-filming permission for the exact equipment and location",
  venue_and_individual_consent: "venue permission and each identifiable person’s consent",
  continuous_accessibility_field_check: "continuous step-free access from arrival point to exit",
  same_day_venue_status: "same-day venue opening and admission rules",
  current_official_event_schedule: "the current official event schedule",
  field_test_carriage_and_direction: "field-tested train direction and carriage position",
  supplier_seven_gate_due_diligence: "supplier identity, English, price, cancellation, insurance, filming and settlement evidence",
  venue_food_safety_written_confirmation: "written venue confirmation of ingredients and cross-contamination controls",
  same_day_weather_and_route_condition: "same-day weather and route-surface condition",
  line_2_service_and_liziba_construction: "Line 2 service and the current Liziba construction/exit arrangement",
};

const EXCLUSION_LABELS = {
  explicitly_excluded: "An option you explicitly excluded",
  unsafe_high_step_route: "A high-step route removed for current safety conditions",
  fitness_hard_filter: "A high-load route removed for the confirmed walking level",
  accessibility_unverified: "A route removed because continuous accessibility has not been field-verified",
  exposed_height_conflict: "An exposed-height option removed for the stated height boundary",
  food_safety_unverified: "A food module removed until written safety controls are confirmed",
  halal_status_unverified: "A food module removed until the halal requirement is confirmed",
  weather_hard_filter: "A route removed for current weather conditions",
  venue_opening_unverified: "A venue removed until opening is confirmed",
  arrival_window_too_short: "An option removed because it cannot fit the arrival window",
  departure_window_too_short: "An option removed because it cannot fit the departure window",
};

const ROUTE_CONTROLS = {
  RM04: {
    stop: "Stop once the visual geography is clear; do not spend the whole evening inside a shopping complex.",
    friction: "Crowding, heat, stairs and confusing exits can erase the intended slow pace.",
  },
  RM02: {
    stop: "End after one complete terrain experiment; do not stack several viewpoints just because they are nearby on a map.",
    friction: "Step intensity, construction, rain and map distance need live checking.",
  },
  RM03: {
    stop: "Leave when the transport geography is understood; preserve energy for the next district.",
    friction: "Traffic, heat, crowd load and river-edge access can change the usable route.",
  },
  RM12: {
    stop: "One well-understood meal is enough; do not turn food into a venue-hopping checklist.",
    friction: "Spice, waiting, shared tables and language need confirmation for the actual group.",
  },
  RM16: {
    stop: "Leave after the ride-and-viewpoint relationship is legible; do not promise a particular train or photo moment.",
    friction: "Service timing, crowding, platform movement and viewing conditions are dynamic.",
  },
};

// V1.2 execution cards: the route is sold as a considered movement pattern,
// not as a stack of Chongqing photo points. These cards stay customer-facing
// and never imply private access, live availability or a guaranteed view.
const ROUTE_OPERATIONS = {
  RM01: {
    shape: "One central-city orientation loop linking public religion, commerce and vertical movement.",
    body: "Lower walking load, but dense crossings and sensory load require a deliberate pause.",
    lowEnergy: "Keep the shortest public-street loop and remove the extra temple or shopping detour.",
    rain: "Use the indoor/religious layer and shorten the exposed street section after current access is checked.",
  },
  RM02: {
    shape: "One complete high/low transition; stop after the terrain experiment is understood.",
    body: "Short on the map but stair and elevation intensity can be high; do not judge it by minutes alone.",
    lowEnergy: "Use one platform and one lift/escalator option where confirmed; do not stack viewpoints.",
    rain: "Remove the exposed transition unless same-day surface and construction conditions are acceptable.",
  },
  RM03: {
    shape: "One river-gate reading from movement and infrastructure, not a sequence of skyline photographs.",
    body: "Moderate walking with heat, traffic and crowd exposure near the river edge.",
    lowEnergy: "Keep one accessible river-facing section and leave when the transport geography is legible.",
    rain: "Shorten the river edge and preserve the question with an indoor historical layer.",
  },
  RM04: {
    shape: "A night orientation arc outside the commercial core, using one skyline contrast and an early exit.",
    body: "Longer evening window with crowd, stairs, heat and return-transport friction.",
    lowEnergy: "Keep one clear external viewpoint and return before the route becomes a complex-navigation exercise.",
    rain: "Use the most reliable public edge only if lighting, access and weather conditions support it.",
  },
  RM05: {
    shape: "Choose one low-friction river movement—ropeway or cruise—only after conditions and queue cost are known.",
    body: "Lower walking load, but waiting, boarding and weather can dominate the experience.",
    lowEnergy: "Use the option with the clearest return path; do not add a second transport attraction.",
    rain: "Keep only if the selected operator and weather conditions are confirmed for the date.",
  },
  RM07: {
    shape: "One migration-and-waterway story linking a public heritage site to the river gate.",
    body: "Moderate walking with uneven surfaces and a meaningful amount of historical attention.",
    lowEnergy: "Keep the heritage anchor and remove the longer river connection.",
    rain: "Protect the indoor historical core and drop exposed movement if surfaces or access are poor.",
  },
  RM10: {
    shape: "One mountain-city walking experiment with a pre-set turnaround, not a test of endurance.",
    body: "High step and elevation load; this is a body decision before it is a sightseeing decision.",
    lowEnergy: "Do not use this module; replace it with a lower-load public-space or museum layer.",
    rain: "Remove it unless current route-surface and safety checks explicitly support continuation.",
  },
  RM12: {
    shape: "One meal as social observation—ordering, spice, sharing and pace—not a restaurant crawl.",
    body: "Low walking load but high waiting, dietary and communication sensitivity.",
    lowEnergy: "Keep one confirmed meal and remove any second food stop.",
    rain: "Food can remain the anchor, subject to written dietary and venue checks where required.",
  },
  RM13: {
    shape: "One indoor city-framework session before adding another district.",
    body: "Low physical load but high attention load; leave time to process the city model.",
    lowEnergy: "Use a shorter gallery route and the exterior civic contrast only if energy remains.",
    rain: "This is a strong weather branch after dated opening and admission checks.",
  },
  RM14: {
    shape: "One readable political/history street sequence, not a memorial checklist.",
    body: "Low-to-moderate walking with shade and opening-time dependence.",
    lowEnergy: "Keep one public historical segment and finish before adding another former residence.",
    rain: "Use the confirmed indoor sites and remove the longer street extension.",
  },
  RM16: {
    shape: "Ride first, then use the viewpoint to explain the transport relationship; do not chase a train moment.",
    body: "Low walking load, but service timing, platforms and crowding are dynamic.",
    lowEnergy: "Keep the ride-and-viewpoint pair and end immediately after the relationship is clear.",
    rain: "Keep only after same-day line, construction and exit conditions are checked.",
  },
  RM17: {
    shape: "One elevated-city comparison between a public park and a reused creative site.",
    body: "Moderate walking with height, stairs and evening return considerations.",
    lowEnergy: "Keep the park or the creative site, not both, based on the guest's actual question.",
    rain: "Use the confirmed indoor layer and remove exposed viewpoints.",
  },
  RM19: {
    shape: "One south-bank regeneration sequence linking port history, neighbourhood texture and public space.",
    body: "Longer walking and transfer exposure; route continuity must be checked on the ground.",
    lowEnergy: "Keep the most coherent public segment and cut the far end before fatigue hides the story.",
    rain: "Shorten to the confirmed indoor/covered history layer; do not force the full waterfront.",
  },
  RM20: {
    shape: "A mountain path only when the body, surface and return plan all support it.",
    body: "High step and descent load; not suitable as a casual add-on.",
    lowEnergy: "Replace with a lower-load city module.",
    rain: "Remove for rain or uncertain footing; keep the city story elsewhere.",
  },
  RM23: {
    shape: "One tea-house social-space observation, with participation kept optional and respectful.",
    body: "Low walking load; etiquette, seating and language matter more than distance.",
    lowEnergy: "Stay in one tea-house context and protect unstructured time.",
    rain: "A useful weather branch if current opening and public access are confirmed.",
  },
  RM24: {
    shape: "One material-memory layer linking industrial space, air-raid history or civic infrastructure.",
    body: "Moderate walking and attention load; the module can become too dense if overextended.",
    lowEnergy: "Choose one museum/industrial question and stop before adding the second site.",
    rain: "Strong indoor fallback after venue and admission checks.",
  },
};

function operationForModule(module) {
  const profile = module.decisionProfile;
  if (profile) {
    return {
      shape: profile.point_mode === "choose_one"
        ? "Choose one coherent branch; do not combine alternatives by default."
        : profile.point_mode === "method"
          ? "Use the method in one public setting, then stop before observation becomes extraction."
          : profile.point_mode === "conditional"
            ? "Use the core segment only while the route question remains legible; add no conditional branch without a dated check."
            : "Follow one coherent sequence and stop when the route question is answered.",
      body: profile.body_cost,
      lowEnergy: profile.low_energy_branch,
      rain: profile.rain_branch,
    };
  }
  return ROUTE_OPERATIONS[module.moduleId] ?? {
    shape: "Use one coherent public sequence to answer the module's question, then stop before adding another transfer.",
    body: "Walking, stairs, weather, crowding and access need a dated check.",
    lowEnergy: "Keep the shortest coherent version of this module.",
    rain: "Preserve the question and remove exposed movement unless current conditions support it.",
  };
}

function decisionBrief(request, decision) {
  const priorities = [];
  if (request.trip?.profile) priorities.push(PROFILE_LABELS[request.trip.profile] ?? "a tailored city route");
  for (const [name, state] of Object.entries(request.intents ?? {})) {
    if (Number(state?.confidence) >= 0.5 && Number(state?.intensity) >= 3) priorities.push(INTENT_LABELS[name] ?? "a stated interest");
  }
  const inferred = [];
  if (request.trip?.profile === "首次经典") inferred.push("A first visit needs a readable city frame before collecting viewpoints.");
  if (request.trip?.profile === "赛博摄影" || priorities.includes("视觉奇观")) inferred.push("The visual hook should explain Chongqing's stacked geography, not become a photo-position checklist.");
  if (request.trip?.fitness === "低" || request.trip?.weather !== "正常") inferred.push("Body and weather constraints are route decisions, not footnotes.");
  if (decision.followUps?.length) inferred.push("The route remains provisional until the highest-priority operating questions are answered.");
  return { priorities, inferred };
}

function deliberateExclusions(request, decision) {
  const items = [
    "A second skyline viewpoint added only to collect another photograph.",
    "A full Hongyadong commercial-complex tour when the visual geography is already clear.",
    "Residential interiors, staged resident encounters or intrusive photography.",
    "A Wulong day trip added automatically to a Chongqing city stay; the transfer must earn its place.",
  ];
  if (request.trip?.fitness === "低" || request.trip?.weather === "暴雨" || request.trip?.weather === "极端高温") {
    items.push("High-step mountain routes while the body and same-day surface conditions are not suitable.");
  }
  if (decision.audit?.excludedModules?.length) items.push("Modules excluded by the current safety, access or operating gates.");
  return items;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function markdownSafe(value) {
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

function clientDecisionLedger(decision, request) {
  const selected = decision.days.flatMap((day) => day.modules);
  const rows = [];
  if (selected.length) {
    rows.push({
      decision: "One question before more viewpoints",
      chosen: `Start with ${selected[0].name} as the first explanatory anchor.`,
      leftOut: "A second skyline or photo stop added only for visual quantity.",
    });
  }
  if (request.trip?.fitness === "低" || request.trip?.weather !== "正常") {
    rows.push({
      decision: "Body and weather are routing inputs",
      chosen: "Keep the shortest coherent version and remove exposed or high-step branches until current conditions support them.",
      leftOut: "A full mountain or waterfront sequence treated as mandatory.",
    });
  }
  if (selected.some((module) => module.decisionProfile?.point_mode === "choose_one")) {
    rows.push({
      decision: "Alternatives remain alternatives",
      chosen: "Choose one transport, museum, meal or high-point branch by the actual date and guest question.",
      leftOut: "Combining every option because it appears in the same module family.",
    });
  }
  if (selected.some((module) => String(module.decisionProfile?.release_boundary ?? "").includes("research_candidate"))) {
    rows.push({
      decision: "Research candidate is not a booking",
      chosen: "Keep hosted food, performance and tea-house ideas conditional until supplier and field gates pass.",
      leftOut: "Price, availability, guide or venue promises based on a lead or social post.",
    });
  }
  return rows;
}

export function buildRoadbookData(decision, request) {
  const dynamicChecks = decision.audit.dynamicChecks.map((code) => ({
    code,
    label: DYNAMIC_CHECK_LABELS[code] ?? code.replaceAll("_", " "),
  }));
  const exclusionReasons = unique(
    decision.audit.excludedModules.flatMap((item) =>
      item.reasons.map((reason) => EXCLUSION_LABELS[reason] ?? reason.replaceAll("_", " ")),
    ),
  );
  const openConfirmations = unique(
    decision.days.flatMap((day) => day.modules.flatMap((module) => module.confirmations)),
  );
  const brief = decisionBrief(request, decision);
  const ledger = clientDecisionLedger(decision, request);

  return {
    title: `Chongqing Roadbook — ${request.trip.days}-Day Plan`,
    locale: decision.locale,
    planningStatus: decision.status,
    planningSummary: {
      tripLength: `${request.trip.days} ${request.trip.days === 1 ? "day" : "days"}`,
      pace: FITNESS_LABELS[request.trip.fitness] ?? request.trip.fitness,
      modulesPerDayMaximum: { 精简: 2, 标准: 3, 深度: 4 }[request.trip.outputLength],
    },
    decisionBrief: brief,
    clientDecisionLedger: ledger,
    followUps: decision.followUps,
    days: decision.days.map((day) => ({
      day: day.day,
      theme: day.theme,
      modules: day.modules.map((module) => ({
        id: module.moduleId,
        name: module.name,
        nodes: module.nodes,
        durationMinutes: module.durationMinutes,
        promise: module.promise,
        explanation: module.explanation,
        observationTask: module.observationTask,
        practicalNote: module.practicalNote,
        whyThisOverNearbyAlternative: module.decisionProfile?.why_this_over_nearby_alternative ?? null,
        pointGuidance: module.pointProfiles.map((point) => ({
          name: point.name,
          guestValue: point.guest_value,
          chooseRule: point.choose_rule,
          stopAfter: point.stop_after,
          releaseStatus: point.release_status,
        })),
        stopRule: module.decisionProfile?.stop_condition ?? ROUTE_CONTROLS[module.moduleId]?.stop ?? "Stop when the route question is answered; preserve time for rest and unexpected city life.",
        mainFriction: ROUTE_CONTROLS[module.moduleId]?.friction ?? module.practicalNote ?? "Current access, weather, crowding and walking conditions need confirmation.",
        ...(() => {
          const operation = operationForModule(module);
          return {
            routeShape: operation.shape,
            bodyBudget: operation.body,
            lowEnergyVersion: operation.lowEnergy,
            rainVersion: operation.rain,
          };
        })(),
        confirmations: module.confirmations,
      })),
    })),
    releaseChecks: dynamicChecks,
    openConfirmations,
    exclusionReasons,
    deliberateExclusions: deliberateExclusions(request, decision),
    commercial: decision.commercial,
    deliberateLimit: "The route uses a fixed daily information budget; additional ranked places were left out rather than compressed into an unrealistic checklist.",
  };
}

export function renderRoadbookMarkdown(decision, request) {
  const roadbook = buildRoadbookData(decision, request);
  const lines = [
    `# ${roadbook.title}`,
    "",
    roadbook.planningStatus === "needs_confirmation"
      ? "> Planning status: **draft awaiting essential confirmation**. Do not treat this as a released route yet."
      : "> Planning status: **route draft ready**. Live opening, weather and operational checks may still be required before release.",
    "",
    "## Design frame",
    "",
    `- Available time: ${roadbook.planningSummary.tripLength}`,
    `- Intended pace: ${roadbook.planningSummary.pace}`,
    `- Information budget: no more than ${roadbook.planningSummary.modulesPerDayMaximum} modules per day`,
    "",
    "Hard constraints were applied before preferences. The route deliberately favours a coherent explanation of Chongqing over a checklist of attractions.",
  ];

  lines.push("", "## Client decision brief", "");
  lines.push(`- **What we heard:** ${roadbook.decisionBrief.priorities.length ? roadbook.decisionBrief.priorities.join(", ") : "a coherent reading of Chongqing"}.`);
  if (roadbook.decisionBrief.inferred.length) {
    lines.push("- **What we inferred:**");
    for (const item of roadbook.decisionBrief.inferred) lines.push(`  - ${markdownSafe(item)}`);
  }
  lines.push("- **Route promise:** one readable city question at a time, with a shorter version when body, weather or access changes.");

  if (roadbook.followUps.length) {
    lines.push("", "## Confirm before the route is released", "");
    for (const item of roadbook.followUps) lines.push(`- ${markdownSafe(item.question)}`);
  }

  lines.push("", "## Client decision ledger", "");
  if (roadbook.clientDecisionLedger.length) {
    lines.push("| Decision | We chose | We deliberately left out |", "|---|---|---|");
    for (const row of roadbook.clientDecisionLedger) {
      lines.push(`| ${markdownSafe(row.decision)} | ${markdownSafe(row.chosen)} | ${markdownSafe(row.leftOut)} |`);
    }
  } else {
    lines.push("The route is provisional until the guest’s priorities and constraints are clear.");
  }

  for (const day of roadbook.days) {
    lines.push("", `## Day ${day.day} — ${markdownSafe(day.theme)}`, "");
    if (day.modules.length === 0) {
      lines.push("No route is proposed for this day until the blocking safety or accessibility question is resolved.");
      continue;
    }
    for (const module of day.modules) {
      lines.push(
        `### ${markdownSafe(module.name)}`,
        "",
        `**Where:** ${markdownSafe(module.nodes)}  `,
        `**Working duration:** about ${module.durationMinutes} minutes`,
        "",
        markdownSafe(module.promise),
        "",
        `**The one idea to carry:** ${markdownSafe(module.explanation)}`,
        "",
        module.whyThisOverNearbyAlternative
          ? `**Why this over a nearby alternative:** ${markdownSafe(module.whyThisOverNearbyAlternative)}`
          : "",
        module.whyThisOverNearbyAlternative ? "" : "",
        `**Your observation task:** ${markdownSafe(module.observationTask)}`,
        "",
        `**Reality check:** ${markdownSafe(module.practicalNote)}`,
        "",
        `**Stop rule:** ${markdownSafe(module.stopRule)}`,
        "",
        `**Main friction:** ${markdownSafe(module.mainFriction)}`,
        "",
        `**Route shape:** ${markdownSafe(module.routeShape)}`,
        "",
        `**Body and time budget:** ${markdownSafe(module.bodyBudget)}`,
        "",
        `**Low-energy version:** ${markdownSafe(module.lowEnergyVersion)}`,
        "",
        `**Rain version:** ${markdownSafe(module.rainVersion)}`,
      );
      if (module.pointGuidance?.length) {
        lines.push("", "**How to use the points:**");
        for (const point of module.pointGuidance) {
          if (!point.guestValue) continue;
          lines.push(`- **${markdownSafe(point.name)}:** ${markdownSafe(point.guestValue)} Use when: ${markdownSafe(point.chooseRule)} Stop after: ${markdownSafe(point.stopAfter)}`);
        }
      }
      if (module.confirmations.length) {
        lines.push("", `**Confirm before release:** ${module.confirmations.map(markdownSafe).join("; ")}.`);
      }
      lines.push("");
    }
  }

  lines.push("", "## Release checks", "");
  if (roadbook.releaseChecks.length) {
    for (const item of roadbook.releaseChecks) lines.push(`- Check ${markdownSafe(item.label)}.`);
  } else {
    lines.push("- No extra dynamic trigger was generated from the current request. Venue-level confirmations shown inside each module still apply.");
  }
  for (const confirmation of roadbook.openConfirmations) {
    lines.push(`- Confirm: ${markdownSafe(confirmation)}.`);
  }

  lines.push("", "## What was deliberately left out", "", `- ${roadbook.deliberateLimit}`);
  for (const item of roadbook.deliberateExclusions) lines.push(`- ${markdownSafe(item)}`);
  for (const reason of roadbook.exclusionReasons) lines.push(`- ${markdownSafe(reason)}.`);

  lines.push("", "## Booking boundary", "");
  if (roadbook.commercial.mayQuote && roadbook.commercial.mayTakePayment) {
    lines.push("The selected experience has passed the static product gate. Price and live availability still require the current booking response.");
  } else if (roadbook.commercial.state === "research_candidate") {
    lines.push("Any hosted experience mentioned here is still a research candidate. This roadbook does not confirm a guide, venue, price, booking or availability, and no experience payment should be taken.");
  } else {
    lines.push("This is a roadbook, not a confirmed guided-experience booking. No guide, venue, price or availability is promised.");
  }

  lines.push("");
  return lines.join("\n");
}
