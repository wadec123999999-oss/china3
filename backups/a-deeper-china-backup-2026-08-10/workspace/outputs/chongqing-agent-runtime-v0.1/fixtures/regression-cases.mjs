const DEFAULT_REQUEST = {
  stage: "路线规划",
  trip: {
    days: 3,
    profile: "首次经典",
    fitness: "中",
    weather: "正常",
    outputLength: "标准",
    arrivalDepartureKnown: true,
    hotelAreaKnown: true,
  },
  intents: {},
  constraints: {},
  liveChecks: {},
  requestedModuleIds: [],
  excludedModuleIds: [],
  purchase: {
    experienceId: null,
    asksPrice: false,
    asksBooking: false,
    asksPayment: false,
    asksCancellation: false,
  },
};

function request(id, patch = {}) {
  return {
    ...DEFAULT_REQUEST,
    ...patch,
    requestId: id,
    trip: { ...DEFAULT_REQUEST.trip, ...(patch.trip ?? {}) },
    intents: { ...DEFAULT_REQUEST.intents, ...(patch.intents ?? {}) },
    constraints: { ...DEFAULT_REQUEST.constraints, ...(patch.constraints ?? {}) },
    liveChecks: { ...DEFAULT_REQUEST.liveChecks, ...(patch.liveChecks ?? {}) },
    purchase: { ...DEFAULT_REQUEST.purchase, ...(patch.purchase ?? {}) },
    requestedModuleIds: patch.requestedModuleIds ?? [],
    excludedModuleIds: patch.excludedModuleIds ?? [],
  };
}

const intent = (intensity, confidence, evidenceQuote = "fixture evidence") => ({
  intensity,
  confidence,
  evidenceQuote,
});

export const regressionCases = [
  {
    id: "TC01",
    sourceConversation: "第一次来，3天，和妈妈，不想太累，想拍特别的城市感，也不想全是网红。",
    input: request("TC01", {
      trip: { fitness: "低", arrivalDepartureKnown: false, hotelAreaKnown: false },
      intents: {
        视觉奇观: intent(5, 0.95),
        在地生活: intent(4, 0.8),
        低摩擦: intent(5, 0.75),
        历史理解: intent(2, 0.35),
      },
      constraints: { needsMobilityConfirmation: true },
      requestedModuleIds: ["RM02", "RM04", "RM16", "RM13", "RM07"],
      purchase: { experienceId: "EXP-CQ-001" },
    }),
    expect: { followUps: ["mobility_detail"], rankedAny: ["RM02", "RM04"], ignoredIntents: ["历史理解"], commercialState: "research_candidate" },
  },
  {
    id: "TC02",
    sourceConversation: "洪崖洞李子坝都去过。这次想了解开埠和普通人的生活，不爱排队。",
    input: request("TC02", {
      trip: { profile: "复游客", days: 4 },
      intents: { 历史理解: intent(5, 0.95), 在地生活: intent(5, 0.95), 复游新鲜感: intent(5, 0.95), 低摩擦: intent(4, 0.8) },
      requestedModuleIds: ["RM08", "RM19", "RM22", "RM23", "RM24"],
      excludedModuleIds: ["RM04", "RM16"],
    }),
    expect: { rankedAny: ["RM08", "RM19", "RM22"], excludedModules: ["RM04", "RM16"], usedIntents: ["历史理解", "在地生活", "复游新鲜感"] },
  },
  {
    id: "TC03",
    sourceConversation: "I have two days to film Chongqing for YouTube. Cyberpunk visuals matter most.",
    input: request("TC03", {
      trip: { days: 2, profile: "赛博摄影", fitness: "高" },
      intents: { 视觉奇观: intent(5, 1), 摄影创作: intent(5, 1) },
      constraints: { commercialFilming: true },
      requestedModuleIds: ["RM02", "RM04", "RM16", "RM17"],
    }),
    expect: { followUps: ["commercial_filming_scope"], dynamicChecks: ["commercial_filming_permission"], rankedAny: ["RM02", "RM04", "RM16"] },
  },
  {
    id: "TC04",
    sourceConversation: "带8岁孩子，雨天，不吃辣，孩子喜欢火车和博物馆。",
    input: request("TC04", {
      trip: { profile: "亲子轻松", weather: "雨天", fitness: "低" },
      intents: { 亲子教育: intent(5, 1), 低摩擦: intent(5, 0.9), 历史理解: intent(3, 0.7) },
      constraints: { nonSpicy: true },
      requestedModuleIds: ["RM13", "RM16", "RM18", "RM05"],
    }),
    expect: { followUps: ["dietary_detail"], dynamicChecks: ["same_day_weather_and_route_condition"], rankedAny: ["RM13", "RM16"] },
  },
  {
    id: "TC05",
    sourceConversation: "预算没问题，想要小众、真实，不想被推销。你直接安排。",
    input: request("TC05", {
      stage: "灵感",
      trip: { profile: "复游客" },
      intents: { 在地生活: intent(5, 0.8), 复游新鲜感: intent(5, 0.8) },
      constraints: { authenticityUndefined: true, budgetUndefined: true },
      requestedModuleIds: ["RM06", "RM22", "RM23", "RM19"],
    }),
    expect: { followUps: ["definition_of_authentic", "budget_scope"], rankedAny: ["RM22", "RM19"] },
  },
  {
    id: "TC06",
    sourceConversation: "只有两天，但洪崖洞、长江索道、游船、李子坝、十八梯和博物馆都想去。",
    input: request("TC06", {
      trip: { days: 2, outputLength: "标准" },
      requestedModuleIds: ["RM04", "RM05", "RM10", "RM13", "RM16"],
    }),
    expect: { maxModulesPerDay: 3, totalDays: 2, rankedAny: ["RM04", "RM16"] },
  },
  {
    id: "TC07",
    sourceConversation: "My father is 72. He can walk, but repeated stairs hurt his knees.",
    input: request("TC07", {
      trip: { fitness: "低" },
      constraints: { needsMobilityConfirmation: true },
      requestedModuleIds: ["RM02", "RM05", "RM13", "RM16"],
    }),
    expect: { followUps: ["mobility_detail"], excludedModules: ["RM10", "RM20"], rankedAny: ["RM13", "RM16"] },
  },
  {
    id: "TC08",
    sourceConversation: "One of us uses a wheelchair. Can we do Kuixinglou, Hongyadong and the riverfront?",
    input: request("TC08", {
      trip: { fitness: "低" },
      constraints: { wheelchair: true },
      requestedModuleIds: ["RM02", "RM04", "RM03"],
    }),
    expect: { followUps: ["wheelchair_accessibility"], dynamicChecks: ["continuous_accessibility_field_check"], excludedModules: ["RM02", "RM03", "RM04"] },
  },
  {
    id: "TC09",
    sourceConversation: "I love architecture but I’m seriously afraid of exposed heights and glass bridges.",
    input: request("TC09", {
      trip: { profile: "文化历史" },
      constraints: { fearOfHeights: true },
      requestedModuleIds: ["RM01", "RM07", "RM13", "RM14"],
    }),
    expect: { excludedModules: ["RM02", "RM05", "RM17", "RM21"], rankedAny: ["RM07", "RM13", "RM14"] },
  },
  {
    id: "TC10",
    sourceConversation: "I’ll be 24 weeks pregnant and visiting in August. I want an easy city day.",
    input: request("TC10", {
      trip: { fitness: "低", weather: "极端高温", profile: "亲子轻松" },
      constraints: { pregnancy: true },
      requestedModuleIds: ["RM13", "RM16", "RM05"],
    }),
    expect: { followUps: ["current_safety", "medical_boundary"], dynamicChecks: ["same_day_weather_and_route_condition"], excludedModules: ["RM10", "RM20"] },
  },
  {
    id: "TC11",
    sourceConversation: "We have a four-year-old and a stroller. Can we wander Shancheng Alley and Shibati?",
    input: request("TC11", {
      trip: { profile: "亲子轻松", fitness: "低" },
      constraints: { needsMobilityConfirmation: true },
      requestedModuleIds: ["RM10", "RM13", "RM16"],
    }),
    expect: { followUps: ["mobility_detail"], excludedModules: ["RM10"], rankedAny: ["RM13", "RM16"] },
  },
  {
    id: "TC12",
    sourceConversation: "My 14-year-old is into trains, engineering and city systems.",
    input: request("TC12", {
      trip: { profile: "亲子轻松" },
      intents: { 亲子教育: intent(5, 1), 视觉奇观: intent(4, 0.8), 历史理解: intent(3, 0.6) },
      requestedModuleIds: ["RM02", "RM16", "RM24"],
    }),
    expect: { rankedAny: ["RM02", "RM16", "RM24"], usedIntents: ["亲子教育"] },
  },
  {
    id: "TC13",
    sourceConversation: "I have a severe peanut allergy. Is your noodle and hotpot experience safe?",
    input: request("TC13", {
      stage: "询价",
      trip: { profile: "美食生活" },
      constraints: { severeAllergy: true },
      requestedModuleIds: ["RM12"],
      purchase: { experienceId: "EXP-CQ-002", asksPrice: true },
    }),
    expect: { followUps: ["food_allergy_sop"], dynamicChecks: ["venue_food_safety_written_confirmation"], excludedModules: ["RM12"], commercialState: "research_candidate", mayQuote: false },
  },
  {
    id: "TC14",
    sourceConversation: "We are vegetarian and don’t eat spicy food, but want to understand food culture.",
    input: request("TC14", {
      trip: { profile: "美食生活" },
      constraints: { vegetarian: true, nonSpicy: true },
      requestedModuleIds: ["RM12", "RM07"],
    }),
    expect: { followUps: ["dietary_detail"], rankedAny: ["RM12"], excludedModulesAbsent: ["RM12"] },
  },
  {
    id: "TC15",
    sourceConversation: "We need halal food and clear ingredient questions.",
    input: request("TC15", {
      trip: { profile: "美食生活" },
      constraints: { halal: true },
      requestedModuleIds: ["RM12"],
    }),
    expect: { followUps: ["dietary_detail"], dynamicChecks: ["venue_food_safety_written_confirmation"], excludedModules: ["RM12"] },
  },
  {
    id: "TC16",
    sourceConversation: "I have coeliac disease. Can I safely try local noodles or hotpot?",
    input: request("TC16", {
      trip: { profile: "美食生活" },
      constraints: { coeliac: true },
      requestedModuleIds: ["RM12"],
    }),
    expect: { followUps: ["food_allergy_sop"], excludedModules: ["RM12"], dynamicChecks: ["venue_food_safety_written_confirmation"] },
  },
  {
    id: "TC17",
    sourceConversation: "I’m a solo woman. I want night photos but don’t want to be stranded.",
    input: request("TC17", {
      trip: { profile: "赛博摄影", hotelAreaKnown: false },
      constraints: { lateNightReturn: true },
      requestedModuleIds: ["RM04", "RM06"],
    }),
    expect: { followUps: ["return_plan"], rankedAny: ["RM04", "RM06"] },
  },
  {
    id: "TC18",
    sourceConversation: "We are a same-sex couple and prefer discreet, welcoming spaces. We don’t need nightlife.",
    input: request("TC18", {
      trip: { profile: "文化历史" },
      requestedModuleIds: ["RM01", "RM07", "RM13", "RM16"],
      excludedModuleIds: ["RM06"],
    }),
    expect: { rankedAny: ["RM01", "RM07", "RM13"], excludedModules: ["RM06"] },
  },
  {
    id: "TC19",
    sourceConversation: "We’re a three-person production crew with two cameras and a tripod. Can your guide get us permits?",
    input: request("TC19", {
      stage: "询价",
      trip: { profile: "赛博摄影" },
      constraints: { commercialFilming: true },
      purchase: { experienceId: "EXP-CQ-001", asksPrice: true, asksBooking: true },
    }),
    expect: { followUps: ["commercial_filming_scope"], dynamicChecks: ["commercial_filming_permission"], commercialState: "research_candidate", mayQuote: false },
  },
  {
    id: "TC20",
    sourceConversation: "Where should I fly my drone for the Chongqing skyline?",
    input: request("TC20", {
      constraints: { drone: true },
      intents: { 摄影创作: intent(5, 1) },
    }),
    expect: { followUps: ["drone_compliance"], dynamicChecks: ["official_airspace_and_event_notice"], status: "needs_confirmation" },
  },
  {
    id: "TC21",
    sourceConversation: "I only need the best tripod positions for blue hour. No history.",
    input: request("TC21", {
      trip: { profile: "赛博摄影" },
      intents: { 摄影创作: intent(5, 1), 历史理解: intent(0, 1) },
      constraints: { commercialFilming: true },
      requestedModuleIds: ["RM04", "RM17"],
    }),
    expect: { followUps: ["commercial_filming_scope"], rankedAny: ["RM04", "RM17"] },
  },
  {
    id: "TC22",
    sourceConversation: "I want candid portraits of old men playing cards in a traditional teahouse.",
    input: request("TC22", {
      trip: { profile: "美食生活" },
      constraints: { residentPortraits: true, privateSpace: true },
      requestedModuleIds: ["RM23", "RM22"],
    }),
    expect: { followUps: ["privacy_consent"], dynamicChecks: ["venue_and_individual_consent"], rankedAny: ["RM23", "RM22"] },
  },
  {
    id: "TC23",
    sourceConversation: "My total activity budget is RMB 500 for two people. What should we pay for?",
    input: request("TC23", {
      stage: "询价",
      constraints: { budgetUndefined: true },
      purchase: { asksPrice: true },
    }),
    expect: { followUps: ["budget_scope"], commercialAction: "offer_paid_roadbook_or_manual_consultation", mayQuote: false },
  },
  {
    id: "TC24",
    sourceConversation: "Budget isn’t an issue. I want the most exclusive Chongqing experience.",
    input: request("TC24", {
      stage: "询价",
      trip: { profile: "复游客" },
      constraints: { authenticityUndefined: true, privateSpace: true },
      purchase: { experienceId: "EXP-CQ-003", asksPrice: true, asksBooking: true },
    }),
    expect: { followUps: ["privacy_consent", "definition_of_authentic"], commercialState: "research_candidate", mayQuote: false },
  },
  {
    id: "TC25",
    sourceConversation: "We’re comfortable paying for something worthwhile, but don’t know what it should cost.",
    input: request("TC25", {
      constraints: { budgetUndefined: true },
    }),
    expect: { followUps: ["budget_scope"], commercialAction: "roadbook_only" },
  },
  {
    id: "TC26",
    sourceConversation: "We are in Jiefangbei now. Can someone guide us in two hours?",
    input: request("TC26", {
      stage: "询价",
      trip: { days: 1 },
      purchase: { experienceId: "EXP-CQ-001", asksBooking: true },
    }),
    expect: { commercialState: "research_candidate", commercialAction: "offer_paid_roadbook_or_manual_waitlist", mayQuote: false, mayTakePayment: false },
  },
  {
    id: "TC27",
    sourceConversation: "We’ll be there during Golden Week and want Hongyadong at night.",
    input: request("TC27", {
      trip: { profile: "赛博摄影" },
      constraints: { holidayCrowds: true },
      requestedModuleIds: ["RM04", "RM05"],
    }),
    expect: { followUps: ["holiday_crowd_plan"], dynamicChecks: ["official_traffic_control"], rankedAny: ["RM04", "RM05"] },
  },
  {
    id: "TC28",
    sourceConversation: "It’s raining hard right now. Should we still do the Mountain City Trail?",
    input: request("TC28", {
      stage: "行中改线",
      trip: { weather: "暴雨", fitness: "中" },
      requestedModuleIds: ["RM10"],
    }),
    expect: { followUps: ["current_safety"], excludedModules: ["RM10", "RM20"], dynamicChecks: ["same_day_weather_and_route_condition"] },
  },
  {
    id: "TC29",
    sourceConversation: "It’s 40°C and we planned three outdoor high-load places this afternoon.",
    input: request("TC29", {
      stage: "行中改线",
      trip: { weather: "极端高温", fitness: "低" },
      requestedModuleIds: ["RM03", "RM04", "RM10"],
    }),
    expect: { followUps: ["current_safety"], excludedModules: ["RM10", "RM20"], dynamicChecks: ["same_day_weather_and_route_condition"] },
  },
  {
    id: "TC30",
    sourceConversation: "The skyline is completely fogged in. Is Eling still worth it?",
    input: request("TC30", {
      stage: "行中改线",
      trip: { weather: "低能见度", profile: "赛博摄影" },
      requestedModuleIds: ["RM17"],
    }),
    expect: { rankedAny: ["RM17"], dynamicChecks: ["same_day_weather_and_route_condition"] },
  },
  {
    id: "TC31",
    sourceConversation: "Our hotel is near the airport, but all plans start in Jiefangbei at 8 a.m.",
    input: request("TC31", {
      trip: { hotelAreaKnown: false },
    }),
    expect: { followUps: ["hotel_area"] },
  },
  {
    id: "TC32",
    sourceConversation: "Our train arrives at Chongqingbei at 6:30 p.m. Can we still see Hongyadong and take a cruise?",
    input: request("TC32", {
      trip: { days: 1, profile: "赛博摄影" },
      constraints: { lateArrival: true },
      requestedModuleIds: ["RM04", "RM05"],
    }),
    expect: { rankedAny: ["RM04", "RM05"], excludedModules: ["RM03", "RM07", "RM10", "RM12", "RM13", "RM14", "RM17", "RM19", "RM20", "RM22", "RM24"] },
  },
  {
    id: "TC33",
    sourceConversation: "We leave for Chengdu at 11 a.m. What can we do before the train?",
    input: request("TC33", {
      trip: { days: 1, outputLength: "精简" },
      constraints: { shortDepartureWindow: true },
    }),
    expect: { followUps: ["departure_logistics"], excludedModules: ["RM04", "RM07", "RM10", "RM12", "RM13", "RM14", "RM17", "RM18", "RM19", "RM20", "RM21", "RM22", "RM24"] },
  },
  {
    id: "TC34",
    sourceConversation: "Can we do six attractions across the city in one day?",
    input: request("TC34", {
      trip: { days: 1, outputLength: "标准" },
      requestedModuleIds: ["RM04", "RM10", "RM13", "RM16"],
    }),
    expect: { maxModulesPerDay: 3, totalDays: 1 },
  },
  {
    id: "TC35",
    sourceConversation: "We have three days. Should one full day be Wulong, or should we stay in the city?",
    input: request("TC35", {
      constraints: { compareWulong: true },
    }),
    expect: { followUps: ["city_choice"] },
  },
  {
    id: "TC36",
    sourceConversation: "Could we do Mount Emei and Leshan as a day trip from Chongqing?",
    input: request("TC36", {
      constraints: { crossCityDayTrip: true },
    }),
    expect: { followUps: ["cross_city_feasibility"], status: "needs_confirmation" },
  },
  {
    id: "TC37",
    sourceConversation: "This is my third visit. I want migration history and wartime diplomacy.",
    input: request("TC37", {
      trip: { profile: "复游客" },
      intents: { 历史理解: intent(5, 1), 复游新鲜感: intent(5, 1) },
      requestedModuleIds: ["RM07", "RM08", "RM14", "RM15"],
      excludedModuleIds: ["RM04", "RM16"],
    }),
    expect: { rankedAny: ["RM07", "RM08", "RM14", "RM15"], excludedModules: ["RM04", "RM16"] },
  },
  {
    id: "TC38",
    sourceConversation: "I want the real Chongqing, not tourist places.",
    input: request("TC38", {
      stage: "灵感",
      trip: { profile: "复游客" },
      constraints: { authenticityUndefined: true },
      intents: { 在地生活: intent(5, 0.6) },
    }),
    expect: { followUps: ["definition_of_authentic"], usedIntents: ["在地生活"] },
  },
  {
    id: "TC39",
    sourceConversation: "We want local nightlife after 10 p.m., not a sightseeing cruise.",
    input: request("TC39", {
      trip: { profile: "美食生活" },
      constraints: { lateNightReturn: true },
      requestedModuleIds: ["RM06"],
      excludedModuleIds: ["RM05"],
    }),
    expect: { followUps: ["return_plan"], rankedAny: ["RM06"], excludedModules: ["RM05"] },
  },
  {
    id: "TC40",
    sourceConversation: "We’d like a quiet teahouse where we can talk to local people and take photos.",
    input: request("TC40", {
      trip: { profile: "美食生活" },
      constraints: { residentPortraits: true, privateSpace: true },
      requestedModuleIds: ["RM23", "RM22"],
      purchase: { experienceId: "EXP-CQ-003", asksBooking: true },
    }),
    expect: { followUps: ["privacy_consent"], dynamicChecks: ["venue_and_individual_consent"], commercialState: "research_candidate" },
  },
  {
    id: "TC41",
    sourceConversation: "Why are there so many guild halls and place names from other provinces?",
    input: request("TC41", {
      trip: { profile: "文化历史" },
      intents: { 历史理解: intent(5, 1) },
      requestedModuleIds: ["RM07", "RM08", "RM03"],
    }),
    expect: { rankedAny: ["RM07", "RM08", "RM03"], usedIntents: ["历史理解"] },
  },
  {
    id: "TC42",
    sourceConversation: "I’m an urban designer. I care about circulation, retaining walls and public space on slopes.",
    input: request("TC42", {
      trip: { profile: "文化历史", fitness: "高" },
      intents: { 历史理解: intent(4, 0.9), 视觉奇观: intent(4, 0.8) },
      requestedModuleIds: ["RM02", "RM10", "RM16", "RM17"],
    }),
    expect: { rankedAny: ["RM02", "RM10", "RM16", "RM17"] },
  },
  {
    id: "TC43",
    sourceConversation: "I’m a transit fan. Which side of Line 2 should I sit on, and what car is best?",
    input: request("TC43", {
      constraints: { transitSeatDetail: true },
      requestedModuleIds: ["RM16"],
    }),
    expect: { followUps: ["field_evidence_gap"], dynamicChecks: ["field_test_carriage_and_direction", "line_2_service_and_liziba_construction"], rankedAny: ["RM16"] },
  },
  {
    id: "TC44",
    sourceConversation: "We only have Monday for museums and history. What still works?",
    input: request("TC44", {
      trip: { profile: "文化历史" },
      constraints: { museumMonday: true },
      requestedModuleIds: ["RM14", "RM13", "RM15"],
    }),
    expect: { followUps: ["venue_live_status"], dynamicChecks: ["same_day_venue_status"], excludedModules: ["RM07", "RM11", "RM13", "RM15", "RM18", "RM24"], rankedAny: ["RM14"] },
  },
  {
    id: "TC45",
    sourceConversation: "We’ll be in Chongqing next month. What time is the drone show?",
    input: request("TC45", {
      constraints: { dynamicEventSchedule: true },
      requestedModuleIds: ["RM04"],
    }),
    expect: { followUps: ["event_schedule"], dynamicChecks: ["current_official_event_schedule"], rankedAny: ["RM04"] },
  },
  {
    id: "TC46",
    sourceConversation: "Is Huguang Guild Hall definitely open tomorrow, and can I use my passport?",
    input: request("TC46", {
      constraints: { tomorrowOpening: true },
      requestedModuleIds: ["RM07"],
    }),
    expect: { followUps: ["venue_live_status"], dynamicChecks: ["same_day_venue_status"], rankedAny: ["RM07"] },
  },
  {
    id: "TC47",
    sourceConversation: "How much is your four-hour walk, and can I book Friday?",
    input: request("TC47", {
      stage: "询价",
      purchase: { experienceId: "EXP-CQ-001", asksPrice: true, asksBooking: true },
    }),
    expect: { commercialState: "research_candidate", mayQuote: false, mayTakePayment: false, commercialAction: "offer_paid_roadbook_or_manual_waitlist" },
  },
  {
    id: "TC48",
    sourceConversation: "If I pay now, what happens if it rains or the guide cancels?",
    input: request("TC48", {
      stage: "询价",
      purchase: { experienceId: "EXP-CQ-001", asksPayment: true, asksCancellation: true },
    }),
    expect: { commercialState: "research_candidate", mayQuote: false, mayTakePayment: false },
  },
  {
    id: "TC49",
    sourceConversation: "The guide says her English is excellent and she is free this weekend. Can we list her now?",
    input: request("TC49", {
      stage: "供应商运营",
      constraints: { supplierSelfClaim: true },
      purchase: { experienceId: "EXP-CQ-001", asksBooking: true },
    }),
    expect: { followUps: ["supplier_due_diligence"], dynamicChecks: ["supplier_seven_gate_due_diligence"], commercialState: "research_candidate" },
  },
  {
    id: "TC50",
    sourceConversation: "Earlier I said I can walk all day, but my knee started hurting today.",
    input: request("TC50", {
      stage: "行中改线",
      trip: { fitness: "低" },
      constraints: { currentPain: true },
      requestedModuleIds: ["RM10", "RM20", "RM13", "RM16", "RM05"],
    }),
    expect: { followUps: ["current_safety"], excludedModules: ["RM10", "RM20"], rankedAny: ["RM13", "RM16", "RM05"], status: "needs_confirmation" },
  },
  {
    id: "TC51",
    sourceConversation: "This is my first time in Chongqing and I only have one full day. I want to understand the city, not collect landmarks.",
    input: request("TC51", {
      trip: { days: 1, profile: "首次经典", outputLength: "标准" },
      intents: { 视觉奇观: intent(4, 0.9), 历史理解: intent(4, 0.9), 在地生活: intent(3, 0.8) },
      requestedModuleIds: ["RM07"],
    }),
    expect: {
      selectedModules: ["RM07"],
      selectedDefaultDayAny: ["D2", "D3", "D4"],
      selectedRoleAny: ["引流钩子", "核心解释", "真实生活", "付费体验"],
      totalDays: 1,
      maxModulesPerDay: 3,
      allDaysNonEmpty: true,
    },
  },
  {
    id: "TC52",
    sourceConversation: "I have one day for migration history and wartime diplomacy. Huguang Guild Hall and Zhongshan Fourth Road matter most.",
    input: request("TC52", {
      trip: { days: 1, profile: "文化历史", outputLength: "标准" },
      intents: { 历史理解: intent(5, 1) },
      requestedModuleIds: ["RM07", "RM14"],
    }),
    expect: { selectedModules: ["RM07", "RM14"], selectedDefaultDayAny: ["D2", "D3"], totalDays: 1, allDaysNonEmpty: true },
  },
  {
    id: "TC53",
    sourceConversation: "We only have one day and care mainly about noodles, hotpot etiquette and one piece of city context.",
    input: request("TC53", {
      trip: { days: 1, profile: "美食生活", outputLength: "精简" },
      intents: { 饮食互动: intent(5, 1), 在地生活: intent(4, 0.9) },
      requestedModuleIds: ["RM12"],
    }),
    expect: { selectedModules: ["RM12"], selectedRoleAny: ["付费体验"], selectedDefaultDayAny: ["D2"], maxModulesPerDay: 2 },
  },
  {
    id: "TC54",
    sourceConversation: "It is my third visit, but I have only one day. I want Huangjueping and a teahouse, not the viral skyline.",
    input: request("TC54", {
      trip: { days: 1, profile: "复游客", outputLength: "标准" },
      intents: { 在地生活: intent(5, 1), 复游新鲜感: intent(5, 1) },
      requestedModuleIds: ["RM22", "RM23"],
      excludedModuleIds: ["RM04", "RM16"],
    }),
    expect: { selectedModules: ["RM22", "RM23"], selectedDefaultDayAny: ["D4"], excludedModules: ["RM04", "RM16"] },
  },
  {
    id: "TC55",
    sourceConversation: "We have two days: one for Chongqing’s transit and terrain, one for migration and wartime history.",
    input: request("TC55", {
      trip: { days: 2, profile: "文化历史", outputLength: "标准" },
      intents: { 视觉奇观: intent(4, 0.8), 历史理解: intent(5, 1) },
      requestedModuleIds: ["RM16", "RM07", "RM14"],
    }),
    expect: { selectedModules: ["RM16", "RM07", "RM14"], totalDays: 2, allDaysNonEmpty: true },
  },
  {
    id: "TC56",
    sourceConversation: "We have four full days and want a balanced first visit without repeating the same kind of viewpoint.",
    input: request("TC56", {
      trip: { days: 4, profile: "首次经典", outputLength: "标准" },
      intents: { 视觉奇观: intent(4, 0.8), 历史理解: intent(3, 0.7), 在地生活: intent(3, 0.7) },
    }),
    expect: { totalDays: 4, maxModulesPerDay: 3, allDaysNonEmpty: true, selectedRoleAny: ["引流钩子", "真实生活"] },
  },
  {
    id: "TC57",
    sourceConversation: "I only have one day, love history, and cannot handle exposed heights.",
    input: request("TC57", {
      trip: { days: 1, profile: "文化历史", outputLength: "标准" },
      constraints: { fearOfHeights: true },
      intents: { 历史理解: intent(5, 1) },
      requestedModuleIds: ["RM07", "RM14"],
    }),
    expect: { excludedModules: ["RM02", "RM05", "RM17", "RM21"], selectedModules: ["RM07", "RM14"], allDaysNonEmpty: true },
  },
  {
    id: "TC58",
    sourceConversation: "My knees cannot take repeated stairs. I have one day and want migration history plus a museum framework.",
    input: request("TC58", {
      trip: { days: 1, profile: "文化历史", fitness: "低", outputLength: "标准" },
      constraints: { needsMobilityConfirmation: true },
      intents: { 历史理解: intent(5, 1), 低摩擦: intent(5, 1) },
      requestedModuleIds: ["RM07", "RM13"],
    }),
    expect: { followUps: ["mobility_detail"], excludedModules: ["RM10", "RM20"], selectedModules: ["RM07", "RM13"], status: "needs_confirmation" },
  },
  {
    id: "TC59",
    sourceConversation: "I use a wheelchair and need a continuously accessible one-day route. Nothing has been field-verified yet.",
    input: request("TC59", {
      trip: { days: 1, fitness: "低", outputLength: "标准" },
      constraints: { wheelchair: true },
    }),
    expect: { followUps: ["wheelchair_accessibility"], dynamicChecks: ["continuous_accessibility_field_check"], allDaysEmpty: true, status: "needs_confirmation" },
  },
  {
    id: "TC60",
    sourceConversation: "We have two days and no fixed checklist. Give us one visual hook, one explanation of how the city works, and some everyday life.",
    input: request("TC60", {
      trip: { days: 2, profile: "首次经典", outputLength: "标准" },
      intents: { 视觉奇观: intent(4, 0.9), 历史理解: intent(3, 0.7), 在地生活: intent(4, 0.9) },
    }),
    expect: { allDaysNonEmpty: true, selectedRoleAny: ["引流钩子", "核心解释", "真实生活"], totalDays: 2 },
  },
];
