#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { portfolioReadiness } from '../portfolio-readiness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '../交付准备与现场核验优先级_V0.1.md');
const rows = portfolioReadiness();

const priorityOrder = { P0: 0, P1: 1, P2: 2 };
const sorted = [...rows].sort((a, b) => (priorityOrder[a.operator_priority] ?? 9) - (priorityOrder[b.operator_priority] ?? 9) || a.city.localeCompare(b.city));
const totalSources = rows.reduce((sum, row) => sum + row.source_record_count, 0);
const totalRefresh = rows.reduce((sum, row) => sum + row.dated_refresh_record_count, 0);
const totalCurrent = rows.reduce((sum, row) => sum + row.dated_refresh_dynamic_count, 0);
const totalFieldTasks = rows.reduce((sum, row) => sum + row.field_task_count, 0);
const totalFieldPassed = rows.reduce((sum, row) => sum + row.field_verified_records, 0);

const actionFor = row => {
  if (row.field_task_count > 0) return '执行现有现场任务包；只有 pass + 证据才能进入 release gate';
  if (row.dated_refresh_dynamic_count > 0 || row.requires_current_check > 0) return '客户有具体日期后生成 current-source tasks，并安排人工核验';
  return '先补充日期化来源，再建立首个现场任务包';
};

const lines = [
  '# A Deeper China｜交付准备与现场核验优先级',
  '',
  '**生成时间：** 2026-08-03  ',
  '**用途：** 内部运营、人工复核和付费路书交付前检查，不是对客宣传材料。',
  '',
  '## 当前结论',
  '',
  `- 城市单元：${rows.length}`,
  `- 研究来源记录：${totalSources}`,
  `- 日期化刷新记录：${totalRefresh}（其中需当前核验 ${totalCurrent}）`,
  `- 已建立现场任务：${totalFieldTasks}`,
  `- 已通过现场核验：${totalFieldPassed}`,
  '- 当前没有任何城市可以整体标记为预批准或自动可售。每份客户路书都必须经过日期化来源和人工 release gate。',
  '',
  '## 操作优先级',
  '',
  '| 优先级 | 城市 | 来源 | 当前核验 | 现场任务 | 当前动作 |',
  '|---|---|---:|---:|---:|---|',
  ...sorted.map(row => `| ${row.operator_priority} | ${row.city} | ${row.source_record_count} | ${row.requires_current_check} | ${row.field_task_count} | ${actionFor(row)} |`),
  '',
  '## 交付边界',
  '',
  '- `research_draft`：可以用于内部研究和生成路线草案，不能对客户保证开放、价格、预约或访问。',
  '- `draft_for_human_review`：已经完成路线判断，但必须完成客户日期核验和人工复核。',
  '- `human_checked_ready`：只有 dated source、真实现场证据和人工 review record 同时满足时才允许使用。',
  '- 专家、茶农、工作室、寺观、工厂、居民和私密场所都不能因为网络线索而自动成为可售体验。',
  '',
  '## 下一轮执行顺序',
  '',
  '1. 上海、重庆：执行已有 P0 现场任务，优先验证外滩/滨水、博物馆、洪崖洞外部路线、李子坝和城市低摩擦替代。',
  '2. 泉州/德化、景迈：补齐公共访问、住宿/道路、社区同意和工艺体验边界。',
  '3. 北京、成都、广州、深圳、景德镇：已有首批现场任务包；客户有真实日期后叠加 current-source tasks，再安排现场执行。',
  '4. 桂林/阳朔、杭州/苏州、武当山：先做日期化开放/天气/交通核验，再决定现场投入。',
  '',
  '## 现场记录规则',
  '',
  '- 模板默认 `incomplete`；不得用推测、网络评论或供应商自述改成 `pass`。',
  '- `conditional_pass`、`fail`、`incomplete` 都不能转成 release evidence。',
  '- 每条 pass 必须包含真实核验人、日期、证据、具体 finding 和可复现条件。',
  '',
  '本报告由当前 readiness 数据生成；来源和现场状态变化后应重新生成。',
  ''
];

fs.writeFileSync(output, lines.join('\n'), 'utf8');
console.log(`Wrote ${output}`);
