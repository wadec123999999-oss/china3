import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreSource } from './source-score.mjs';

const platformFor = (url='') => {
  const value=url.toLowerCase();
  if(value.includes('reddit.com')) return 'reddit';
  if(value.includes('xiaohongshu.com')) return 'xiaohongshu';
  if(value.includes('mafengwo.cn')) return 'mafengwo';
  if(value.includes('qyer.com')) return 'qyer';
  if(value.includes('ctrip.com')) return 'ctrip';
  if(value.includes('dianping.com')) return 'dianping';
  if(value.includes('youtube.com')) return 'youtube';
  if(value.includes('tiktok.com')) return 'tiktok';
  if(/\.gov\.cn|museum|unesco\.org|\.edu\b|doi\.org/.test(value)) return 'official';
  return 'other';
};
const typeFor = (text='',url='') => {
  if(/museum.*(open|visit)|museum\.net/.test(url.toLowerCase())) return 'opening_or_access';
  if(/开放|预约|入馆|票务|运营|施工|管制|首末班|时段|排队/.test(text)) return 'opening_or_access';
  if(/交通|地铁|索道|电梯|路线|步道|高差|地图/.test(text)) return 'transport';
  if(/高温|天气|季节/.test(text)) return 'weather_or_season';
  if(/体验|课程|导游|价格|取消|支付/.test(text)) return 'provider_or_experience';
  if(/火锅|小吃|餐/.test(text)) return 'food_or_accommodation';
  if(/游客|行程|AI|Google|摩擦|拥挤/.test(text)) return 'traveller_friction';
  return 'heritage_context';
};
const independenceFor = (platform, source={}) => {
  if(platform==='official') return 'official_primary';
  if(platform==='reddit') return 'firsthand_unclear';
  if(/供应商|平台销售|营销/.test(source.advertising_risk||'')) return 'seller_or_provider';
  return 'firsthand_unclear';
};
const commercialFor = (source={}) => /高[：:]/.test(source.advertising_risk||'') ? 'seller_or_provider' : 'none_seen';
const embeddedSources = (root) => {
  const found=[];
  const walk=(value)=>{
    if(Array.isArray(value)) return value.forEach(walk);
    if(!value||typeof value!=='object') return;
    if(typeof value.source==='string') found.push({
      source_id:value.id||value.module_id||value.name||null,
      source_name:value.title||value.name||value.id||'Embedded database source',
      url:value.source,
      core_information:value.why||value.description||value.title||value.name||'Embedded source requires manual claim extraction.',
      level:value.evidence||'legacy'
    });
    Object.values(value).forEach(walk);
  };
  walk(root);
  return found;
};
const policySources = (db) => ([...(db.source_policy?.official_sources||[]),...(db.source_policy?.sources||[]),...(db.source_policy?.research_basis||[])]).map(source=>({
  source_id:source.id||null,
  source_name:source.title||source.id||'Policy source',
  url:source.url||'',
  primary_use:source.use||'',
  core_information:source.use||source.title||'Policy source requires manual claim extraction.',
  published_or_status:source.dynamic?'Dynamic source; publication date not normalized.':'Policy source; publication date not normalized.',
  dynamic:source.dynamic===true,
  advertising_risk:'低'
}));

export function migrateCitySources(databasePath,{capturedAt='2026-08-02T00:00:00+08:00'}={}) {
  const db=JSON.parse(fs.readFileSync(databasePath,'utf8'));
  const city=db.metadata?.city||db.city||(db.metadata?.scope||'').split(/[,，]/)[0]||path.basename(databasePath);
  const cityScope=/重庆/.test(city)?['Chongqing','重庆主城']:[city];
  const old=Array.isArray(db.sources) && db.sources.length ? db.sources : policySources(db).length ? policySources(db) : embeddedSources(db);
  const cityCode=(db.metadata?.database_id||String(city)).replace(/[^A-Za-z]/g,'').slice(0,8).toUpperCase()||'CITY';
  return old.map((source,index)=>{
    const platform=platformFor(source.url);
    const record={
      schema_version:'0.1',
      source_id:`SRC-${cityCode}-20260802-${String(index+1).padStart(3,'0')}`,
      legacy_source_id:source.source_id||null,
      platform,
      url:source.url||undefined,
      captured_at:capturedAt,
      published_at:null,
      published_date_note:source.published_or_status||'Publication time not normalized from legacy database.',
      city_scope:cityScope,
      claim_type:source.dynamic?'opening_or_access':typeFor(`${source.primary_use||''} ${source.core_information||''} ${source.source_name||''}`,source.url||''),
      claim:source.core_information||source.primary_use||source.source_name||'Legacy source requires manual extraction.',
      commercial_signal:commercialFor(source),
      independence:independenceFor(platform,source),
      evidence_status:'lead_only',
      review_status:'unreviewed',
      corroboration_ids:[],
      notes:`Migrated from legacy source: ${source.source_name||'unnamed'}. Original source level: ${source.level||'unknown'}.`
    };
    const verdict=scoreSource(record);
    record.review_status=verdict.use==='requires_current_check'?'dynamic_check_required':verdict.use==='corroborate_before_database'?'needs_corroboration':verdict.use==='context_with_citation'?'usable_as_context':'unreviewed';
    return {...record,source_score:verdict.score,source_use:verdict.use,source_score_reasons:verdict.reasons};
  });
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const input=process.argv[2];
  if(!input) throw new Error('Usage: node migrate-city-sources.mjs <city-database.json>');
  process.stdout.write(`${JSON.stringify(migrateCitySources(input),null,2)}\n`);
}
