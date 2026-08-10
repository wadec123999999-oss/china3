import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { productCatalog } from "../../shared/product-standard.mjs";

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const decisionLayerPath = path.resolve(runtimeDir, "../../chongqing-agent-database-20260729/重庆决策字段_V1.0.json");
const pointDecisionLayerPath = path.resolve(runtimeDir, "../../chongqing-agent-database-20260729/重庆点位决策字段_V1.0.json");
const decisionLayer = fs.existsSync(decisionLayerPath)
  ? JSON.parse(fs.readFileSync(decisionLayerPath, "utf8"))
  : { metadata: { version: "missing" }, modules: {} };
const pointDecisionLayer = fs.existsSync(pointDecisionLayerPath)
  ? JSON.parse(fs.readFileSync(pointDecisionLayerPath, "utf8"))
  : { metadata: { version: "missing" }, points: {} };

const INTENT_DIMENSIONS = [
  "视觉奇观",
  "历史理解",
  "在地生活",
  "饮食互动",
  "低摩擦",
  "摄影创作",
  "亲子教育",
  "复游新鲜感",
];

const PROFILE_KEYS = [
  "首次经典",
  "赛博摄影",
  "文化历史",
  "美食生活",
  "亲子轻松",
  "复游客",
];

const OUTPUT_LENGTH_LIMITS = {
  精简: 2,
  标准: 3,
  深度: 4,
};

const HIGH_STEP_MODULES = new Set(["RM10", "RM20"]);
const EXPOSED_HEIGHT_MODULES = new Set(["RM02", "RM05", "RM17", "RM21"]);
const FOOD_MODULES = new Set(["RM12", "RM23"]);
const MUSEUM_MODULES = new Set(["RM07", "RM11", "RM13", "RM15", "RM18", "RM24"]);
const NIGHT_MODULES = new Set(["RM04", "RM05", "RM06", "RM21"]);

function asStringArray(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return [];
}

function clamp(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, number));
}

export function validateInput(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return ["input must be an object"];
  }
  if (typeof input.requestId !== "string" || !input.requestId.trim()) {
    errors.push("requestId is required");
  }
  if (!["灵感", "路线规划", "询价", "行中改线", "供应商运营"].includes(input.stage)) {
    errors.push("stage must be one of 灵感/路线规划/询价/行中改线/供应商运营");
  }
  if (input.locale !== undefined && !["en", "zh-CN"].includes(input.locale)) {
    errors.push("locale must be en or zh-CN");
  }
  if (!input.trip || typeof input.trip !== "object") {
    errors.push("trip is required");
  } else {
    if (!Number.isInteger(input.trip.days) || input.trip.days < 1 || input.trip.days > 4) {
      errors.push("trip.days must be an integer from 1 to 4");
    }
    if (!PROFILE_KEYS.includes(input.trip.profile)) {
      errors.push(`trip.profile must be one of ${PROFILE_KEYS.join("/")}`);
    }
    if (!["低", "中", "高", "未知"].includes(input.trip.fitness)) {
      errors.push("trip.fitness must be 低/中/高/未知");
    }
    if (!["正常", "雨天", "炎热", "暴雨", "极端高温", "低能见度"].includes(input.trip.weather)) {
      errors.push("trip.weather is invalid");
    }
    if (!OUTPUT_LENGTH_LIMITS[input.trip.outputLength]) {
      errors.push("trip.outputLength must be 精简/标准/深度");
    }
  }
  if (input.intents && typeof input.intents !== "object") {
    errors.push("intents must be an object");
  }
  for (const [dimension, state] of Object.entries(input.intents ?? {})) {
    if (!INTENT_DIMENSIONS.includes(dimension)) errors.push(`unknown intent dimension: ${dimension}`);
    if (!state || typeof state !== "object") {
      errors.push(`intent ${dimension} must be an object`);
      continue;
    }
    if (clamp(state.intensity, 0, 5) !== Number(state.intensity)) {
      errors.push(`intent ${dimension}.intensity must be 0-5`);
    }
    if (clamp(state.confidence, 0, 1) !== Number(state.confidence)) {
      errors.push(`intent ${dimension}.confidence must be 0-1`);
    }
  }
  return errors;
}

function getConstraint(input, name) {
  return Boolean(input.constraints?.[name]);
}

function getLiveCheck(input, name) {
  return Boolean(input.liveChecks?.[name]);
}

function buildFollowUps(input) {
  const followUps = [];
  const add = (code, priority, question) => {
    if (!followUps.some((item) => item.code === code)) followUps.push({ code, priority, question });
  };

  if (getConstraint(input, "needsMobilityConfirmation") || input.trip.fitness === "未知") {
    add("mobility_detail", 1, "How long can everyone walk continuously, and are repeated stairs a problem?");
  }
  if (getConstraint(input, "wheelchair")) {
    add("wheelchair_accessibility", 1, "Can the wheelchair user transfer briefly, and what continuous-accessibility standard is required?");
  }
  if (getConstraint(input, "currentPain") || input.trip.weather === "暴雨" || input.trip.weather === "极端高温") {
    add("current_safety", 1, "What is everyone’s condition now, and should the exposed walking section stop immediately?");
  }
  if (getConstraint(input, "pregnancy")) {
    add("medical_boundary", 1, "Are there activity limits from your own medical professional that the route must follow?");
  }
  if (getConstraint(input, "severeAllergy") || getConstraint(input, "coeliac")) {
    add("food_allergy_sop", 1, "What ingredients and cross-contamination risks must be confirmed before any food activity?");
  } else if (getConstraint(input, "vegetarian") || getConstraint(input, "halal") || getConstraint(input, "nonSpicy")) {
    add("dietary_detail", 2, "Which ingredients, certification or shared-kitchen conditions are unacceptable?");
  }
  if (getConstraint(input, "commercialFilming")) {
    add("commercial_filming_scope", 1, "Is the filming commercial, what equipment is involved, and which permissions or releases are required?");
  }
  if (getConstraint(input, "drone")) {
    add("drone_compliance", 1, "What official airspace approval applies to the exact date and location?");
  }
  if (getConstraint(input, "residentPortraits") || getConstraint(input, "privateSpace")) {
    add("privacy_consent", 1, "Will you accept that venue and individual consent are required and that access may be refused?");
  }
  if (getConstraint(input, "holidayCrowds")) {
    add("holiday_crowd_plan", 1, "Would you prefer an earlier, more distant viewpoint if the core area is controlled?");
  }
  if (getConstraint(input, "lateNightReturn")) {
    add("return_plan", 1, "What is the latest acceptable return time, hotel area and preferred backup transport?");
  }
  if (getConstraint(input, "museumMonday") || getConstraint(input, "tomorrowOpening")) {
    add("venue_live_status", 1, "What exact date should be checked against the venue’s current official notice or phone confirmation?");
  }
  if (getConstraint(input, "dynamicEventSchedule")) {
    add("event_schedule", 1, "What exact date should be checked against the current official event notice?");
  }
  if (getConstraint(input, "transitSeatDetail")) {
    add("field_evidence_gap", 1, "Which direction, departure station and time period should the carriage position be tested for?");
  }
  if (getConstraint(input, "shortDepartureWindow")) {
    add("departure_logistics", 1, "Which station, hotel and luggage arrangement define the latest safe departure from the hotel area?");
  }
  if (getConstraint(input, "compareWulong")) {
    add("city_choice", 2, "Is the priority an urban story or a full day of natural scenery, and how much early travel is acceptable?");
  }
  if (getConstraint(input, "crossCityDayTrip")) {
    add("cross_city_feasibility", 1, "Would you change hotels or cities rather than force a long-distance return day?");
  }
  if (getConstraint(input, "supplierSelfClaim")) {
    add("supplier_due_diligence", 1, "Have identity, English test, price, cancellation, insurance, filming and settlement all been independently checked?");
  }
  if (getConstraint(input, "authenticityUndefined")) {
    add("definition_of_authentic", 2, "When you say ‘real’, do you mean everyday food, working neighbourhoods, history, or fewer crowds?");
  }
  if (getConstraint(input, "budgetUndefined")) {
    add("budget_scope", 3, "Would you rather pay for navigation certainty, deeper interpretation, human checking, or live accompaniment?");
  }
  if (!input.trip.arrivalDepartureKnown && input.stage === "路线规划") {
    add("arrival_departure", 2, "What time can you start on the first day, and when must you leave on the last day?");
  }
  if (!input.trip.hotelAreaKnown && input.stage === "路线规划") {
    add("hotel_area", 3, "Which hotel area or metro station should the door-to-door route use?");
  }

  return followUps.sort((a, b) => a.priority - b.priority).slice(0, 2);
}

function buildDynamicChecks(input) {
  const checks = new Set();
  if (getConstraint(input, "holidayCrowds")) checks.add("official_traffic_control");
  if (getConstraint(input, "drone")) checks.add("official_airspace_and_event_notice");
  if (getConstraint(input, "commercialFilming")) checks.add("commercial_filming_permission");
  if (getConstraint(input, "residentPortraits")) checks.add("venue_and_individual_consent");
  if (getConstraint(input, "wheelchair")) checks.add("continuous_accessibility_field_check");
  if (getConstraint(input, "museumMonday") || getConstraint(input, "tomorrowOpening")) checks.add("same_day_venue_status");
  if (getConstraint(input, "dynamicEventSchedule")) checks.add("current_official_event_schedule");
  if (getConstraint(input, "transitSeatDetail")) checks.add("field_test_carriage_and_direction");
  if (getConstraint(input, "supplierSelfClaim")) checks.add("supplier_seven_gate_due_diligence");
  if (getConstraint(input, "severeAllergy") || getConstraint(input, "coeliac") || getConstraint(input, "halal")) {
    checks.add("venue_food_safety_written_confirmation");
  }
  if (input.trip.weather !== "正常") checks.add("same_day_weather_and_route_condition");
  if (input.requestedModuleIds?.includes("RM16")) checks.add("line_2_service_and_liziba_construction");
  return [...checks];
}

function filterModule(module, input) {
  const id = module["模块ID"];
  const reasons = [];
  const confirmations = [];

  if (asStringArray(input.excludedModuleIds).includes(id)) reasons.push("explicitly_excluded");
  if ((input.trip.weather === "暴雨" || input.trip.weather === "极端高温" || getConstraint(input, "currentPain")) && HIGH_STEP_MODULES.has(id)) {
    reasons.push("unsafe_high_step_route");
  }
  if (input.trip.fitness === "低" && Number(module["体力1-3"]) === 3) reasons.push("fitness_hard_filter");
  if (getConstraint(input, "wheelchair") && !getLiveCheck(input, "continuousAccessibilityConfirmed")) {
    reasons.push("accessibility_unverified");
  }
  if (getConstraint(input, "fearOfHeights") && EXPOSED_HEIGHT_MODULES.has(id)) reasons.push("exposed_height_conflict");
  if ((getConstraint(input, "severeAllergy") || getConstraint(input, "coeliac")) && FOOD_MODULES.has(id) && !getLiveCheck(input, "foodSafetyConfirmed")) {
    reasons.push("food_safety_unverified");
  }
  if (getConstraint(input, "halal") && id === "RM12" && !getLiveCheck(input, "halalVenueConfirmed")) {
    reasons.push("halal_status_unverified");
  }
  if (input.trip.weather === "暴雨" && Number(module["雨天适配1-3"]) <= 1) reasons.push("weather_hard_filter");
  if (getConstraint(input, "museumMonday") && MUSEUM_MODULES.has(id) && !getLiveCheck(input, "venueOpenConfirmed")) {
    reasons.push("venue_opening_unverified");
  }
  if (getConstraint(input, "lateArrival") && !NIGHT_MODULES.has(id)) {
    reasons.push("arrival_window_too_short");
  }
  if (getConstraint(input, "shortDepartureWindow") && Number(module["时长(分钟)"]) > 75) {
    reasons.push("departure_window_too_short");
  }

  if (String(module["必须确认字段"] ?? "") !== "无") {
    confirmations.push(...String(module["必须确认字段"]).split("|").filter(Boolean));
  }
  if (id === "RM16") confirmations.push("李子坝施工与出口");
  if (id === "RM07") confirmations.push("湖广会馆当日开放与护照票务");
  if (id === "RM23") confirmations.push("店方许可与个人拍摄同意");

  return {
    eligible: reasons.length === 0,
    reasons,
    confirmations: [...new Set(confirmations)],
  };
}

function getModuleLocalization(database, moduleId, locale) {
  if (locale === "zh-CN") return null;
  return database.route_module_localizations?.find((item) =>
    (item["模块ID"] ?? item.module_id) === moduleId,
  ) ?? null;
}

function getPointProfiles(database, module) {
  const ids = String(module["点位ID"] ?? "").split("|").filter(Boolean);
  return ids.map((id) => {
    const point = database.points?.find((item) => item.ID === id);
    const profile = pointDecisionLayer.points?.[id];
    return profile
      ? { id, name: point?.["地点/体验"] ?? id, ...profile }
      : { id, name: point?.["地点/体验"] ?? id };
  });
}

function scoreModule(module, input) {
  const profileScore = Number(module[input.trip.profile] ?? 3);
  let score = Number(module["基础优先分"] ?? 0) + profileScore * 12;

  if (input.trip.fitness === "低") {
    if (Number(module["体力1-3"]) === 2) score -= Number(module["时长(分钟)"]) > 120 ? 30 : 15;
  } else if (input.trip.fitness === "中" && Number(module["体力1-3"]) === 3) {
    score -= 12;
  }

  if (input.trip.weather === "雨天" || input.trip.weather === "暴雨") {
    score += (Number(module["雨天适配1-3"]) - 3) * 15;
  }
  if (input.trip.weather === "炎热" || input.trip.weather === "极端高温") {
    score += (Number(module["炎热适配1-3"]) - 3) * 12;
  }

  for (const dimension of INTENT_DIMENSIONS) {
    const intent = input.intents?.[dimension];
    if (!intent || Number(intent.confidence) < 0.5) continue;
    score += (Number(module[dimension] ?? 3) - 3)
      * clamp(intent.intensity, 0, 5)
      * clamp(intent.confidence, 0, 1)
      * 1.5;
  }

  if (asStringArray(input.requestedModuleIds).includes(module["模块ID"])) score += 120;
  return Math.round(score * 100) / 100;
}

export function rankModules(database, input) {
  const validationErrors = validateInput(input);
  if (validationErrors.length) {
    const error = new Error(`invalid input: ${validationErrors.join("; ")}`);
    error.validationErrors = validationErrors;
    throw error;
  }

  const excluded = [];
  const ranked = [];
  for (const module of database.route_modules) {
    const filter = filterModule(module, input);
    if (!filter.eligible) {
      excluded.push({ moduleId: module["模块ID"], reasons: filter.reasons });
      continue;
    }
    const locale = input.locale ?? "en";
    const localization = getModuleLocalization(database, module["模块ID"], locale);
    const localizedConfirmations = localization?.["英文必须确认"];
    ranked.push({
      moduleId: module["模块ID"],
      defaultDay: module["默认日"],
      locale,
      name: localization?.["英文名称"] ?? module["模块名称"],
      sourceName: module["模块名称"],
      nodes: localization?.["英文核心节点"] ?? module["核心节点"],
      role: module["内容角色"],
      duplicateGroup: module["重复组"],
      durationMinutes: module["时长(分钟)"],
      score: scoreModule(module, input),
      confirmations: localizedConfirmations && localizedConfirmations !== "None"
        ? localizedConfirmations.split("|").filter(Boolean)
        : filter.confirmations,
      promise: localization?.["英文承诺"] ?? module["给游客的承诺"],
      explanation: localization?.["英文核心解释"] ?? module["只讲一个核心解释"],
      observationTask: localization?.["英文观察任务"] ?? module["游客观察任务"],
      practicalNote: localization?.["英文现实提醒"] ?? module["对客现实提醒"],
      localizationStatus: localization?.["编辑状态"] ?? "source_language_fallback",
      decisionProfile: decisionLayer.modules[module["模块ID"]] ?? null,
      pointProfiles: getPointProfiles(database, module),
    });
  }
  ranked.sort((a, b) => b.score - a.score || a.moduleId.localeCompare(b.moduleId));
  return { ranked, excluded };
}

function preferredDayNumber(defaultDay) {
  const match = String(defaultDay ?? "").match(/^D([1-4])/);
  return match ? Number(match[1]) : 4;
}

function moduleCategory(module) {
  const role = String(module.role ?? "");
  if (role.includes("引流钩子")) return "hook";
  if (role.includes("真实生活") || role.includes("付费体验")) return "life";
  return "core";
}

function requiredCategoryOrder(input, capacity) {
  const localIntent = input.intents?.在地生活;
  const foodIntent = input.intents?.饮食互动;
  const wantsLocalLife = [localIntent, foodIntent].some((state) =>
    state && Number(state.confidence) >= 0.5 && Number(state.intensity) >= 3,
  );

  let order;
  if (input.trip.profile === "美食生活") order = ["life", "core", "hook"];
  else if (input.trip.profile === "复游客") order = ["core", "life", "hook"];
  else order = ["hook", "core"];

  if (
    order.length < capacity
    && (input.trip.profile === "首次经典" || wantsLocalLife)
    && !order.includes("life")
  ) {
    order.push("life");
  }
  return order.slice(0, capacity);
}

function selectTripModules(ranked, input) {
  const perDayLimit = OUTPUT_LENGTH_LIMITS[input.trip.outputLength];
  const capacity = perDayLimit * input.trip.days;
  const selected = [];
  const groupCounts = new Map();

  const groupLimit = (candidate) =>
    candidate.duplicateGroup === "夜景/观景" ? Math.min(2, input.trip.days) : 1;
  const canAdd = (candidate) =>
    (groupCounts.get(candidate.duplicateGroup) ?? 0) < groupLimit(candidate);
  const add = (candidate) => {
    if (!candidate || selected.length >= capacity || !canAdd(candidate)) return false;
    selected.push(candidate);
    groupCounts.set(candidate.duplicateGroup, (groupCounts.get(candidate.duplicateGroup) ?? 0) + 1);
    return true;
  };

  for (const category of requiredCategoryOrder(input, capacity)) {
    add(ranked.find((candidate) =>
      moduleCategory(candidate) === category
      && !selected.some((item) => item.moduleId === candidate.moduleId)
      && canAdd(candidate),
    ));
  }

  for (const candidate of ranked) {
    if (selected.length >= capacity) break;
    if (selected.some((item) => item.moduleId === candidate.moduleId)) continue;
    add(candidate);
  }

  return selected;
}

function selectDays(ranked, input) {
  const limit = OUTPUT_LENGTH_LIMITS[input.trip.outputLength];
  const selected = selectTripModules(ranked, input)
    .sort((a, b) =>
      preferredDayNumber(a.defaultDay) - preferredDayNumber(b.defaultDay)
      || b.score - a.score
      || a.moduleId.localeCompare(b.moduleId),
    );
  const days = [];
  for (let day = 1; day <= input.trip.days; day += 1) {
    const modules = selected.slice((day - 1) * limit, day * limit);
    days.push({
      day,
      theme: modules[0]?.explanation ?? "This day requires manual redesign after the hard constraints are resolved.",
      modules,
    });
  }
  return days;
}

function parseRequiredChecks(experience) {
  return String(experience?.required_checks ?? experience?.["前置核验"] ?? "")
    .split("|")
    .filter(Boolean);
}

export function evaluateCommercialGate(database, input) {
  const purchase = input.purchase ?? {};
  const experienceId = purchase.experienceId ?? null;
  const experience = database.experience_products.find((item) =>
    (item.experience_id ?? item["产品ID"]) === experienceId,
  );
  if (!experience) {
    return {
      requestedExperienceId: experienceId,
      state: "no_verified_experience_selected",
      mayQuote: false,
      mayTakePayment: false,
      mayPromiseAvailability: false,
      action: purchase.asksPrice || purchase.asksBooking || purchase.asksPayment
        ? "offer_paid_roadbook_or_manual_consultation"
        : "roadbook_only",
      reason: experienceId ? "experience_not_found" : "no_experience_requested",
    };
  }

  const supplierId = experience.supplier_candidate_id ?? experience["候选供应商"];
  const supplier = database.supplier_candidates.find((item) =>
    (item.supplier_id ?? item["供应商ID"]) === supplierId,
  );
  const requiredChecks = parseRequiredChecks(experience);
  const launchPassed = requiredChecks.length > 0 && requiredChecks.every((checkId) => {
    const check = database.launch_field_checks.find((item) =>
      (item.launch_check_id ?? item["首发ID"]) === checkId,
    );
    return (check?.status ?? check?.["状态"]) === "通过";
  });
  const supplierPassed = (supplier?.admission_status ?? supplier?.["准入状态"]) === "可签约";
  const productReady = (experience.sales_status ?? experience["销售状态"]) === "可销售";
  const sellable = launchPassed && supplierPassed && productReady;

  return {
    requestedExperienceId: experienceId,
    supplierId,
    state: sellable ? "sellable" : "research_candidate",
    mayQuote: sellable,
    mayTakePayment: sellable,
    mayPromiseAvailability: false,
    action: sellable
      ? "enter_live_availability_and_checkout"
      : "offer_paid_roadbook_or_manual_waitlist",
    reason: sellable
      ? "all_launch_and_supplier_gates_passed"
      : "launch_or_supplier_gate_incomplete",
    customerMessage: sellable
      ? "The experience has passed the product gate; live availability still requires confirmation."
      : "This experience is a research candidate and still requires manual availability and safety confirmation.",
  };
}

function evaluateDigitalRoadbookGate(input, hasPriorityOneFollowUp) {
  const purchase = input.purchase ?? {};
  const customerAskedToBuy = Boolean(
    purchase.asksPrice || purchase.asksBooking || purchase.asksPayment || purchase.asksCancellation,
  );
  const intakeComplete = !hasPriorityOneFollowUp;
  return {
    state: intakeComplete ? "eligible_for_manual_review" : "intake_incomplete",
    mayOffer: true,
    mayTakePayment: intakeComplete,
    mayDeliver: intakeComplete,
    requiresHumanReview: true,
    action: intakeComplete
      ? (customerAskedToBuy ? "confirm_scope_then_sell_paid_roadbook" : "offer_paid_roadbook")
      : "collect_missing_trip_and_safety_details",
    reason: intakeComplete
      ? "digital_roadbook_is_separate_from_experience_inventory"
      : "priority_trip_or_safety_details_are_missing",
    boundary: "This permission applies only to a human-reviewed digital roadbook. It never authorises payment for a guide, venue, restaurant, transport, ticket or experience.",
  };
}

export function decide(database, input) {
  const { ranked, excluded } = rankModules(database, input);
  const followUps = buildFollowUps(input);
  const days = selectDays(ranked, input);
  const highPriorityFollowUp = followUps.some((item) => item.priority === 1);
  const commercial = {
    ...evaluateCommercialGate(database, input),
    digitalRoadbook: evaluateDigitalRoadbookGate(input, highPriorityFollowUp),
    productCatalog,
    recommendedProduct: highPriorityFollowUp ? "route_preview" : "human_checked_roadbook",
    quoteState: highPriorityFollowUp ? "intake_required_before_quote" : "eligible_for_human_scope_quote",
  };
  const usedIntents = [];
  const ignoredIntents = [];
  for (const [dimension, state] of Object.entries(input.intents ?? {})) {
    if (Number(state.confidence) >= 0.5) usedIntents.push(dimension);
    else ignoredIntents.push(dimension);
  }
  const selectedModuleIds = days.flatMap((day) => day.modules.map((module) => module.moduleId));
  return {
    requestId: input.requestId,
    databaseVersion: database.metadata.version,
    decisionLayerVersion: decisionLayer.metadata.version,
    pointDecisionLayerVersion: pointDecisionLayer.metadata.version,
    locale: input.locale ?? "en",
    status: highPriorityFollowUp ? "needs_confirmation" : "roadbook_draft_ready",
    followUps,
    days,
    commercial,
    audit: {
      usedIntentDimensions: usedIntents,
      ignoredLowConfidenceDimensions: ignoredIntents,
      dynamicChecks: buildDynamicChecks(input),
      excludedModules: excluded,
      rankedModuleIds: ranked.map((item) => item.moduleId),
      selectedModuleIds,
      dayAssignment: days.map((day) => ({
        day: day.day,
        moduleIds: day.modules.map((module) => module.moduleId),
      })),
      rule: "Hard constraints first; intents below 0.50 confidence do not affect ranking; modules are selected globally, diversified by role, then sequenced by narrative order.",
    },
  };
}

export const constants = {
  INTENT_DIMENSIONS,
  PROFILE_KEYS,
  OUTPUT_LENGTH_LIMITS,
};
