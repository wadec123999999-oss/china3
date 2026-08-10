import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
import { dispatchRuntime } from '../src/runtime-dispatch.mjs';

const client={party:{adults:2,children_ages:[]},arrival:{date_time:'2026-10-10T09:00:00+08:00',place:'airport'},departure:{date_time:'2026-10-12T20:00:00+08:00',place:'station'},overnight_area:'central city',pace:'moderate',mobility_notes:'none reported after asking',priorities:['history and architecture'],avoid:['rushing'],food_restrictions:'none',budget_context:'comfortable',output_language:'English'};

test('dispatch executes upgraded Beijing and returns a normalized day draft',async()=>{
  const handoff=buildRuntimeInput({city_unit:'beijing',client,message:'Our first visit to Beijing'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.valid,true);
  assert.equal(result.runtime,'beijing');
  assert.equal(result.output_capability,'day_sequence_draft');
  assert.ok(result.selected_module_ids.includes('BJM01'));
  assert.equal(result.day_sequence_available,true);
  assert.equal(result.days.length,3);
  assert.ok(result.commercial);
  assert.equal(result.commercial.recommended_product,'deep_roadbook');
  assert.equal(result.commercial.digital_roadbook.field_verification_required_for_payment,false);
  assert.equal(result.commercial.product_catalog.products.find(product=>product.id==='deep_roadbook').human_checked_label_allowed,false);
  assert.equal(result.commercial.third_party_experience.may_take_payment,false);
  assert.equal(result.commercial.product_catalog.products.length,3);
});

test('dispatch preserves Chongqing day sequencing instead of flattening capability claims',async()=>{
  const handoff=buildRuntimeInput({city_unit:'chengdu_chongqing',runtime_city:'chongqing',client:{...client,priorities:['cyberpunk photo and local street life']},message:'First visit to Chongqing'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.valid,true);
  assert.equal(result.output_capability,'day_sequence_draft');
  assert.equal(result.day_sequence_available,true);
  assert.ok(result.days.length>0);
  assert.ok(result.selected_module_ids.length>0);
});

test('dispatch recognizes upgraded Shanghai day sequencing',async()=>{
  const handoff=buildRuntimeInput({city_unit:'shanghai',client:{...client,priorities:['architecture and history']},message:'First visit to Shanghai'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.valid,true);
  assert.equal(result.output_capability,'day_sequence_draft');
  assert.equal(result.days.length,3);
  assert.ok(result.days.every(day=>day.module_ids.length>=1&&day.module_ids.length<=2));
});

test('dispatch recognizes upgraded Chengdu day sequencing',async()=>{
  const handoff=buildRuntimeInput({city_unit:'chengdu_chongqing',runtime_city:'chengdu',client:{...client,priorities:['pandas, tea and food']},message:'First visit to Chengdu'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.output_capability,'day_sequence_draft');
  assert.equal(result.day_sequence_available,true);
  assert.ok(result.days.some(day=>day.module_ids.includes('CDM02')));
});

test('dispatch recognizes Guangzhou and Shenzhen day sequencing',async()=>{
  for(const [runtime,priorities] of [['guangzhou',['food and trade history']],['shenzhen',['technology and hardware']]]){
    const handoff=buildRuntimeInput({city_unit:'guangzhou_shenzhen',runtime_city:runtime,client:{...client,priorities},message:`First visit to ${runtime}`});
    const result=await dispatchRuntime(handoff);
    assert.equal(result.output_capability,'day_sequence_draft',runtime);
    assert.equal(result.day_sequence_available,true,runtime);
    assert.ok(result.days.length>=2,runtime);
  }
});

test('dispatch recognizes Guilin–Yangshuo day sequencing',async()=>{
  const handoff=buildRuntimeInput({city_unit:'guilin_yangshuo',client:{...client,priorities:['karst landscape and river']},message:'First visit to Guilin and Yangshuo'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.output_capability,'day_sequence_draft');
  assert.equal(result.day_sequence_available,true);
  assert.ok(result.days.length>=3);
});

test('dispatch recognizes Hangzhou and Suzhou day sequencing',async()=>{
  for(const [runtime,priorities] of [['hangzhou',['west lake and tea']],['suzhou',['gardens and canals']]]){
    const handoff=buildRuntimeInput({city_unit:'hangzhou_suzhou',runtime_city:runtime,client:{...client,priorities},message:`First visit to ${runtime}`});
    const result=await dispatchRuntime(handoff);
    assert.equal(result.output_capability,'day_sequence_draft',runtime);
    assert.equal(result.day_sequence_available,true,runtime);
    assert.ok(result.days.length>=2,runtime);
  }
});

test('dispatch recognizes Quanzhou–Dehua and Jingdezhen day sequencing',async()=>{
  for(const [city_unit,runtime,priorities] of [['quanzhou_dehua','quanzhou-dehua',['maritime history and religion']],['jingdezhen','jingdezhen',['ceramic material and imperial history']]]){
    const handoff=buildRuntimeInput({city_unit,runtime_city:runtime,client:{...client,priorities},message:`First visit to ${runtime}`});
    const result=await dispatchRuntime(handoff);
    assert.equal(result.output_capability,'day_sequence_draft',runtime);
    assert.equal(result.day_sequence_available,true,runtime);
    assert.ok(result.days.length>=2,runtime);
  }
});

test('dispatch recognizes Wudang and Jingmai day sequencing while preserving research boundaries',async()=>{
  for(const [runtime,priorities] of [['wudang',['heritage architecture']],['jingmai',['tea landscape and walking']]]){
    const handoff=buildRuntimeInput({city_unit:runtime,client:{...client,priorities},message:`First research request for ${runtime}`});
    const result=await dispatchRuntime(handoff);
    assert.equal(result.output_capability,'day_sequence_draft',runtime);
    assert.equal(result.day_sequence_available,true,runtime);
    assert.equal(result.days.length,2,runtime);
    assert.ok(result.days.every(day=>day.module_ids.length<=2),runtime);
    assert.ok(result.warnings.length>0,runtime);
  }
});

test('invalid handoff never loads or executes a city runtime',async()=>{
  const result=await dispatchRuntime({valid:false,errors:['missing city']});
  assert.deepEqual(result,{valid:false,errors:['missing city']});
});

test('dispatch carries a safe commercial contract without supplier or internal records',async()=>{
  const handoff=buildRuntimeInput({city_unit:'jingdezhen',client:{...client,priorities:['ceramic material and imperial history']},message:'First visit to Jingdezhen'});
  const result=await dispatchRuntime(handoff);
  assert.equal(result.valid,true);
  assert.ok(result.commercial.digital_roadbook);
  assert.equal(result.commercial.third_party_experience.may_quote,false);
  assert.equal(result.commercial.third_party_experience.may_take_payment,false);
  assert.equal(result.commercial.product_catalog.products[2].id,'human_checked_roadbook');
  assert.doesNotMatch(JSON.stringify(result.commercial),/supplier|候选供应商|JZM/);
});
