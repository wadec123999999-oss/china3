import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveModuleSourceMap } from './module-source-map.mjs';
import { loadFieldTaskPacket } from './field-task-packet-loader.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(here,'city-source-coverage.manifest.json'),'utf8'));
const runtimeByCity={Shanghai:'shanghai',Beijing:'beijing',Chengdu:'chengdu',Chongqing:'chongqing',Guangzhou:'guangzhou',Shenzhen:'shenzhen','Guilin–Yangshuo':'guilin-yangshuo',Hangzhou:'hangzhou',Suzhou:'suzhou','Quanzhou–Dehua':'quanzhou-dehua',Jingdezhen:'jingdezhen','Wudang Mountains':'wudang','Jingmai Mountain':'jingmai'};
const refreshByCity={Shanghai:'上海当前来源刷新_20260803.json',Chongqing:'重庆当前来源刷新_20260803.json',Beijing:'北京当前来源刷新_20260803.json',Chengdu:'成都当前来源刷新_20260803.json',Guangzhou:'广州深圳当前来源刷新_20260803.json',Shenzhen:'广州深圳当前来源刷新_20260803.json','Guilin–Yangshuo':'桂林阳朔当前来源刷新_20260803.json',Hangzhou:'杭州苏州当前来源刷新_20260803.json',Suzhou:'杭州苏州当前来源刷新_20260803.json','Quanzhou–Dehua':'泉州德化当前来源刷新_20260803.json',Jingdezhen:'景德镇当前来源刷新_20260803.json','Wudang Mountains':'武当山当前来源刷新_20260803.json','Jingmai Mountain':'景迈茶山当前来源刷新_20260803.json'};
const fieldTaskPacket=loadFieldTaskPacket();
const operatorPriority={Shanghai:'P0',Chongqing:'P0',Beijing:'P1',Chengdu:'P1',Guangzhou:'P1',Shenzhen:'P1',Hangzhou:'P2',Suzhou:'P2','Guilin–Yangshuo':'P2','Quanzhou–Dehua':'P1',Jingdezhen:'P1','Wudang Mountains':'P2','Jingmai Mountain':'P2'};

function nextAction(city,{datedRefreshCount,fieldTaskCount,requiresCurrentCheck,fieldVerifiedRecords}){
  if(fieldVerifiedRecords>0) return 'Review existing field evidence and re-check any date-sensitive claims before client release.';
  if(fieldTaskCount>0) return 'Run the listed field tasks and convert only passed records into field_run evidence.';
  if(datedRefreshCount>0||requiresCurrentCheck>0) return 'Generate client-date current-source tasks, then assign a human reviewer.';
  return 'Add a dated source refresh and define the first field task before building a sellable route.';
}

function fieldValidationSummary(db){
  const launchChecks=Array.isArray(db.launch_checks)?db.launch_checks:[];
  const launchFieldChecks=Array.isArray(db.launch_field_checks)?db.launch_field_checks:[];
  const genericChecks=Array.isArray(db.field_checks)?db.field_checks:[];
  const planned=launchChecks.length||launchFieldChecks.length||genericChecks.length;
  const passed=launchFieldChecks.filter(check=>['已完成','pass','passed'].includes(check.status)).length;
  return {planned,passed,ready:planned>0&&passed===planned};
}

export function portfolioReadiness(){
  const mappings=new Map(deriveModuleSourceMap().map(item=>[item.city,item]));
  return manifest.map(item=>{
    const databasePath=path.resolve(here,item.database);
    const db=JSON.parse(fs.readFileSync(databasePath,'utf8'));
    const runtime=runtimeByCity[item.city]&&path.resolve(here,`../${runtimeByCity[item.city]}-agent-runtime-v0.1`);
    const map=mappings.get(item.city);
    const modules=map?.modules||[];
    const blockedDynamic=modules.filter(module=>module.binding_status==='requires_current_check').length;
    const contextOnly=modules.filter(module=>module.binding_status==='context_only').length;
    const researchOnly=modules.filter(module=>module.binding_status==='research_only').length;
    const sourcePack=db.metadata?.source_pack_ref?path.resolve(path.dirname(databasePath),db.metadata.source_pack_ref):null;
    const sources=sourcePack?JSON.parse(fs.readFileSync(sourcePack,'utf8')):[];
    const field_validation=fieldValidationSummary(db);
    const refreshPath=refreshByCity[item.city]&&path.join(here,refreshByCity[item.city]);
    const refreshRecords=refreshPath&&fs.existsSync(refreshPath)?JSON.parse(fs.readFileSync(refreshPath,'utf8')):[];
    const fieldTaskCount=fieldTaskPacket.packs.find(pack=>pack.city===item.city)?.tasks?.length||0;
    const fieldVerifiedRecords=sources.filter(record=>record.evidence_status==='field_verified').length;
    return {city:item.city,database_status:db.metadata?.status||'legacy_unclassified',runtime_present:runtime?fs.existsSync(runtime):false,source_mode:item.mode,source_record_count:sources.length,dated_refresh_record_count:refreshRecords.length,dated_refresh_dynamic_count:refreshRecords.filter(record=>record.source_use==='requires_current_check').length,module_count:modules.length,requires_current_check:blockedDynamic,context_only:contextOnly,research_only:researchOnly,field_task_count:fieldTaskCount,field_verified_records:fieldVerifiedRecords,field_validation,operator_priority:operatorPriority[item.city]||'P2',next_action:nextAction(item.city,{datedRefreshCount:refreshRecords.length,fieldTaskCount,requiresCurrentCheck:blockedDynamic,fieldVerifiedRecords}),release_state:'no_city_is_preapproved; evaluate every client roadbook through the release gate'};
  });
}

if(process.argv[1]===fileURLToPath(import.meta.url))process.stdout.write(`${JSON.stringify(portfolioReadiness(),null,2)}\n`);
