import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), '../..');
const databases = [
  ['Shanghai V1', 'outputs/shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'],
  ['Chongqing V1', 'outputs/chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json'],
  ['Beijing', 'outputs/beijing-agent-database-20260802/北京智能体数据库_V0.1.json'],
  ['Chengdu', 'outputs/chengdu-agent-database-20260802/成都智能体数据库_V0.1.json'],
  ['Guangzhou', 'outputs/guangzhou-agent-database-20260802/广州智能体数据库_V0.1.json'],
  ['Shenzhen', 'outputs/shenzhen-agent-database-20260802/深圳智能体数据库_V0.1.json'],
  ['Hangzhou', 'outputs/hangzhou-agent-database-20260802/杭州智能体数据库_V0.1.json'],
  ['Suzhou', 'outputs/suzhou-agent-database-20260802/苏州智能体数据库_V0.1.json'],
  ['Guilin–Yangshuo', 'outputs/guilin-yangshuo-agent-database-20260802/桂林阳朔智能体数据库_V0.1.json'],
  ['Quanzhou–Dehua', 'outputs/quanzhou-dehua-agent-database-20260802/泉州德化智能体数据库_V0.1.json'],
  ['Jingdezhen', 'outputs/jingdezhen-agent-database-20260802/景德镇智能体数据库_V0.1.json'],
  ['Wudang', 'outputs/wudang-agent-database-20260802/武当山智能体数据库_V0.1.json'],
  ['Jingmai', 'outputs/jingmai-agent-database-20260802/景迈茶山智能体数据库_V0.1.json']
];

function identifier(item) {
  return item.id ?? item.模块ID ?? item.ID ?? item.signal_id ?? item.signal;
}

function idsAreUnique(items) {
  return Array.isArray(items) && items.every(identifier) && new Set(items.map(identifier)).size === items.length;
}

let failures = 0;
for (const [name, relativePath] of databases) {
  const data = JSON.parse(await readFile(resolve(root, relativePath), 'utf8'));
  const modules = data.modules ?? data.route_modules;
  const questions = data.follow_up_questions ?? data.follow_up_rules;
  const checks = data.launch_checks ?? data.launch_field_checks ?? data.field_checks;
  const errors = [];
  const status = data.metadata?.status ?? 'legacy_unclassified';
  if (!Array.isArray(modules) || modules.length < 6) errors.push('missing/undersized modules');
  if (!Array.isArray(data.points) || data.points.length < 12) errors.push('missing/undersized points');
  if (!Array.isArray(data.signals) || data.signals.length < 6) errors.push('missing/undersized signals');
  if (!Array.isArray(questions) || questions.length < 4) errors.push('missing/undersized follow-up rules');
  if (!Array.isArray(checks) || checks.length < 4) errors.push('missing/undersized launch/field checks');
  for (const [label, items] of [['modules', modules], ['points', data.points], ['signals', data.signals]]) {
    if (!idsAreUnique(items)) errors.push(`duplicate/missing IDs in ${label}`);
  }
  if (errors.length) {
    failures += 1;
    console.error(`FAIL ${name}: ${errors.join('; ')}`);
  } else {
    console.log(`PASS ${name}: ${modules.length} modules; ${data.points.length} points; ${data.signals.length} signals; status=${status}`);
  }
}
if (failures) process.exitCode = 1;
else console.log(`AUDIT PASS: ${databases.length}/${databases.length} city databases`);
