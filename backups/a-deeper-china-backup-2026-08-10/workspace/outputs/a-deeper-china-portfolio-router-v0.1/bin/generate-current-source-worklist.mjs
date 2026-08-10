#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCurrentSourceTasks } from '../src/current-source-tasks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, '../../a-deeper-china-quality-system-v0.1');
const DEFAULT_CITIES = ['Shanghai', 'Chongqing', 'Beijing', 'Chengdu', 'Guangzhou', 'Shenzhen', 'Quanzhou–Dehua', 'Jingdezhen'];

function arg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const travelStart = arg('--travel-start');
const travelEnd = arg('--travel-end');
const cities = (arg('--cities', DEFAULT_CITIES.join(',')) || '').split(',').map(item => item.trim()).filter(Boolean);
const suffix = arg('--suffix', '');
if (!travelStart || !travelEnd) {
  process.stderr.write('Usage: node bin/generate-current-source-worklist.mjs --travel-start YYYY-MM-DD --travel-end YYYY-MM-DD [--cities City,City]\n');
  process.exitCode = 2;
} else {
  const worklist = cities.map(city => createCurrentSourceTasks({ city, travel_start: travelStart, travel_end: travelEnd }));
  const tasks = worklist.flatMap(item => (item.tasks || []).map(task => ({ ...task, city: item.city })));
  const result = {
    schema_version: '0.1',
    generated_at: '2026-08-03',
    travel_start: travelStart,
    travel_end: travelEnd,
    cities,
    city_results: worklist,
    task_count: tasks.length,
    completed_count: 0,
    boundary: 'All tasks are empty review tasks. They are not evidence and do not approve a route until checked_by, checked_at, evidence_url and finding are completed for the exact travel dates.'
  };
  const slug = `${travelStart}_${travelEnd}${suffix ? `_${suffix}` : ''}`;
  const jsonPath = path.join(outputDir, `日期化来源工作单_${slug}.json`);
  const mdPath = path.join(outputDir, `日期化来源工作单_${slug}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  const lines = [
    '# 日期化来源人工核验工作单',
    '',
    `- 客户旅行：${travelStart} → ${travelEnd}`,
    `- 城市：${cities.join('、')}`,
    `- 待核验任务：${tasks.length}`,
    '- 当前完成：0',
    '',
    '| 城市 | 任务 ID | 模块 | 需要核对的主张 | 状态 |',
    '|---|---|---|---|---|',
    ...tasks.map(task => `| ${task.city || '-'} | ${task.task_id} | ${(task.module_ids || []).join(', ')} | ${task.claim_to_check} | pending |`),
    '',
    '## 核验人必须填写',
    '',
    '- `checked_by`：真实核验人；',
    '- `checked_at`：不晚于 2026-08-03 的真实核验时间；',
    '- `evidence_url`：官方页面、截图、电话记录或现场记录的可追溯链接；',
    '- `finding`：针对客户旅行日期的具体结论。',
    '',
    '空白任务不是证据，不得直接使路书进入 `human_checked_ready`。',
    ''
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}
