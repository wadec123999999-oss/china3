# A Deeper China / 旅游智能体工作区说明

当需要继续处理旅游智能体时，先读取：

1. `A_Deeper_China_工程导航_V1.2.md`
2. `outputs/a-deeper-china-portfolio-router-v0.1/README.md`
3. `outputs/a-deeper-china-portfolio-router-v0.1/跨城市旅行智能体系统提示词_V0.1.md`

## 唯一运行入口

组合路由目录：

`outputs/a-deeper-china-portfolio-router-v0.1/`

这是当前正式的读取和分发入口。城市数据库位于同级 `outputs/` 目录，检索优先使用：

`outputs/a-deeper-china-portfolio-router-v0.1/rag/portfolio-city-knowledge-v1.jsonl`

不要把旧版 PDF、Word、`tmp/` 预览或网站静态文案当作数据库运行时来源。

## 常用命令

```bash
cd /Users/apple/Documents/旅游视频/outputs/a-deeper-china-portfolio-router-v0.1
npm run audit:all
npm run converse -- "I have four nights and care about food and urban life."
npm run route -- path/to/request.json
npm run runtime-input -- path/to/roadbook-brief.json
npm run dispatch-runtime -- path/to/runtime-handoff.json
```

`runtime-input` 要求确认的到达和离开日期时间；`examples/client-brief.draft.example.json` 是故意不完整的草稿，运行后出现 `valid: false` 不代表文件读失败。

## 安全边界

- 缺少日期、城市或关键约束时，先返回问题，不要编造路线。
- 动态交通、天气、开放时间、供应商和社区访问必须经过当前核验。
- 未完成人工核验的内容只能标记为 `research_draft`，不能写成已确认、可预订或已现场验证。
