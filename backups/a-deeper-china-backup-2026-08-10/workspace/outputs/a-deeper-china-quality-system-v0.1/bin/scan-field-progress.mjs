#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanFieldRecords } from '../field-progress.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../现场记录模板_P0_20260803');
const travelIndex = process.argv.indexOf('--travel-start');
const travelStart = travelIndex >= 0 ? process.argv[travelIndex + 1] : null;
const result = scanFieldRecords({ directory, travelStart });
const outputJson = path.join(directory, 'PROGRESS.json');
const outputMd = path.join(directory, 'PROGRESS.md');
fs.writeFileSync(outputJson, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
const lines = [
  '# P0 现场核验进度',
  '',
  `- 扫描记录：${result.total}`,
  `- incomplete：${result.incomplete}`,
  `- pass：${result.pass}`,
  `- conditional_pass：${result.conditional_pass}`,
  `- fail：${result.fail}`,
  `- 当前可转 release evidence：${result.evidence_eligible}`,
  `- 客户旅行首日：${result.travel_start || '未指定'}`,
  '',
  '| 任务 | 城市 | 结果 | 记录有效 | 证据数 | 可转 evidence | 缺口 |',
  '|---|---|---|---|---:|---|---|',
  ...result.records.map(item => `| ${item.task_id || item.file} | ${item.city || '-'} | ${item.result || '-'} | ${item.valid ? '是' : '否'} | ${item.evidence_count} | ${item.evidence_eligible ? '是' : '否'} | ${(item.validation_errors || []).concat(item.evidence_errors || []).join('; ') || '-'} |`),
  '',
  '规则：只有真实 `pass`、真实核验人、日期、客户旅行首日和 HTTPS 证据才能进入 release gate。'
];
fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);
