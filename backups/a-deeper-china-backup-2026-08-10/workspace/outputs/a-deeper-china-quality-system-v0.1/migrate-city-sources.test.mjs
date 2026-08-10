import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrateCitySources } from './migrate-city-sources.mjs';

test('migrates Chongqing legacy sources into auditable source records',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const records=migrateCitySources(path.join(root,'chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json'));
  assert.equal(records.length,50);
  assert.equal(records.find(x=>x.legacy_source_id==='SRC013').source_use,'requires_current_check');
  assert.equal(records.find(x=>x.legacy_source_id==='SRC027').platform,'reddit');
  assert.equal(records.find(x=>x.legacy_source_id==='SRC036').commercial_signal,'seller_or_provider');
  assert.deepEqual(records[0].city_scope,['Chongqing','重庆主城']);
});

test('also migrates source fields embedded in Shanghai point records',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const records=migrateCitySources(path.join(root,'shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'));
  assert.equal(records.length,40);
  assert.equal(records[0].city_scope[0],'Shanghai core');
  assert.equal(records.find(x=>x.legacy_source_id==='SH019').platform,'reddit');
  assert.equal(records.find(x=>x.legacy_source_id==='SH010').source_use,'requires_current_check');
});

test('migrates V0.1 source-policy lists without pretending they are field records',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const records=migrateCitySources(path.join(root,'beijing-agent-database-20260802/北京智能体数据库_V0.1.json'));
  assert.equal(records.length,5);
  assert.equal(records.every(x=>x.evidence_status==='lead_only'),true);
  assert.equal(records.every(x=>x.source_use==='requires_current_check'),true);
});
