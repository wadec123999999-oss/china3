import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreSource } from './source-score.mjs';

test('migrated Shanghai and Chongqing source packs remain leads/context, never field verification',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  for(const [filename,expectedLength] of [['上海来源包_V0.1.json',40],['重庆来源包_V0.1.json',50]]){
    const records=JSON.parse(fs.readFileSync(path.join(here,filename),'utf8'));
    assert.equal(records.length,expectedLength,filename);
    assert.equal(records.some(x=>x.evidence_status==='field_verified'),false,filename);
    for(const record of records){
      const result=scoreSource(record);
      assert.equal(result.score,record.source_score,record.source_id);
      assert.equal(result.use,record.source_use,record.source_id);
    }
  }
});

function verifyPack(filename,expectedLength){
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,filename),'utf8'));
  assert.equal(records.length,expectedLength);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
}

test('Hangzhou–Suzhou source pack keeps community itinerary signals as leads, not operations',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'杭州苏州来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=10);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Quanzhou–Dehua source pack keeps community signals as leads, never field verification',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'泉州德化来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=6);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>['youtube','reddit','xiaohongshu','mafengwo','qyer'].includes(x.platform))){
    assert.equal(record.source_use,'lead_only',record.source_id);
  }
});

test('Guangzhou–Shenzhen source pack turns tech-access and payment discussion into leads only',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'广州深圳来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=8);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Jingdezhen source pack separates workshop, private access and purchase signals from facts',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'景德镇来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=5);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Guilin–Yangshuo source pack keeps weather, cycling and Longji discussion non-operational',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'桂林阳朔来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=5);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Wudang source pack treats Tai Chi and spiritual expectations as guarded leads',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'武当山来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=5);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Jingmai source pack treats village, ecology and arrival topics as bounded leads',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'景迈茶山来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=4);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});

test('Beijing–Chengdu source pack is parseable, scored, and does not claim field verification',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const records=JSON.parse(fs.readFileSync(path.join(here,'北京成都来源包_V0.1.json'),'utf8'));
  assert.ok(records.length>=13);
  assert.equal(records.some(x=>x.evidence_status==='field_verified'),false);
  for(const record of records){
    const result=scoreSource(record);
    assert.equal(result.score,record.source_score,record.source_id);
    assert.equal(result.use,record.source_use,record.source_id);
  }
  for(const record of records.filter(x=>x.review_status==='community_signal_only')) assert.equal(record.source_use,'lead_only',record.source_id);
});
