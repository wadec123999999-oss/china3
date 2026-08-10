# A Deeper China｜独立站首发页面规格 V1.0

日期：2026-08-03  
适用源码：`/Users/apple/Desktop/china-insider`  
状态：开发前规格；不修改线上网站

## 1. 首发目标

首发版本只验证三件事：

1. 用户是否理解“数字路书”而不是“专家预订”；
2. 用户是否愿意提交完整的旅行简报；
3. 用户是否愿意为具体日期的人工复核路书继续下一步。

首发城市：上海、重庆、泉州。其他城市先作为研究型目的地展示，不承诺同等交付能力。

## 2. 页面一：Home

### 结构

```text
Header
  Logo / Destinations / How it works / Start your brief
Hero
  Eyebrow
  Headline
  Explanation
  Start your brief
  See a sample roadbook
Why this is different
  Read the trip behind the question
  Make trade-offs visible
  Check what changes
How it works
  Tell us → Get direction → Choose a human check → Travel independently
Product cards
  Route Direction
  Human-checked Digital Roadbook
  Limited-release Local Context
Start cities
  Shanghai / Chongqing / Quanzhou
  Research-led destinations
Sample roadbook slice
Footer boundaries
```

### 首发英文文案

**Headline**

`China, understood before you arrive.`

**Body**

`Thoughtful digital roadbooks for independent travelers—shaped by a deep city database and checked by a human when the details matter.`

**Primary CTA**

`Start your trip brief`

**Secondary CTA**

`See a sample roadbook`

**Trust line**

`You book directly. We do not sell tours, tickets, or guided experiences.`

### 需要删除的首页表述

- `Find vetted local experts`
- `Private expert-led matching`
- `Booking path ready`
- 任何“平台保证体验”的暗示

## 3. 页面二：Start a Brief

### 交互原则

不是一个无限聊天窗口，而是“自然语言开场 + 只问会改变路线的问题”。用户可以随时用自然语言回答，也可以跳过非必要字段。

### 步骤

| 步骤 | 必填内容 | 页面提示 |
|---:|---|---|
| 1 | 城市、主题或一句想法 | `Tell us the China you want to understand.` |
| 2 | 日期/可用夜数 | `What time do you actually have?` |
| 3 | 最想要的两项 | `What would make the trip feel worth it?` |
| 4 | 明确不想要的两项 | `What should we avoid?` |
| 5 | 同行与限制 | `Who is traveling, and what changes the pace?` |
| 6 | 步行、天气、饮食、语言等摩擦 | `What practical friction should we plan around?` |
| 7 | 旅行简报确认 | 展示可编辑摘要，再提交 |

### 首屏文案

**Headline**

`Tell us the China you want to understand.`

**Body**

`Start with a city, a feeling, or a half-formed idea. We will ask only the questions that change the route.`

**Placeholder**

`For example: “We have three days in Shanghai and want food, architecture, and time to wander—not a packed checklist.”`

### 数据状态

- `draft`：只保存在浏览器内，用户可编辑；
- `ready_for_direction`：字段足够生成路线方向；
- `direction_generated`：已得到路线方向；
- `human_check_requested`：用户主动申请人工复核；
- `roadbook_delivered`：已发布路书。

默认不要求登录；只有保存、申请人工复核或购买时才要求邮箱/账户。

## 4. 页面三：Route Direction

### 页面目的

给用户第一轮判断，不伪装成最终行程，也不输出未核验的实时承诺。

### 内容结构

```text
Your route direction
  One-sentence recommendation
  Why this fits your brief
  What we are assuming
  What to protect / what to drop
  Suggested city sequence and minimum nights
  One main line
  One fallback logic
  What needs a human check
Actions
  Edit my brief
  Request a human-checked roadbook
  Start another direction
Status label
  Research direction — not a booking or live availability check
```

### 必须出现的边界

`This is a research direction, not a booking, live availability check, or guarantee of access.`

### 路由器接口

- 初始自然语言：`POST /api/route-direction`；
- 结构化输入：`POST /api/runtime-input`；
- 城市运行时和按天草稿：`POST /api/dispatch-runtime`。

前端只渲染 API 的公开输出，不显示数据库原文、来源记录、供应商候选或内部评分。

## 5. 页面四：Human-checked Roadbook

### 申请页

用户必须确认：

- 实际日期或日期范围；
- 城市和实际停留夜数；
- 同行人及重要限制；
- 想复核的动态事项；
- 交付时限、修改次数、价格和退款规则。

### 路书页

每份路书必须显示：

- 路书版本号；
- 状态标签；
- 最后人工复核日期；
- 复核范围；
- 失效或需要再次确认的事项；
- 每天的主线、备选和行动项；
- 客户自行预订/确认的事项。

推荐状态文案：

- `Research roadbook draft`
- `Human check requested`
- `Human-checked digital roadbook — reviewed on [date]`

## 6. 组件清单

### 新组件

- `ProductStatusBadge`
- `DestinationCard`
- `TripBriefForm`
- `TripBriefSummary`
- `RouteDirectionCard`
- `AssumptionsPanel`
- `FallbackPlanCard`
- `HumanCheckRequestForm`
- `RoadbookStatusBanner`
- `RoadbookDayCard`
- `ReviewDateNotice`
- `DirectBookingBoundary`

### 可复用组件

- 当前 `SiteHeader` 的布局骨架；
- 当前图片卡片和字体体系；
- 当前通用 Button、Card、Input、Dialog；
- 当前错误提示、加载状态和移动端布局工具。

### 首版不继续扩展

- 语音作为主价值入口；
- 专家筛选器；
- 平台订单状态；
- 实时聊天客服；
- 复杂会员等级；
- 供应商后台。

## 7. 路由迁移

| 旧路由 | 首发处理 |
|---|---|
| `/` | 保留 URL，重做内容 |
| `/chat` | 保留兼容入口，内部迁移到 Start a Brief |
| `/experts` | 重定向到 `/how-it-works` 或暂时下线 |
| `/experts/[slug]` | 不进入主导航，保留 404/重定向策略 |
| `/booking` | 暂时下线，不展示付款流程 |
| `/account` | 后置改为 `/my-roadbooks` |
| `/roadbooks/[id]` | 新增 |
| `/route-direction` | 新增 |
| `/how-it-works` | 新增 |

## 8. 第一轮实现验收

- 首页首屏不出现 Experts、Booking 或平台收款承诺；
- 用户点击主 CTA 后无需登录即可开始；
- 一句自然语言可生成路线方向；
- 路线方向页明确区分研究草稿与人工复核；
- 上海、重庆、泉州能从城市卡片进入对应 brief；
- API 失败时有可理解的重试和保存提示；
- 所有旧页面仍有明确重定向或下线策略；
- 通过 typecheck、test、build 后才进入预览环境。

