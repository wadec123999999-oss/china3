# A Deeper China｜独立站前端产品与视觉方案 V2.0

更新：2026-08-09
状态：开发规格；不修改线上站点

## 1. 结论

不需要推倒重做技术底座，但需要重做产品层、信息架构和首屏叙事。

独立站不应该首先展示“AI聊天”或“13个城市数据库”，而应该让游客完成一个任务：

> **在出发前，把自己的中国行程保留、删减、重排并确认。**

英文产品定位：

```text
Fix your China itinerary before you fly.
Keep. Cut. Reorder. Verify.
```

## 2. 首发用户与商业目标

首发用户：英语用户，第一次或第二次来中国，计划8—18天，已经开始做行程，担心城市太多、转场太累或AI路线不可靠。

首发商业漏斗：

```text
内容/社区/创作者
    ↓
Route Signal（免费路线判断）
    ↓
China Trip Reality Check（US$39）
    ↓
Deep City Roadbook（US$99+）
```

首发阶段不做：代订、导游、专家撮合、私人访问、实时库存、旅行套餐。

## 3. 视觉方向

### 设计主题

**Editorial Field Notebook：编辑型旅行档案，而不是AI控制台。**

气质：安静、准确、有人的判断、带一点旅行研究档案感。页面像一本高级城市观察杂志，而不是聊天机器人产品页。

### 签名动作

**Decision Rail（决策轨道）**：所有主要输出都用一条窄侧栏或横向标签显示：

```text
KEEP  保留什么
CUT   删除什么
MOVE  如何重排
VERIFY 出发前确认什么
```

它在首页案例、路线方向页和路书页各出现一次，形成品牌记忆。

### 视觉令牌

| 类型 | 方案 |
|---|---|
| 背景 | Warm Paper `#F4F1EA` |
| 主文字 | Ink `#1D1B18` |
| 次文字 | Slate `#6E6B65` |
| 主强调 | Vermilion `#C74B32` |
| 辅助强调 | Deep Indigo `#273B59` |
| 边框 | Ink 12% opacity hairline |
| Display字体 | Instrument Serif 或同类有性格衬线体 |
| 正文字体 | Source Sans 3 / Inter，保持清晰可读 |
| 等宽字体 | DM Mono，用于日期、状态和更新时间 |
| 圆角 | 4px、10px、18px三档；避免全部胶囊化 |
| 阴影 | 极轻纸张层叠阴影，禁止大面积玻璃拟态 |
| 动效 | 150—450ms，遵守 `prefers-reduced-motion` |

## 4. 首页结构

### Header

左侧：A Deeper China标志；右侧：`How it works`、`Destinations`、`See a sample`、主按钮 `Start your brief`。

导航最多4个入口，不放 `Experts`、`Booking`、`Marketplace`。

### Hero

标题：

```text
China, understood before you arrive.
```

副标题：

```text
We help independent travelers fix the China itinerary they already have—before the trains, transfers and “must-see” list take over.
```

主按钮：`Start your trip brief`

辅助动作：`See a real route decision`

首屏旁边不是聊天框，而是一张路线决策卡：

```text
14 days · 5 cities · first visit
KEEP  Beijing, Shanghai, Chengdu
CUT   one remote detour
VERIFY  arrival-day recovery and rail connections
```

### 首页下半部分

1. **The problem**：游客不缺景点，缺的是取舍。
2. **How it works**：Tell us → Get direction → Request a human check → Book independently。
3. **One real decision**：路线前后对比案例。
4. **Four route questions**：上海、北京、成都—重庆、广州—深圳/桂林—阳朔。
5. **What we do not do**：不代订、不售团、不承诺私人访问。
6. **CTA**：再次进入 `Start your brief`。

## 5. 核心页面

### `/start` 或 `/start-a-brief`

这不是无限聊天窗口，而是“自然语言开场＋最少必要问题”的结构化入口。

步骤：

1. 一句话描述旅行想法；
2. 城市和日期/实际夜数；
3. 最想理解的两件事；
4. 最想避免的两件事；
5. 同行人、体力、亲子和饮食限制；
6. 展示可编辑的旅行简报；
7. 提交并生成路线方向。

首屏提示：

```text
Tell us the China you want to understand.
Start with a city, a feeling, or a half-formed plan. We will ask only what can change the route.
```

### `/route-direction`

页面结构：

```text
Your route direction
What you are really choosing
Best-fit city direction
KEEP / CUT / MOVE / VERIFY
What we are assuming
What we still need to know
Main line + fallback logic
Request a US$39 Reality Check
```

必须显示：

```text
Research direction — not a booking, live availability check, or guarantee of access.
```

AI内容必须标记为 `Based on your brief`，并提供 `Why this?` 展开解释。客户可以 `Edit brief`、`Accept direction` 或 `Start over`，不能让AI静默覆盖用户信息。

### `/reality-check`

产品页只卖一个明确产品：

```text
China Trip Reality Check
US$39 · asynchronous · one revision
```

交付内容：

- 3个最大路线风险；
- 应删除或重排的地方；
- 转场与疲劳判断；
- 需要自行确认的动态事项；
- 一次异步补充。

主按钮：`Request the Reality Check`

支付使用Stripe Payment Link或Checkout。首版不自建复杂支付页。

### `/roadbook`

路书页显示：

- 路书标题和版本号；
- 当前状态；
- 最后复核日期；
- 复核范围；
- 主线、备选和每日重点；
- 客户需要自行确认的事项；
- `Book directly`边界提示。

状态只能使用：

- `Research roadbook draft`；
- `Human check requested`；
- `Human-checked digital roadbook — reviewed on [date]`。

没有真实审核记录时，禁止显示最后一种状态。

### `/destinations`

不做13个城市的旅游百科，改成10个“旅行问题入口”：

- Shanghai：建筑、城市尺度、慢节奏；
- Hangzhou–Suzhou：湖/茶/寺庙或园林/运河；
- Beijing：帝国尺度、胡同、长城取舍；
- Chengdu–Chongqing：慢生活与立体城市；
- Guangzhou–Shenzhen：粤菜/贸易与科技城市；
- Guilin–Yangshuo：喀斯特与天气弹性；
- Quanzhou–Dehua：海贸、宗教多元、陶瓷；
- Jingdezhen：瓷业系统与当代制作；
- Wudang：山地遗产与道教建筑；
- Jingmai：茶林文化景观与慢旅行。

每张卡只显示：适合什么、通常需要几晚、不适合什么、开始简报。

## 6. 数据和API接入

前端只读取服务端公开结果，不把原始数据库JSON打包进浏览器。

| 前端动作 | 接口/模块 |
|---|---|
| 城市产品卡 | `GET /api/destinations` |
| Route Signal | `POST /api/route-direction` |
| 分层检索 | `src/retrieval.mjs` / 后端服务封装 |
| 结构化简报 | `POST /api/runtime-input` |
| 路线草稿 | `POST /api/dispatch-runtime` |
| 申请人工复核 | `POST /api/roadbook-brief` |
| Stripe支付 | Stripe Checkout / Payment Link，成功后写入订单状态 |

前端禁止读取：原始城市JSON、来源评分、内部审核记录、供应商候选、私人联系方式和其他客户数据。

## 7. 首版组件

- `SiteHeader`
- `DecisionRail`
- `RouteComparisonCard`
- `TripBriefForm`
- `TripBriefSummary`
- `RouteDirectionCard`
- `AssumptionsPanel`
- `FallbackPlanCard`
- `HumanReviewNotice`
- `StripeCheckoutButton`
- `RoadbookStatusBanner`
- `RoadbookDayCard`
- `SourceAndDateNotice`
- `DirectBookingBoundary`

## 8. 页面状态

每个数据页面必须设计：

- 初次加载骨架；
- 空结果；
- 网络失败重试；
- 表单保存中；
- AI生成中；
- 研究草稿状态；
- 人工复核等待状态；
- 支付成功/失败；
- 路书已过复核有效期。

## 9. 埋点

第一版只记录能帮助商业判断的事件：

```text
hero_start_brief_clicked
brief_started
brief_submitted
route_direction_viewed
edit_brief_clicked
reality_check_clicked
stripe_checkout_started
stripe_payment_completed
roadbook_delivered
feedback_submitted
```

每条社交内容使用独立UTM参数，至少记录 `source`、`medium`、`campaign`、`content`。

## 10. 开发顺序

### P0：一页验证版

- 首页Hero；
- 一条真实路线案例；
- 一个`Start your brief`表单；
- 邮箱收集；
- 手工回复。

### P1：路线方向

- 接入`/api/route-direction`；
- 接入分层检索；
- 展示KEEP/CUT/MOVE/VERIFY；
- 保存客户可编辑简报。

### P2：收费

- Reality Check产品页；
- Stripe Payment Link/Checkout；
- 支付成功回执和人工审核队列；
- 退款、修改次数和交付时间说明。

### P3：路书工作区

- 路书版本；
- 人工复核日期和有效期；
- 路书查看/下载；
- 客户反馈回流数据库。

账号体系、复杂会员、供应商后台和实时聊天放到P3之后。

## 11. 视觉与可用性验收

- 首屏10秒内理解：这是行程判断和数字路书，不是旅行团；
- 每个页面只有一个主CTA；
- 首屏不出现“AI assistant”大聊天框；
- AI内容与人工内容有清楚标签；
- 所有结论有“为什么”和假设；
- 手机端表单不超过7个可见步骤；
- 键盘焦点清晰，符合可访问性；
- 动效支持减少动画模式；
- 不向浏览器暴露原始数据库或供应商信息；
- 不显示未经人工审核的“Human-checked”。

## 12. 当前决策

前端应该继续过去项目的技术底座，但不要继续旧的专家/预订/平台撮合叙事。先实现一页验证版和Route Direction，再接Stripe和路书工作区。这样既能承接流量，也能在真实客户出现之前控制开发量和合规风险。

