import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveModuleSourceMap } from './module-source-map.mjs';

test('each portfolio module receives an explicit source-binding state',()=>{
  const cities=deriveModuleSourceMap();
  assert.equal(cities.length,13);
  const modules=cities.flatMap(city=>city.modules);
  assert.ok(modules.length>=100);
  assert.equal(modules.some(module=>!module.binding_status),false);
  assert.equal(modules.some(module=>typeof module.missing_dynamic_evidence!=='boolean'),false);
  assert.equal(modules.some(module=>!Array.isArray(module.dynamic_check_ids)),false);
  assert.equal(modules.some(module=>module.context_source_ids.some(id=>id.includes('REDDIT'))),false);
});

test('live-only operating questions have explicit reviewer tasks rather than fake static evidence',()=>{
  const cities=deriveModuleSourceMap();
  const liveOnly=['GZM07','WDM01','WDM04','WDM07','WDM08','JMM05','JMM06'];
  for(const id of liveOnly){
    const module=cities.flatMap(city=>city.modules).find(item=>item.module_id===id);
    assert.ok(module.dynamic_check_ids.length>0,id);
  }
});

test('experimental community-access cities retain a dynamic gate',()=>{
  const cities=deriveModuleSourceMap();
  for(const cityName of ['Wudang Mountains','Jingmai Mountain']){
    const city=cities.find(item=>item.city===cityName);
    assert.ok(city.modules.some(module=>module.binding_status==='requires_current_check'));
  }
});

test('Chinese-labelled Chongqing modules retain their IDs and direct source bindings',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Chongqing');
  assert.equal(city.modules[0].module_id,'RM01');
  assert.ok(city.modules.some(module=>module.context_source_ids.length>0||module.dynamic_source_ids.length>0));
});

test('shared source packs never attach another city’s source to a module',()=>{
  const cities=deriveModuleSourceMap();
  const beijing=cities.find(item=>item.city==='Beijing');
  const chengdu=cities.find(item=>item.city==='Chengdu');
  assert.equal(beijing.modules.flatMap(module=>[...module.context_source_ids,...module.dynamic_source_ids,...module.research_lead_ids]).some(id=>id.includes('CHENGDU')),false);
  assert.equal(chengdu.modules.flatMap(module=>[...module.context_source_ids,...module.dynamic_source_ids,...module.research_lead_ids]).some(id=>id.includes('BEIJING')),false);
});

test('community signals can be explicitly bound as leads without opening a release path',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Quanzhou–Dehua');
  assert.ok(city.modules.find(item=>item.module_id==='QZM04').research_lead_ids.includes('SRC-QUANZHOU-20260803-YT01'));
  assert.equal(city.modules.find(item=>item.module_id==='QZM04').research_lead_ids.includes('SRC-QUANZHOU-20260803-REDDIT01'),false);
  assert.equal(city.modules.find(item=>item.module_id==='QZM04').binding_status==='research_only',false);
});

test('commercial community posts are narrow leads, never generic city evidence',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Hangzhou');
  assert.ok(city.modules.find(item=>item.module_id==='HZM01').research_lead_ids.includes('SRC-HANGZHOU-20260802-005'));
  assert.equal(city.modules.find(item=>item.module_id==='HZM06').research_lead_ids.includes('SRC-HANGZHOU-20260802-005'),false);
});

test('Shenzhen private-access demand remains a lead and cannot become a route release source',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Shenzhen');
  const tech=city.modules.find(item=>item.module_id==='SZM01');
  assert.ok(tech.research_lead_ids.includes('SRC-SHENZHEN-20260803-REDDIT01'));
  assert.equal(tech.dynamic_source_ids.includes('SRC-SHENZHEN-20260803-REDDIT01'),false);
  assert.ok(city.modules.find(item=>item.module_id==='SZM08').research_lead_ids.includes('SRC-SHENZHEN-20260803-REDDIT02'));
});

test('Jingdezhen workshop demand remains a research lead behind a human review gate',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Jingdezhen');
  const workshop=city.modules.find(item=>item.module_id==='JZM05');
  assert.ok(workshop.research_lead_ids.includes('SRC-JINGDEZH-20260803-REDDIT01'));
  assert.equal(workshop.dynamic_source_ids.includes('SRC-JINGDEZH-20260803-REDDIT01'),false);
  assert.equal(workshop.binding_status,'requires_current_check');
  assert.ok(workshop.dynamic_check_ids.includes('DC-JDZ-LEARNING'));
});

test('Chongqing nightlife and residential modules have explicit public-boundary gates',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Chongqing');
  for(const [id,check] of [['RM06','DC-CQ-NIGHT-LIFE'],['RM09','DC-CQ-RESIDENTIAL-BOUNDARY']]){
    const module=city.modules.find(item=>item.module_id===id);
    assert.equal(module.binding_status,'requires_current_check');
    assert.ok(module.dynamic_check_ids.includes(check));
  }
});

test('Wudang training demand cannot erase the dynamic release gate',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Wudang Mountains');
  const training=city.modules.find(item=>item.module_id==='WDM06');
  assert.ok(training.research_lead_ids.includes('SRC-WUDANG-20260803-REDDIT02'));
  assert.equal(training.binding_status,'requires_current_check');
});

test('a precise geographic suffix does not drop Jingmai sources from its own city',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Jingmai Mountain');
  assert.ok(city.modules.some(module=>module.context_source_ids.includes('SRC-JINGMAI-20260802-001')));
});

test('Jingmai generic forest discussion is restricted to village and ecology modules',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Jingmai Mountain');
  assert.equal(city.modules.find(item=>item.module_id==='JMM01').dynamic_source_ids.includes('SRC-JINGMAI-20260802-004'),false);
  assert.ok(city.modules.find(item=>item.module_id==='JMM05').dynamic_source_ids.includes('SRC-JINGMAI-20260802-004'));
});

test('Guilin weather discussion cannot become generic route evidence',()=>{
  const city=deriveModuleSourceMap().find(item=>item.city==='Guilin–Yangshuo');
  assert.ok(city.modules.find(item=>item.module_id==='GYM08').dynamic_source_ids.includes('SRC-GUILIN-20260802-004'));
  assert.equal(city.modules.find(item=>item.module_id==='GYM01').dynamic_source_ids.includes('SRC-GUILIN-20260802-004'),false);
});
