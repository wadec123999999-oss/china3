import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const database=JSON.parse(fs.readFileSync(path.join(here,'../../jingdezhen-agent-database-20260802/景德镇智能体数据库_V0.1.json'),'utf8'));
const decisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../jingdezhen-agent-database-20260802/景德镇决策字段_V1.0.json'),'utf8'));const pointDecisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../jingdezhen-agent-database-20260802/景德镇点位决策字段_V1.0.json'),'utf8'));
const priority={ceramics:['JZM01'],imperial_history:['JZM02'],material_process:['JZM01','JZM02'],art_design:['JZM03'],artist_visit:['JZM03'],workshop:['JZM05','JZM06'],residency:['JZM05'],apprenticeship:['JZM05'],ceramic_purchase:['JZM04'],shipping:['JZM04','JZM06'],two_days:['JZM07'],four_days:['JZM07','JZM05'],dehua_extension:['JZM07'],shanghai_extension:['JZM07'],hangzhou_extension:['JZM07']};
const compatiblePairs=new Set(['JZM01:JZM02','JZM01:JZM07','JZM03:JZM04','JZM04:JZM08','JZM05:JZM06','JZM07:JZM08']);
const pairKey=(a,b)=>[a,b].sort().join(':');

function arrangeDays(modules,dayCount){
  const count=Math.max(1,dayCount),dayPlan=Array.from({length:count},(_,i)=>({day:i+1,theme:null,modules:[]}));
  const remaining=[...modules];
  const makingIndex=remaining.findIndex(module=>module.id==='JZM05');
  if(makingIndex>=0){const day=dayPlan.find(item=>item.modules.length===0);day.modules.push(remaining.splice(makingIndex,1)[0]);const safetyIndex=remaining.findIndex(module=>module.id==='JZM06');if(safetyIndex>=0)day.modules.push(remaining.splice(safetyIndex,1)[0]);}
  const primary=remaining.filter(module=>!['JZM07','JZM08'].includes(module.id));
  const support=remaining.filter(module=>['JZM07','JZM08'].includes(module.id));
  for(const module of primary){const empty=dayPlan.find(day=>day.modules.length===0);if(empty){empty.modules.push(module);continue;}const compatible=dayPlan.find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='JZM05')&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));const target=compatible||[...dayPlan].reverse().find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='JZM05'));if(target)target.modules.push(module);}
  for(const module of support){const compatible=dayPlan.find(day=>day.modules.length<2&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));const target=compatible||dayPlan.find(day=>day.modules.length===0)||[...dayPlan].reverse().find(day=>day.modules.length<2);if(target)target.modules.push(module);}
  for(const day of dayPlan)day.theme=day.modules.length===0?'Protected firing, delivery or recovery buffer':day.modules.length===1?day.modules[0].name:day.modules.map(module=>module.name).join(' + ');
  return dayPlan;
}

export function decide(input={}){
  const days=Number.isFinite(input.days)?Math.max(1,Math.min(5,input.days)):2;
  const interests=Array.isArray(input.interests)?input.interests:[];
  const ids=[];for(const interest of interests)for(const id of priority[interest]??[])if(!ids.includes(id))ids.push(id);
  for(const id of ['JZM01','JZM02','JZM03','JZM08'])if(!ids.includes(id))ids.push(id);
  const capacity=days===1?2:Math.min(days+2,6);
  let modules=ids.slice(0,capacity).map(id=>({...database.modules.find(module=>module.id===id),decisionProfile:decisionLayer.modules[id]??null}));
  if(days<=2&&interests.some(item=>['workshop','artist_visit'].includes(item)))modules=modules.filter(module=>!['JZM05','JZM06'].includes(module.id));
  const dayPlan=arrangeDays(modules,days);
  const asks=[];
  if(!Number.isFinite(input.days))asks.push('How many full days do you have, and are you seeking public observation or actual making?');
  if(!interests.length)asks.push('Do you want material/process, imperial history, contemporary art, buying, a workshop or professional learning?');
  if(interests.some(item=>['workshop','residency','apprenticeship'].includes(item)))asks.push('Is this a one-off experience, genuine skills learning, or a professional programme? When do you depart relative to firing/delivery?');
  const points=modules.flatMap(module=>database.points.filter(point=>point.module_id===module.id&&point.field_status!=='candidate_only').slice(0,2).map(point=>({...point,name:pointDecisionLayer.guest_name_map?.[point.id]??point.name,decisionProfile:pointDecisionLayer.points[point.id]??null})));
  const warnings=['This is a draft for human review. Recheck public access, exhibitions, transport, safety and language details before delivery.'];
  if(days<=2&&interests.some(item=>['workshop','artist_visit'].includes(item)))warnings.push('Do not place workshop or private studio access in a two-day public core. It requires partner release.');
  if(interests.some(item=>['residency','apprenticeship'].includes(item)))warnings.push('Residency and apprenticeship are professional/visa matters outside this tourism product.');
  if(interests.some(item=>['ceramic_purchase','shipping'].includes(item)))warnings.push('Do not authenticate, value, ship, export or guarantee ceramic objects.');
  if(interests.includes('booking_help_requested')||interests.includes('experience_booking_requested'))warnings.push('Product boundary: research and official links only; do not book, quote or package third-party services.');
  return {city:'Jingdezhen',status:'draft_for_human_review',days,dayPlan,selectedModules:modules,selectedPoints:points,requiredFollowUps:asks,warnings,commercial:commercialFor(input,asks),deliveryRule:'Release only after current human review and a separate provider release for any making activity.',decisionLayerVersion:decisionLayer.metadata.version,pointDecisionLayerVersion:pointDecisionLayer.metadata.version};
}

export { database, arrangeDays };
