import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {commercialFor} from '../../shared/commercial.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const database=JSON.parse(fs.readFileSync(path.join(here,'../../chengdu-agent-database-20260802/成都智能体数据库_V0.1.json'),'utf8'));
const decisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../chengdu-agent-database-20260802/成都决策字段_V1.0.json'),'utf8'));
const pointDecisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../chengdu-agent-database-20260802/成都点位决策字段_V1.0.json'),'utf8'));
const priority={first_visit:['CDM01','CDM02','CDM03'],panda_priority:['CDM02'],no_pandas:['CDM01','CDM03','CDM05'],slow_travel:['CDM03','CDM04','CDM05'],food_driven:['CDM04','CDM01'],history:['CDM05','CDM07'],art_design:['CDM06'],dujiangyan:['CDM07'],chongqing_extension:['CDM08'],rain_heat:['CDM01','CDM03'],family:['CDM02','CDM01']};
const compatiblePairs=new Set(['CDM01:CDM03','CDM01:CDM04','CDM01:CDM08','CDM02:CDM03','CDM03:CDM04','CDM05:CDM06']);
const pairKey=(a,b)=>[a,b].sort().join(':');
function arrangeDays(modules,dayCount){
 const count=Math.max(1,dayCount),dayPlan=Array.from({length:count},(_,i)=>({day:i+1,theme:null,modules:[]}));
 const remaining=[...modules];
 const excursionIndex=remaining.findIndex(m=>m.id==='CDM07');if(excursionIndex>=0){dayPlan[Math.min(1,count-1)].modules.push(remaining.splice(excursionIndex,1)[0]);}
 const pandaIndex=remaining.findIndex(m=>m.id==='CDM02');if(pandaIndex>=0){const panda=remaining.splice(pandaIndex,1)[0];const target=dayPlan.find(day=>day.modules.length===0)||dayPlan[0];target.modules.push(panda);const teaIndex=remaining.findIndex(m=>m.id==='CDM03');if(teaIndex>=0&&target.modules.length<2)target.modules.push(remaining.splice(teaIndex,1)[0]);}
 for(const module of remaining){const empty=dayPlan.find(day=>day.modules.length===0);if(empty){empty.modules.push(module);continue;}const compatible=dayPlan.find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='CDM07')&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));const target=compatible||[...dayPlan].reverse().find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='CDM07'));if(target)target.modules.push(module);}
 for(const day of dayPlan)day.theme=day.modules.length===1?day.modules[0].name:day.modules.map(m=>m.name).join(' + ');return dayPlan;
}
export function decide(input={}) {
 const days=Number.isFinite(input.days)?Math.max(1,Math.min(5,input.days)):3;
 const interests=Array.isArray(input.interests)?input.interests:[];
 const tags=new Set(input.firstVisit?['first_visit',...interests]:interests);if(input.withFamily)tags.add('family');if(input.weatherConstraint)tags.add('rain_heat');
 const ids=[];for(const tag of tags)for(const id of priority[tag]??[])if(!ids.includes(id))ids.push(id);for(const id of ['CDM01','CDM03','CDM04','CDM05','CDM02'])if(!ids.includes(id))ids.push(id);
 const selectedModules=ids.slice(0,Math.min(days+1,5)).map(id=>({...database.modules.find(m=>m.id===id),decisionProfile:decisionLayer.modules[id]??null}));
 const dayPlan=arrangeDays(selectedModules,days);
 const selectedPoints=selectedModules.flatMap(m=>database.points.filter(p=>p.module_id===m.id&&p.field_status!=='candidate_only').slice(0,2).map(p=>({...p,name:pointDecisionLayer.guest_name_map?.[p.id]??p.name,decisionProfile:pointDecisionLayer.points[p.id]??null})));
 const requiredFollowUps=[];if(!Number.isFinite(input.days))requiredFollowUps.push('How many full days do you have, and when do you arrive and leave?');if(!interests.length)requiredFollowUps.push('Are pandas, tea/public life, food, poetry/history, a day trip or Chengdu–Chongqing contrast your priority?');if(!input.mobility)requiredFollowUps.push('Any mobility, heat/rain, spice, allergy, child or rest constraints?');if(interests.includes('panda_priority'))requiredFollowUps.push('Are pandas a must, and are you willing to dedicate an early, reservation-dependent half-day?');if(interests.includes('food_driven'))requiredFollowUps.push('What is your spice tolerance, dietary/allergy situation, group size and shared-pot comfort?');
 const warnings=['This is a draft for human review. Recheck live reservations, animal access, weather, transport, food, venues and payment before delivery.'];if(interests.includes('chongqing_extension'))warnings.push('Chengdu–Chongqing is a pace handoff, not a package; do not promise live train inventory or sell a two-city bundle.');if(interests.includes('booking_help_requested')||interests.includes('experience_booking_requested'))warnings.push('Product boundary: research and official links only; do not book, quote or package third-party services.');
 const commercial=commercialFor(input,requiredFollowUps);
 return {city:'Chengdu',status:'draft_for_human_review',days,dayPlan,selectedModules,selectedPoints,requiredFollowUps,warnings,commercial,deliveryRule:'Release only after the Chengdu human-checklist is completed for the traveller date.',decisionLayerVersion:decisionLayer.metadata.version,pointDecisionLayerVersion:pointDecisionLayer.metadata.version};
}
export {database};
export {arrangeDays};
