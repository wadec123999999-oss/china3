# A Deeper China｜独立站改版实施蓝图 V1.0

日期：2026-08-03  
状态：设计与接入准备；网站线上版本冻结，未修改、未部署

## 1. 最终决策

**保留过去的技术底座，重做产品层、信息架构和主要前台流程。**

不建议重新搭建一套全新的技术系统，也不建议在旧的“专家/预订/平台收款”叙事上继续打补丁。旧站的可复用资产包括 Next.js/Vercel/Supabase 架构、部署方式、部分视觉素材和通用组件；旧站需要被替换的是产品承诺、页面层级、字段设计和交付流程。

## 2. 新产品定义

> A Deeper China creates human-checked digital roadbooks for independent travelers.

中文内部定义：

> 通过城市深度数据库识别客户明确需求和隐性意图，先输出路线方向，再根据具体日期和限制做人工复核，交付可执行的数字路书。

首发不承诺：代订、带团、专家撮合、实时库存、私密场所进入、宗教访问或任何未完成核验的体验。

## 3. 新信息架构

```text
Home
├── Destinations
│   ├── Shanghai
│   ├── Chongqing
│   ├── Quanzhou
│   ├── Beijing
│   ├── Chengdu
│   └── Other research-led cities
├── Start a Brief
├── Route Direction
├── Request Human Check
├── My Roadbooks
└── How It Works
```

### 全局导航规则

- 首屏只保留一个主行动：`Start your brief`。
- `Experts` 从主导航移除，改成 `How it works` 或产品边界说明。
- `My Roadbooks` 只有在用户生成或购买路书后显示，避免首次访问要求登录。
- 城市页面展示产品等级，不展示内部供应商、来源评分或未公开字段。

## 4. 页面与交付物

| 页面 | 用户任务 | 首版必须交付 | 数据来源 |
|---|---|---|---|
| Home | 理解产品并开始 | 定位、差异、样本、城市入口 | 固定内容 + `/api/destinations` |
| Destinations | 判断城市是否适合自己 | 城市卡片、停留建议、适合/不适合 | `/api/destinations` |
| Destination detail | 理解一个城市的取舍 | 主题、路线逻辑、边界、开始简报 | 城市公开模块 |
| Start a Brief | 结构化表达需求 | 自然语言 + 关键追问 + 可编辑摘要 | `/api/route-direction` |
| Route Direction | 获得第一轮判断 | 城市/顺序/节奏方向、隐性需求假设 | `/api/route-direction` + `/api/runtime-input` |
| Human Check | 请求具体复核 | 日期、夜数、限制、复核范围、交付规则 | `/api/roadbook-brief` |
| Roadbook | 阅读可执行路线 | 按天路书、主线、备选、行动项、状态 | `/api/dispatch-runtime` |
| My Roadbooks | 管理已保存内容 | 版本、复核日期、下载、反馈 | Supabase（后置） |

## 5. 数据接入边界

### 前端允许读取

- 城市名称、主题、最少夜数、公开摘要、产品等级。
- 客户可读的路线方向和 `roadbook_markdown`。
- 路书状态：`research_draft`、`human_check_requested`、`human_checked_ready`。
- 复核日期、需要客户自行确认的事项和失效提醒。

### 前端禁止读取

- 原始城市数据库 JSON。
- 内部来源记录、评分、证据链和审核备注。
- 候选供应商、私人联系方式和未获同意的资源信息。
- 内部风险字段、人工审核队列和其他客户的 brief。

### API 映射

```text
Start a Brief       → POST /api/route-direction
结构化 intake       → POST /api/runtime-input
生成城市路书草稿    → POST /api/dispatch-runtime
申请人工复核        → POST /api/roadbook-brief
城市列表            → GET  /api/destinations
```

API 当前是无状态适配层；接入独立站时采用同源 `/api/...`，不把数据库直接打包到浏览器。`dispatch-runtime` 的输出必须标记为研究草稿，不能直接显示为已人工核验成品。

## 6. 旧功能迁移矩阵

| 旧功能 | 处理方式 | 原因 |
|---|---|---|
| 城市卡片 | 保留结构，重写文案和状态 | 资产可复用，但需与数据库状态一致 |
| Chat | 改名并改流程为 `Start a Brief` | 对话只是入口，路书才是交付物 |
| Experts | 下线或重写为边界说明 | 当前没有足够的可售专家资源证据 |
| Booking | 首版移除 | 不做代订和平台履约 |
| Payment | 后置 | 先验证路线方向和人工复核是否有人付费 |
| Account | 改为 `My Roadbooks` | 用户要管理交付物，不是管理专家 |
| Workspace | 保留技术能力，改为路书工作区 | 对接 brief、版本、反馈 |

## 7. 分阶段实施

### 阶段 0：冻结与备份

- 保持线上站点不变。
- 获取源码仓库、环境变量清单、Supabase schema 和部署权限。
- 建立 `codex/site-redesign` 分支和预览环境。
- 记录旧路由，必要时做 301/软重定向清单。

### 阶段 1：产品层重构

- 替换首页定位和 CTA。
- 完成新导航、城市状态标签和产品边界。
- 建立 `Start a Brief` 的字段与状态模型。
- 先用上海、重庆、泉州验证。

### 阶段 2：API 接入

- 将现有 `site-api.mjs` 接入 Next.js route handler。
- 先接 `/api/destinations`、`/api/route-direction` 和 `/api/dispatch-runtime`。
- 前端显示研究草稿状态及动态信息提醒。
- 不公开内部来源和审核字段。

### 阶段 3：人工复核与路书

- 接入 `/api/roadbook-brief`。
- 建立内部审核队列和客户路书版本号。
- 支持人工复核日期、风险、失效时间和客户反馈。
- 上海真实现场记录完成后再启用 `human_checked_ready`。

### 阶段 4：收费与扩展

- 先完成少量真实交付和退款/修改规则。
- 再接支付与客户账户。
- 最后复制到其他城市，不提前把所有城市显示为同等可售。

## 8. 验收标准

网站改版完成前必须同时满足：

1. 用户在 10 秒内知道交付物是数字路书，不是导游或预订平台。
2. 用户无需登录即可开始 brief。
3. 从一句自然语言输入可以得到路线方向和下一步问题。
4. 每份路书显示当前状态、复核日期和未确认事项。
5. 前端不会泄露原始数据库、供应商隐私或内部审核字段。
6. 没有任何页面暗示平台保证体验、代订或实时库存。
7. 上海、重庆、泉州至少各有一个可读的样本或研究型输出。
8. 线上旧站未被直接覆盖，所有改动先在预览环境验证。

## 9. 当前进入开发所需条件

目前不需要推倒数据库或 API；真正缺少的是独立站源码和部署权限。开始代码阶段前，需要：

- Git 仓库地址或本地源码目录；
- 当前 Vercel 项目所属账号/团队权限；
- Supabase 项目与 schema 访问方式；
- 是否保留现有品牌字体、颜色和图片素材的决定。

在这些条件到位前，继续做内容、数据协议和验收标准是安全的；不应修改线上站点或部署未知版本。

