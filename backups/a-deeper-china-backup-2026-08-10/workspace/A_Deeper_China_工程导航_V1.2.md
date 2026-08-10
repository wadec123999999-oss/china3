# A Deeper China｜工程导航 V1.2

这份文件是当前工作区的入口说明。它不删除旧版文件；旧版 PDF、Word 和历史输出保留，但不应作为当前数据库运行时的唯一来源。

## 当前正式主线

### 1. 城市数据库与运行时

目录：

```text
/Users/apple/Documents/旅游视频/outputs/
```

核心组合路由：

```text
outputs/a-deeper-china-portfolio-router-v0.1/
```

已覆盖 13 个城市单元：

上海、重庆、北京、成都、广州、深圳、桂林/阳朔、杭州、苏州、泉州/德化、景德镇、武当山、景迈茶山。

## 当前正式输出

- [公开样本包](</Users/apple/Documents/旅游视频/roadbook-sample-pack-v1.1/>)
- [公开 JSON Schema](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-portfolio-router-v0.1/public-roadbook.schema.json>)
- [独立站接入说明 V1.2](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-portfolio-router-v0.1/独立站接口接入说明_V1.2.md>)
- [交付准备与现场核验报告](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1/交付准备与现场核验优先级_V0.1.md>)

## 现场核验主线

- [现场任务包 V0.2](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1/field-review-task-packs_V0.2.json>)
- [上海/重庆 P0 执行包](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1/P0现场执行包_20260803.md>)
- [P0 空白记录模板](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1/现场记录模板_P0_20260803/>)
- [P0 进度报告](</Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1/现场记录模板_P0_20260803/PROGRESS.md>)

当前现场核验状态：

- 现场任务：22 个；
- 已通过现场核验：0 个；
- 所有空白记录均为 `incomplete`，不能作为销售证据。

## 常用命令

在组合路由目录执行：

```bash
cd /Users/apple/Documents/旅游视频/outputs/a-deeper-china-portfolio-router-v0.1

# 生成 13 城市公开样本
npm run generate-samples

# 运行所有审计
npm run audit:all

# 生成指定客户日期的日期化来源工作单
node bin/generate-current-source-worklist.mjs \
  --travel-start 2026-09-10 \
  --travel-end 2026-09-13 \
  --cities Shanghai,Chongqing

# 校验工作单
node bin/validate-current-source-worklist.mjs \
  ../a-deeper-china-quality-system-v0.1/日期化来源工作单_2026-09-10_2026-09-13.json

# 生成 human-review packet
node bin/human-review-packet.mjs \
  samples/client-brief-shanghai-20260910-13-illustrative.json \
  --markdown
```

在质量系统目录执行：

```bash
cd /Users/apple/Documents/旅游视频/outputs/a-deeper-china-quality-system-v0.1

# 生成 P0 空白现场记录
node bin/generate-p0-field-templates.mjs

# 扫描现场记录进度
node bin/scan-field-progress.mjs --travel-start 2026-09-10

# 将真实 pass 记录转换为 field_run evidence
node bin-field-evidence.mjs \
  现场记录模板_P0_20260803/SH-FIELD-001.json \
  --travel-start 2026-09-10
```

## 版本和边界

## 海外流量与获客主线（2026-08-08新增）

流量当前优先于网站视觉。首发策略是“13个目的地数据库、4组路线入口、先卖US$39 Reality Check”。

- [海外流量专业调查 V1.0](</Users/apple/Documents/旅游视频/outputs/A-Deeper-China海外流量专业调查_V1.0.md>)
- [真正流量操盘方案 V2.0](</Users/apple/Documents/旅游视频/outputs/A-Deeper-China真正流量操盘方案_V2.0.md>)
- [海外流量小白落地方案 V1.0](</Users/apple/Documents/旅游视频/outputs/A-Deeper-China海外流量小白落地方案_V1.0.md>)
- [30天海外流量执行表 V1.0](</Users/apple/Documents/旅游视频/outputs/traffic-research-v1/A-Deeper-China_30天海外流量执行表_V1.0.md>)
- [第一周获客启动包 V1.0](</Users/apple/Documents/旅游视频/outputs/traffic-research-v1/A-Deeper-China_第一周获客启动包_V1.0.md>)
- [Google/YouTube关键词样本](</Users/apple/Documents/旅游视频/outputs/traffic-research-v1/autocomplete-keywords-20260808.csv>)

执行顺序：YouTube Shorts + Reddit回答 → 免费Route Signal → US$39 Reality Check → US$99+ Deep City Roadbook。网站暂时只做轻量承接，不继续投入完整视觉重做。

- `roadbook-sample-pack-v1.1`：文件目录仍保留 V1.1 名称，公开 JSON 内部已包含 V1.2 `renderer_version` 和执行字段，以保持现有网站兼容性。
- `draft_for_human_review`：可以作为研究草稿交给人工复核，不能视为已验证路线。
- `human_checked_ready`：必须有日期化证据、真实现场证据（如路线依赖现场）和人工审核记录。
- 数据库不会自动预订、收款、保证供应商、保证开放或承诺私人访问。
- 网站目前冻结；接入时只读取公开 JSON，不读取原始数据库和内部质量字段。

## 下一步唯一关键动作

执行上海、重庆 P0 现场任务，填写真实日期、路线轨迹、照片/官方记录、天气人流和具体 finding。没有这些真实记录，系统不会把任何城市标记为整体可售。
