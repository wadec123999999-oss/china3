export const CITY_UNITS = [
  {id:'shanghai', name:'Shanghai', minNights:2, themes:['architecture','urbanism','history','design','food','family','slow'], status:'human_check_pilot', summary:'A city of lanes, river edges, design, migration and changing scale.', cautions:['dynamic access must be checked','Tai Chi resources are not sellable unless partner_ready']},
  {id:'hangzhou_suzhou', name:'Hangzhou–Suzhou', minNights:3, themes:['gardens','tea','jiangnan','architecture','slow','family'], status:'content_foundation', summary:'A Jiangnan choice: lake/tea/temple rhythm or gardens/canals, not a same-day add-on.', cautions:['protect transfer time','do not combine Shanghai, a water town and gardens in one day']},
  {id:'beijing', name:'Beijing', minNights:3, themes:['history','architecture','imperial','hutong','family'], status:'content_foundation', summary:'A first-China historical grammar: imperial scale, neighborhoods and a deliberate Great Wall decision.', cautions:['reservations and Wall logistics are dynamic']},
  {id:'chengdu_chongqing', name:'Chengdu–Chongqing', minNights:4, themes:['food','urbanism','city_life','architecture','night','family'], status:'content_foundation', summary:'A contrast pair: Chengdu for pace and food; Chongqing for vertical movement and urban intensity.', cautions:['protect a full transfer day','Dazu and Wulong are separate decisions, not Chongqing add-ons']},
  {id:'guangzhou_shenzhen', name:'Guangzhou–Shenzhen', minNights:4, themes:['food','trade','urbanism','technology','design'], status:'content_foundation', summary:'South China through Cantonese food/trade and public-facing technology/urban change.', cautions:['no factory/R&D/private access promise','cross-border details require current official checks']},
  {id:'guilin_yangshuo', name:'Guilin–Yangshuo', minNights:3, themes:['landscape','karst','walking','slow','family'], status:'content_foundation', summary:'Karst landscapes with a controlled, weather-aware pace; cycling is optional, not assumed.', cautions:['weather, water and outdoor activity are dynamic','do not add Longji to a short stay']},
  {id:'quanzhou_dehua', name:'Quanzhou–Dehua', minNights:3, themes:['maritime','religion','history','ceramics','craft','food'], status:'human_check_pilot', summary:'A world-port system of trade, religious life and urban memory, with an optional separate ceramics extension.', cautions:['two-day Quanzhou does not absorb Dehua','religious and craft access require consent/current checks']},
  {id:'jingdezhen', name:'Jingdezhen', minNights:2, themes:['ceramics','craft','design','history','art'], status:'content_foundation', summary:'A living porcelain system: material, kilns, labor, standards and contemporary making.', cautions:['no studio/course/private access promise','no authentication, shipping or provenance claim']},
  {id:'wudang', name:'Wudang Mountains', minNights:3, themes:['heritage','mountain','taoism','walking','architecture'], status:'research_led', summary:'Mountain-based Taoist architectural heritage, approached through public space, weather and etiquette.', cautions:['no master/ritual/training/healing promise','weather, cable-car and step intensity need human review']},
  {id:'jingmai', name:'Jingmai Mountain', minNights:3, themes:['tea','landscape','walking','ecology','slow'], status:'research_led', summary:'A living tea-forest cultural landscape of forest, villages and mountain practice.', cautions:['no tea authentication or private village/farmer access promise','road/weather/community rules need current human checks']}
];

const NORMALIZE = {
  'city':'urbanism','cities':'urbanism','cyberpunk':'urbanism','foodie':'food','culinary':'food','temples':'religion','religious':'religion','tea culture':'tea','ceramic':'ceramics','porcelain':'ceramics','hiking':'walking','nature':'landscape','tech':'technology','techno':'technology','art':'art','history':'history'
};

export function normalizeThemes(values = []) {
  return [...new Set(values.map(v => NORMALIZE[String(v).toLowerCase().trim()] || String(v).toLowerCase().trim()).filter(Boolean))];
}

const TEXT_SIGNALS = [
  ['shanghai', 'Shanghai'], ['chongqing', 'Chongqing'], ['chengdu', 'Chengdu'], ['beijing', 'Beijing'], ['quanzhou', 'Quanzhou–Dehua'], ['dehua', 'Quanzhou–Dehua'], ['jingdezhen', 'Jingdezhen'], ['wudang', 'Wudang Mountains'], ['jingmai', 'Jingmai Mountain'], ['yangshuo', 'Guilin–Yangshuo'], ['guilin', 'Guilin–Yangshuo'], ['shenzhen', 'Guangzhou–Shenzhen'], ['guangzhou', 'Guangzhou–Shenzhen'], ['hangzhou', 'Hangzhou–Suzhou'], ['suzhou', 'Hangzhou–Suzhou']
];
const THEME_SIGNALS = [
  ['porcelain', 'ceramics'], ['ceramic', 'ceramics'], ['kiln', 'ceramics'], ['tea', 'tea'], ['food', 'food'], ['eat', 'food'], ['architecture', 'architecture'], ['design', 'design'], ['history', 'history'], ['imperial', 'imperial'], ['mountain', 'mountain'], ['hike', 'walking'], ['walk', 'walking'], ['temple', 'religion'], ['tao', 'taoism'], ['tech', 'technology'], ['cyberpunk', 'urbanism'], ['city', 'urbanism'], ['night', 'night'], ['landscape', 'landscape'], ['craft', 'craft']
];

function containsThemeSignal(value, needle) {
  // Short English words must be token-bound; otherwise “Great Wall” contains
  // the substring “eat” and gets misclassified as a food request.
  const tokenBound = new Set(['eat', 'tea', 'art', 'tech', 'city', 'night', 'walk', 'hike', 'food']);
  if (tokenBound.has(needle)) return new RegExp(`\\b${needle}\\b`).test(value);
  return value.includes(needle);
}

export function extractPortfolioRequest(text = '') {
  const value = String(text).toLowerCase();
  const cities = TEXT_SIGNALS.filter(([needle]) => value.includes(needle)).map(([, city]) => city);
  const interests = THEME_SIGNALS.filter(([needle]) => containsThemeSignal(value, needle)).map(([, theme]) => theme);
  const constraints = [];
  if (/private|home visit|meet.{0,40}(farmer|master|monk)|studio visit|ceremony/.test(value)) constraints.push('private_access');
  if (/book|booking|reserve.*for me|arrange.*for me/.test(value)) constraints.push('experience_booking');
  if (/wheelchair|mobility|stairs? are hard|injury|injured/.test(value)) constraints.push('limited_mobility');
  if (/allergy|allergic/.test(value)) constraints.push('severe_allergy');
  if (/medical|pregnan|heart condition/.test(value)) constraints.push('medical');
  if (/family|child|children|kid/.test(value)) constraints.push('family');
  // Accept natural forms such as “with two nights” and “2 nights in Chongqing”.
  // The number is a planning signal, not a promise of complete usable days.
  const numericNightMatch = value.match(/\b(\d+)\s*(?:nights?|days?)\b/);
  const wordNightMatch = value.match(/\b(one|two|three|four|five|six|seven)\s*(?:nights?|days?)\b/);
  const wordNightValues = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
  const nights = numericNightMatch ? Number(numericNightMatch[1]) : wordNightMatch ? wordNightValues[wordNightMatch[1]] : undefined;
  return { cities:[...new Set(cities)], interests:[...new Set(interests)], constraints:[...new Set(constraints)], ...(nights === undefined ? {} : {nights}) };
}

export function inferLatentNeeds(text = '') {
  const value=String(text).toLowerCase();
  const hypotheses=[];
  const add=(id,confidence,reason,question)=>hypotheses.push({id,confidence,reason,confirmation_question:question});
  if(/first time|first visit|never been/.test(value)) add('orientation_over_checklist',0.65,'first-visit wording can mean the traveller needs a legible starting point, not more landmarks.','Would you rather understand one city clearly than try to cover its famous places?');
  if(/only|just|short|\d+\s*(nights?|days?)/.test(value)) add('pace_protection',0.7,'limited-time wording can hide transfer and decision fatigue.','What would make this short stay feel rushed or disappointing?');
  if(/photo|photograph|camera|cyberpunk|instagram/.test(value)) add('light_crowd_access_tradeoff',0.7,'image-driven requests usually depend on light, crowds, access and weather.','Are you optimizing for a specific image, a calmer time, or understanding the place beyond the photograph?');
  if(/authentic|local|hidden|non-touristy|real china/.test(value)) add('commercialization_anxiety',0.72,'a search for “authentic” can mean discomfort with commercial mediation or a wish for human context.','Would a well-explained public route meet your aim, even if private homes or studios are unavailable?');
  if(/parents?|kids?|children|family/.test(value)) add('recovery_and_frictions',0.66,'party composition changes stairs, toilets, meal timing and recovery needs.','What pace, walking limit and meal/rest rhythm does your group actually need?');
  if(/tech|factory|company|huawei|tencent|sourcing/.test(value)) add('public_vs_private_access',0.78,'technology interest can conceal an expectation of private company access.','Are you seeking public observation and interpretation, or private company access?');
  if(/tea|ceramic|porcelain/.test(value)) add('learning_vs_purchase',0.63,'material-culture interest can mean learning, buying, collecting or a hoped-for private encounter.','Are you mainly learning, tasting/making, buying for personal use, or looking for a private introduction?');
  return hypotheses.slice(0,3);
}

export function routePortfolio(request = {}) {
  const nights = Number.isInteger(request.nights) ? request.nights : null;
  const themes = normalizeThemes(request.interests || []);
  const constraints = new Set((request.constraints || []).map(x => String(x).toLowerCase()));
  const considered = (request.cities || []).map(x => String(x).toLowerCase());
  const needsHumanReview = constraints.has('limited_mobility') || constraints.has('medical') || constraints.has('severe_allergy') || constraints.has('private_access') || constraints.has('experience_booking');
  // A traveller may name one end of a combined product unit (for example, “Chongqing”).
  // Keep the pair intact instead of silently returning no route direction.
  const cityPool = considered.length ? CITY_UNITS.filter(u => considered.includes(u.id) || considered.includes(u.name.toLowerCase()) || considered.some(city => u.name.toLowerCase().includes(city))) : CITY_UNITS;
  const ranked = cityPool.map(unit => {
    const matches = themes.filter(t => unit.themes.includes(t));
    const shortStay = nights !== null && nights < unit.minNights;
    const score = matches.length * 10 + (shortStay ? -8 : 0) + (unit.status === 'human_check_pilot' ? 2 : 0);
    return {unit, matches, shortStay, score};
  }).sort((a,b) => b.score - a.score || a.unit.minNights - b.unit.minNights);
  const selected = ranked.filter(x => x.matches.length > 0 && !x.shortStay).slice(0, 3);
  // If the traveller explicitly names a city but gives too little time, keep
  // the named unit visible so the agent can explain what must be deleted.
  // Unnamed short-stay units remain out of the recommendation list.
  if (!selected.length && considered.length) {
    const explicitShortStay = ranked.find(x => x.matches.length > 0 && x.shortStay);
    if (explicitShortStay) selected.push(explicitShortStay);
  }
  const alternatives = ranked.filter(x => !selected.includes(x)).slice(0, 3);
  const shortStayWarnings = ranked
    .filter(x => x.matches.length > 0 && x.shortStay)
    .map(({unit}) => ({city_unit:unit.id, reason:`${unit.name} generally needs at least ${unit.minNights} protected nights for its stated product logic.`}));
  const questions = [];
  if (nights === null) questions.push('How many protected nights remain after your arrival and departure days?');
  if (!themes.length) questions.push('What do you most want to understand: city life, history, food, landscape, craft, tea, religion, or technology?');
  if (constraints.has('private_access')) questions.push('Would a respectful public route meet your aim? Private homes, studios, religious spaces and farms cannot be promised.');
  if (constraints.has('experience_booking')) questions.push('Would you like independent research and direct-contact guidance? A Deeper China does not book or sell third-party experiences.');
  if (needsHumanReview && !questions.length) questions.push('What constraint most changes the route? This needs a human review before any specific itinerary is suggested.');
  const guardrails = [
    'This is a route-direction result, not a booking, guiding or package-travel offer.',
    'Dynamic transport, weather, opening, access and community rules require current confirmation.'
  ];
  if (needsHumanReview) guardrails.push('Do not publish a Human-checked roadbook until the disclosed constraint has been reviewed by a human.');
  return {
    status: needsHumanReview ? 'research_draft_human_review_required' : 'research_draft',
    input: {nights, interests:themes, constraints:[...constraints]},
    recommendation: selected.map(({unit,matches,shortStay}) => ({city_unit:unit.id, city:unit.name, why:unit.summary, matched_themes:matches, product_status:unit.status, fit_status: shortStay ? 'too_short_for_full_product' : 'fits_protected_nights', cautions:unit.cautions})),
    not_now: [...new Map([
      ...alternatives.filter(x => x.shortStay).map(({unit}) => [unit.id, {city_unit:unit.id, reason:`${unit.name} generally needs at least ${unit.minNights} protected nights for its stated product logic.`}]),
      ...shortStayWarnings.map(item => [item.city_unit, item])
    ]).values()],
    follow_up_questions: questions,
    guardrails
  };
}
