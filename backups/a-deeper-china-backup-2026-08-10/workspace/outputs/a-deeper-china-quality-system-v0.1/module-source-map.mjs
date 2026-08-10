import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrateCitySources } from './migrate-city-sources.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(here,'city-source-coverage.manifest.json'),'utf8'));
const datedRefreshByCity={Shanghai:'上海当前来源刷新_20260803.json',Beijing:'北京当前来源刷新_20260803.json',Chengdu:'成都当前来源刷新_20260803.json',Chongqing:'重庆当前来源刷新_20260803.json',Guangzhou:'广州深圳当前来源刷新_20260803.json',Shenzhen:'广州深圳当前来源刷新_20260803.json','Guilin–Yangshuo':'桂林阳朔当前来源刷新_20260803.json',Hangzhou:'杭州苏州当前来源刷新_20260803.json',Suzhou:'杭州苏州当前来源刷新_20260803.json','Quanzhou–Dehua':'泉州德化当前来源刷新_20260803.json',Jingdezhen:'景德镇当前来源刷新_20260803.json','Wudang Mountains':'武当山当前来源刷新_20260803.json','Jingmai Mountain':'景迈茶山当前来源刷新_20260803.json'};
const dynamicChecks=JSON.parse(fs.readFileSync(path.join(here,'dynamic-check-catalog.json'),'utf8'));
const stopWords=new Set(['the','and','for','with','from','that','this','are','not','only','into','but','all','any','may','can','use','out','how','what','why','who','when','where','which','will','must','after','before','over','under','than','then','their','they','them','your','you','our','its','has','have','had','was','were','also','does','doesnt','current','guest','date','public','city','mountain','mountains']);
const words=(value='')=>new Set(String(value).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,' ').split(/\s+/).filter(word=>word.length>2&&!stopWords.has(word)));
const overlap=(a,b)=>[...a].filter(word=>b.has(word)).length;

function refreshMatchesCity(source,city){
  const parts=String(city||'').toLowerCase().split(/[–-]/).map(part=>part.trim()).filter(Boolean);
  return Array.isArray(source.city_scope)&&source.city_scope.some(scope=>{
    const value=String(scope).toLowerCase();
    return parts.some(part=>value===part||value.includes(part)||part.includes(value));
  });
}

function sourcesFor(databasePath,db,city){
  let sources;
  if(db.metadata?.source_pack_ref){
    const p=path.resolve(path.dirname(databasePath),db.metadata.source_pack_ref);
    // Some city databases intentionally share one source pack (for example
    // Beijing/Chengdu). A combined product (for example Quanzhou–Dehua) may
    // use either of its named component scopes, but never another city.
    const validScopes=[city,...String(city).split(/[–-]/).map(part=>part.trim()).filter(Boolean)].map(scope=>scope.toLowerCase());
    const matchesScope=(scope)=>{
      const value=String(scope).trim().toLowerCase();
      return validScopes.some(valid=>value===valid||value.startsWith(`${valid},`)||value.startsWith(`${valid} `)||value.startsWith(`${valid}–`)||value.startsWith(`${valid}-`)||valid.startsWith(`${value},`)||valid.startsWith(`${value} `));
    };
    sources=JSON.parse(fs.readFileSync(p,'utf8')).filter(source=>!Array.isArray(source.city_scope)||source.city_scope.length===0||source.city_scope.some(matchesScope));
  }else sources=migrateCitySources(databasePath);
  const refreshName=datedRefreshByCity[city];
  if(refreshName){
    const refreshPath=path.join(here,refreshName);
    if(fs.existsSync(refreshPath)){
      const refresh=JSON.parse(fs.readFileSync(refreshPath,'utf8')).filter(source=>refreshMatchesCity(source,city));
      const known=new Set(sources.map(source=>source.source_id));
      sources=[...sources,...refresh.filter(source=>!known.has(source.source_id))];
    }
  }
  return sources;
}
function modulesFor(db){
  return (db.modules||db.route_modules||[]).map(module=>({
    ...module,
    id:module.id||module.module_id||module['模块ID']||module.name,
    name:module.name||module['模块名称']||'',
    question:module.question||module['只讲一个核心解释']||module['智能体检索摘要']||'',
    output_rule:module.output_rule||module['必须确认字段']||module['禁止/降级条件']||'',
    source_url:module.source_url||module.source||module['来源URL']||''
  }));
}

export function deriveModuleSourceMap(){
  return manifest.map(item=>{
    const databasePath=path.resolve(here,item.database);
    const db=JSON.parse(fs.readFileSync(databasePath,'utf8'));
    const sources=sourcesFor(databasePath,db,item.city);
    const modules=modulesFor(db);
    return {
      city:item.city,
      database:item.database,
      modules:modules.map(module=>{
        const moduleText=words(`${module.name||''} ${module.question||''} ${module.output_rule||''} ${module.description||''}`);
        const ranked=sources.map(source=>({...source,relevance:Array.isArray(source.module_ids)?(source.module_ids.includes(module.id)?98:0):source.url&&source.url===module.source_url?99:overlap(moduleText,words(`${source.claim||''} ${source.notes||''}`))})).sort((a,b)=>b.relevance-a.relevance||b.source_score-a.source_score);
        const relevant=ranked.filter(source=>source.relevance>0);
        const context=relevant.filter(source=>source.source_use==='context_with_citation').slice(0,3);
        const dynamic=relevant.filter(source=>source.source_use==='requires_current_check').slice(0,3);
        // Three narrow research leads can represent distinct customer questions
        // (for example private access, public alternatives and payment friction)
        // without becoming operational evidence.
        const leads=relevant.filter(source=>source.source_use==='lead_only').slice(0,3);
        const moduleId=module.id||module.module_id||module.name;
        const checks=dynamicChecks.filter(check=>check.city===item.city&&check.module_id===moduleId).map(check=>check.id);
        const requiresByModule=/\b(weather|access|transport|arrival|road|ticket|opening|route|walk|walking|stairs|cable|provider|instructor|accommodation|photography|consent|ceremony|village|tea-maker|booking)\b/.test(`${module.name||''} ${module.question||''} ${module.output_rule||''}`.toLowerCase());
        const status=(dynamic.length||checks.length||requiresByModule)?'requires_current_check':context.length?'context_only':leads.length?'research_only':'needs_source_enrichment';
        return {module_id:moduleId,context_source_ids:context.map(s=>s.source_id),dynamic_source_ids:dynamic.map(s=>s.source_id),research_lead_ids:leads.map(s=>s.source_id),dynamic_check_ids:checks,binding_status:status,missing_dynamic_evidence:status==='requires_current_check'&&dynamic.length===0&&checks.length===0};
      })
    };
  });
}

if(process.argv[1]===fileURLToPath(import.meta.url))process.stdout.write(`${JSON.stringify(deriveModuleSourceMap(),null,2)}\n`);
