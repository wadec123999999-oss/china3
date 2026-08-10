import { inferLatentNeeds } from './portfolio.mjs';

const UNIT_RUNTIMES = {
  shanghai: ['shanghai'], beijing: ['beijing'],
  hangzhou_suzhou: ['hangzhou', 'suzhou'], chengdu_chongqing: ['chengdu', 'chongqing'],
  guangzhou_shenzhen: ['guangzhou', 'shenzhen'], guilin_yangshuo: ['guilin-yangshuo'],
  quanzhou_dehua: ['quanzhou-dehua'], jingdezhen: ['jingdezhen'],
  wudang: ['wudang'], jingmai: ['jingmai']
};

const TAG_RULES = {
  beijing: [['great wall|wall','great_wall_must'],['hutong|neighbou?rhood','hutong_not_touristy'],['art|design','art_design'],['history|imperial|architecture','history_architecture']],
  shanghai: [['tai chi','tai_chi'],['jewish','jewish_history'],['film','film'],['literature|literary','literature'],['photo|photography','photo'],['art|design|creative','art_design'],['history','history'],['architecture','architecture'],['slow|calm','slow']],
  chengdu: [['panda','panda_priority'],['tea|slow|calm','slow_travel'],['food|culinary|eat','food_driven'],['history|poetry|religion','history'],['art|design','art_design'],['dujiangyan','dujiangyan']],
  guangzhou: [['dim sum','dim_sum'],['food|culinary|eat','food_driven'],['trade|history|old city','urban_history'],['architecture','architecture'],['business','business'],['shopping','shopping'],['night','night']],
  shenzhen: [['factory|private company','factory_visit'],['sourcing|supplier','sourcing'],['hardware|electronics','hardware'],['ai|electric vehicle|ev','ai_ev'],['maker','makers'],['design','design'],['business','business'],['shopping','shopping'],['technology|tech','tech_general']],
  'guilin-yangshuo': [['longji|rice terrace','longji'],['no cycling|non-cycling','non_cycling'],['cycle|cycling|bike','cycling'],['photo|photography','photography'],['adventure','adventure'],['quiet|slow|calm','quiet'],['river|boat','li_river'],['karst|landscape','karst']],
  hangzhou: [['buy tea|tea purchase','tea_purchase'],['tea','tea'],['buddhist|religion|temple','religion'],['technology|tech','tech'],['history','history'],['urbanism|city','urbanism'],['nature|landscape','nature'],['west lake|lake','west_lake']],
  suzhou: [['water town','water_town'],['craft|music|performance','craft'],['garden','gardens'],['architecture','architecture'],['history','history'],['urbanism|canal|city','urbanism']],
  'quanzhou-dehua': [['buy ceramic|ceramic purchase','ceramic_purchase'],['making|workshop|maker','maker_experience'],['ceramic|porcelain|dehua','ceramics'],['islam','islamic_history'],['buddhist','buddhism'],['religion|temple|belief','religion'],['food','food_driven'],['maritime|trade|port','maritime_history'],['design|craft','craft_design']],
  jingdezhen: [['apprentice','apprenticeship'],['residency','residency'],['workshop|making','workshop'],['buy|purchase','ceramic_purchase'],['shipping|ship','shipping'],['artist|studio','artist_visit'],['art|design','art_design'],['history|imperial','imperial_history'],['material|process|kiln','material_process'],['ceramic|porcelain','ceramics']],
  wudang: [['private master','private_master_access'],['ritual','religious_ritual'],['healing|wellness','wellness_healing'],['training|martial','martial_arts_training'],['tai chi','tai_chi'],['tao','taoism_interest'],['photo|sunrise','sunrise_photo'],['architecture|heritage','heritage_architecture']],
  jingmai: [['farmer|private home','tea_farmer_visit'],['ceremony','tea_ceremony'],['buy|purchase','tea_purchase'],['health','tea_health'],['investment','tea_investment'],['old tree','old_tree_tea'],['photo','photography'],['walk|hike','walking'],['tea','tea_culture']]
};

function localDateParts(value) {
  const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
  return match ? { date:`${match[1]}-${match[2]}-${match[3]}`, hour:Number(match[4]) } : null;
}
function localClock(value) {
  const match=String(value||'').match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}
const dateNumber=date=>Date.parse(`${date}T00:00:00Z`);

function usableWindowLabel(arrival, departure) {
  if (!arrival?.date || !departure?.date) return null;
  const middle = Math.max(0, Math.round((dateNumber(departure.date) - dateNumber(arrival.date)) / 86400000) - 1);
  const arrivalPart = arrival.hour >= 12 ? 'arrival afternoon' : 'arrival day';
  const departurePart = departure.hour <= 14 ? 'departure morning' : 'departure day';
  if (!middle) return `${arrivalPart} / ${departurePart}`;
  return `${arrivalPart} / ${middle} full day${middle === 1 ? '' : 's'} / ${departurePart}`;
}

function duration(client) {
  const arrival=localDateParts(client?.arrival?.date_time);const departure=localDateParts(client?.departure?.date_time);
  if(!arrival||!departure)return {days:null,nights:null};
  const nights=Math.max(0,Math.round((dateNumber(departure.date)-dateNumber(arrival.date))/86400000));
  return {nights,days:Math.max(1,nights+1-(arrival.hour>=14?1:0)-(departure.hour<14?1:0))};
}

function buildTripContext(client = {}, travel = {}, nights = null, message = '') {
  const arrival = localDateParts(client?.arrival?.date_time);
  const departure = localDateParts(client?.departure?.date_time);
  const adults = Number.isInteger(client?.party?.adults) ? client.party.adults : null;
  const children = Array.isArray(client?.party?.children_ages) ? client.party.children_ages.length : 0;
  const arrivalDate = travel.start_date || arrival?.date || null;
  const departureDate = travel.end_date || departure?.date || null;
  const contextNights = arrivalDate && departureDate
    ? Math.max(0, Math.round((dateNumber(departureDate) - dateNumber(arrivalDate)) / 86400000))
    : nights;
  return {
    arrival_date: arrivalDate,
    departure_date: departureDate,
    arrival_time_local: localClock(client?.arrival?.date_time),
    departure_time_local: localClock(client?.departure?.date_time),
    usable_time_window: usableWindowLabel(arrival, departure),
    nights: contextNights,
    adults,
    children,
    party_size: adults === null ? null : adults + children,
    pace: client?.pace || null,
    overnight_area: client?.overnight_area || null,
    output_language: client?.output_language || null,
    explicit_priorities: Array.isArray(client?.priorities) ? client.priorities.slice(0, 8) : [],
    explicit_avoidances: Array.isArray(client?.avoid) ? client.avoid.slice(0, 8) : [],
    inferred_needs: inferLatentNeeds(message).slice(0, 3)
  };
}

function mapInterests(runtime, priorities=[]) {
  const tags=[];const unmatched=[];
  for(const priority of priorities){const value=String(priority).toLowerCase();let matched=false;for(const [pattern,tag] of TAG_RULES[runtime]||[]){if(new RegExp(pattern).test(value)){if(!tags.includes(tag))tags.push(tag);matched=true;}}if(!matched)unmatched.push(priority);}
  return {tags,unmatched};
}

function chongqingInput({client,message,module_ids,days,nights,travel,unmatched}) {
  const priorityText=(client.priorities||[]).join(' | ');const intents={};
  const rules=[['photo|cyberpunk|view|architecture','视觉奇观'],['history|heritage','历史理解'],['local|street|neighbou?rhood|daily life','在地生活'],['food|eat|culinary','饮食互动'],['calm|easy|slow|family','低摩擦'],['photo|film|creative','摄影创作'],['family|child','亲子教育'],['repeat|second visit|unusual','复游新鲜感']];
  for(const [pattern,dimension] of rules)if(new RegExp(pattern).test(priorityText.toLowerCase()))intents[dimension]={intensity:5,confidence:1,evidenceQuote:priorityText};
  return {runtime:'chongqing',trip_context:buildTripContext(client,travel,nights,message),runtime_input:{requestId:'client-roadbook-draft',stage:'路线规划',trip:{days,profile:/first time|first visit/i.test(message)?'首次经典':'复游客',fitness:/none reported/i.test(client.mobility_notes)?'中':'低',weather:'正常',outputLength:'标准',arrivalDepartureKnown:true,hotelAreaKnown:true},intents,constraints:{needsMobilityConfirmation:!/none reported/i.test(client.mobility_notes)},liveChecks:{},requestedModuleIds:module_ids||[],excludedModuleIds:[],purchase:{asksPrice:false,asksBooking:false,asksPayment:false,asksCancellation:false}},unmapped_priorities:unmatched,warnings:['Weather remains a dated human check; the adapter never assumes current conditions.']};
}

export function buildRuntimeInput({city_unit,runtime_city,travel={},client,message='',module_ids=[]}={}) {
  const choices=UNIT_RUNTIMES[city_unit];
  if(!choices)return {valid:false,errors:[`unknown city_unit: ${city_unit||'missing'}`]};
  const runtime=runtime_city||choices[0];
  if(choices.length>1&&!runtime_city)return {valid:false,errors:[`${city_unit} requires runtime_city: ${choices.join(' or ')}`],runtime_choices:choices};
  if(!choices.includes(runtime))return {valid:false,errors:[`${runtime} is not part of ${city_unit}`],runtime_choices:choices};
  if(!client||typeof client!=='object')return {valid:false,errors:['complete client intake is required before runtime handoff.']};
  const {days,nights}=duration(client);if(days===null)return {valid:false,errors:['confirmed arrival and departure date-times are required before runtime handoff.']};
  const mapped=mapInterests(runtime,client.priorities);
  const trip_context = buildTripContext(client, travel, nights, message);
  if(runtime==='chongqing')return {valid:true,...chongqingInput({client,message,module_ids,days,nights,travel,unmatched:mapped.unmatched})};
  const input={interests:mapped.tags,firstVisit:/first time|first visit/i.test(message),withFamily:(client.party?.children_ages||[]).length>0,mobility:/none reported/i.test(client.mobility_notes)?'standard':'limited',arrivalTime:localDateParts(client.arrival.date_time)?.hour>=14?'afternoon':'morning'};
  if(['wudang','jingmai'].includes(runtime))input.nights=nights;else input.days=days;
  if(runtime==='beijing')input.arriveLate=localDateParts(client.arrival.date_time)?.hour>=18;
  return {valid:true,runtime,runtime_input:input,trip_context,unmapped_priorities:mapped.unmatched,warnings:[...(mapped.unmatched.length?['Unmapped priorities require a human confirmation before module selection.']:[]),'Weather, access and live operations remain separate dated checks.'],travel};
}

export { UNIT_RUNTIMES };
