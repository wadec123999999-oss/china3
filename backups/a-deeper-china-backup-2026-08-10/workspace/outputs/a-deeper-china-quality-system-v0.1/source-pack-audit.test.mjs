import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditAllManifestPacks, auditSourcePack } from './source-pack-audit.mjs';
import { scoreSource } from './source-score.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('all current source packs pass strict temporal and reference audit', () => {
  const result = auditAllManifestPacks({ asOf: '2026-08-03T23:59:59+08:00' });
  assert.equal(result.valid, true, JSON.stringify(result, null, 2));
  assert.equal(result.results.length, 13);
  assert.ok(result.results.every(item => item.count > 0));
});

test('source-pack audit rejects future captures and false field verification', () => {
  const record = {
    schema_version: '0.1',
    source_id: 'SRC-TEST-20260803-001',
    platform: 'official',
    url: 'https://example.com/source',
    captured_at: '2026-08-04T00:00:00+08:00',
    published_at: null,
    city_scope: ['Test'],
    claim_type: 'heritage_context',
    claim: 'A sufficiently long claim for the audit test.',
    commercial_signal: 'none_seen',
    independence: 'official_primary',
    evidence_status: 'field_verified',
    review_status: 'usable_as_context',
    corroboration_ids: [],
    source_score: 95,
    source_use: 'eligible_for_human_checked'
  };
  const result = auditSourcePack([record], { city: 'Test', asOf: '2026-08-03T23:59:59+08:00' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('after audit date')));
  assert.ok(result.errors.some(error => error.includes('claims field verification')));
});

test('source-pack audit catches broken corroboration and module bindings', () => {
  const databasePath = path.join(here, '..', 'beijing-agent-database-20260802', '北京智能体数据库_V0.1.json');
  const record = {
    schema_version: '0.1',
    source_id: 'SRC-BEIJING-20260803-001',
    platform: 'official',
    url: 'https://example.com/source',
    captured_at: '2026-08-03T00:00:00+08:00',
    published_at: null,
    city_scope: ['Beijing'],
    claim_type: 'heritage_context',
    claim: 'A sufficiently long claim for the audit test.',
    commercial_signal: 'none_seen',
    independence: 'official_primary',
    evidence_status: 'lead_only',
    review_status: 'unreviewed',
    corroboration_ids: ['SRC-BEIJING-20260803-999'],
    module_ids: ['BJM99'],
    source_score: 95,
    source_use: 'context_with_citation'
  };
  const result = auditSourcePack([record], { city: 'Beijing', databasePath, asOf: '2026-08-03T23:59:59+08:00' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('unknown module BJM99')));
  assert.ok(result.errors.some(error => error.includes('references missing source')));
});

test('dated Shanghai and Chongqing refresh packs pass without claiming field verification', () => {
  const shanghaiDatabase = path.join(here, '..', 'shanghai-agent-database-20260802', '上海主城智能体数据库_V1.0.json');
  const chongqingDatabase = path.join(here, '..', 'chongqing-agent-database-20260729', '重庆主城智能体数据库_V1.0.json');
  const shanghai = JSON.parse(fs.readFileSync(path.join(here, '上海当前来源刷新_20260803.json'), 'utf8'));
  const chongqing = JSON.parse(fs.readFileSync(path.join(here, '重庆当前来源刷新_20260803.json'), 'utf8'));
  const shanghaiResult = auditSourcePack(shanghai, { city: 'Shanghai', databasePath: shanghaiDatabase, asOf: '2026-08-03T23:59:59+08:00' });
  const chongqingResult = auditSourcePack(chongqing, { city: 'Chongqing', databasePath: chongqingDatabase, asOf: '2026-08-03T23:59:59+08:00' });
  assert.equal(shanghaiResult.valid, true, JSON.stringify(shanghaiResult));
  assert.equal(chongqingResult.valid, true, JSON.stringify(chongqingResult));
  assert.ok([...shanghai, ...chongqing].every(record => record.evidence_status !== 'field_verified'));
});

test('dated Beijing and Chengdu refresh packs pass without carrying seasonal claims forward', () => {
  const beijingDatabase = path.join(here, '..', 'beijing-agent-database-20260802', '北京智能体数据库_V0.1.json');
  const chengduDatabase = path.join(here, '..', 'chengdu-agent-database-20260802', '成都智能体数据库_V0.1.json');
  const beijing = JSON.parse(fs.readFileSync(path.join(here, '北京当前来源刷新_20260803.json'), 'utf8'));
  const chengdu = JSON.parse(fs.readFileSync(path.join(here, '成都当前来源刷新_20260803.json'), 'utf8'));
  const beijingResult = auditSourcePack(beijing, { city: 'Beijing', databasePath: beijingDatabase, asOf: '2026-08-03T23:59:59+08:00' });
  const chengduResult = auditSourcePack(chengdu, { city: 'Chengdu', databasePath: chengduDatabase, asOf: '2026-08-03T23:59:59+08:00' });
  assert.equal(beijingResult.valid, true, JSON.stringify(beijingResult));
  assert.equal(chengduResult.valid, true, JSON.stringify(chengduResult));
  assert.ok([...beijing, ...chengdu].every(record => record.evidence_status !== 'field_verified'));
  assert.ok(beijing.some(record => record.claim_type === 'weather_or_season'));
});

test('dated Guangzhou/Shenzhen and Hangzhou/Suzhou refresh packs preserve weak-source boundaries', () => {
  const guangzhouDatabase = path.join(here, '..', 'guangzhou-agent-database-20260802', '广州智能体数据库_V0.1.json');
  const shenzhenDatabase = path.join(here, '..', 'shenzhen-agent-database-20260802', '深圳智能体数据库_V0.1.json');
  const hangzhouDatabase = path.join(here, '..', 'hangzhou-agent-database-20260802', '杭州智能体数据库_V0.1.json');
  const suzhouDatabase = path.join(here, '..', 'suzhou-agent-database-20260802', '苏州智能体数据库_V0.1.json');
  const combined = JSON.parse(fs.readFileSync(path.join(here, '广州深圳当前来源刷新_20260803.json'), 'utf8'));
  const jiangnan = JSON.parse(fs.readFileSync(path.join(here, '杭州苏州当前来源刷新_20260803.json'), 'utf8'));
  for (const [records, city, databasePath] of [
    [combined, 'Guangzhou', guangzhouDatabase],
    [combined, 'Shenzhen', shenzhenDatabase],
    [jiangnan, 'Hangzhou', hangzhouDatabase],
    [jiangnan, 'Suzhou', suzhouDatabase]
  ]) {
    const scoped = records.filter(record => record.city_scope.some(scope => scope === city));
    const result = auditSourcePack(scoped, { city, databasePath, asOf: '2026-08-03T23:59:59+08:00' });
    assert.equal(result.valid, true, `${city}: ${JSON.stringify(result)}`);
  }
  const weakHangzhou = jiangnan.filter(record => record.city_scope.includes('Hangzhou'));
  assert.ok(weakHangzhou.every(record => record.source_use !== 'eligible_for_human_checked'));
});

test('last five city refresh packs preserve official-vs-lead boundaries', () => {
  const cases = [
    ['桂林阳朔当前来源刷新_20260803.json', 'Guilin–Yangshuo', 'guilin-yangshuo-agent-database-20260802', '桂林阳朔智能体数据库_V0.1.json'],
    ['泉州德化当前来源刷新_20260803.json', 'Quanzhou–Dehua', 'quanzhou-dehua-agent-database-20260802', '泉州德化智能体数据库_V0.1.json'],
    ['景德镇当前来源刷新_20260803.json', 'Jingdezhen', 'jingdezhen-agent-database-20260802', '景德镇智能体数据库_V0.1.json'],
    ['武当山当前来源刷新_20260803.json', 'Wudang Mountains', 'wudang-agent-database-20260802', '武当山智能体数据库_V0.1.json'],
    ['景迈茶山当前来源刷新_20260803.json', 'Jingmai Mountain', 'jingmai-agent-database-20260802', '景迈茶山智能体数据库_V0.1.json']
  ];
  for (const [filename, city, databaseDir, databaseFile] of cases) {
    const records = JSON.parse(fs.readFileSync(path.join(here, filename), 'utf8'));
    const result = auditSourcePack(records, {
      city,
      databasePath: path.join(here, '..', databaseDir, databaseFile),
      asOf: '2026-08-03T23:59:59+08:00'
    });
    assert.equal(result.valid, true, `${city}: ${JSON.stringify(result)}`);
    for (const record of records) {
      const score = scoreSource(record);
      assert.equal(score.score, record.source_score, `${city}/${record.source_id}`);
      assert.equal(score.use, record.source_use, `${city}/${record.source_id}`);
    }
    assert.ok(records.every(record => record.evidence_status !== 'field_verified'));
  }
});
