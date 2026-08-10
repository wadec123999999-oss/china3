# A Deeper China｜独立站源码审计 V1.0

审计日期：2026-08-03  
审计方式：本机只读检查；未修改源码、依赖、环境变量或线上部署

## 1. 源码已定位

发现网站源码目录：

`/Users/apple/Desktop/china-insider`

该目录是一个 Next.js 14 App Router 项目，使用 React、Tailwind、Supabase 和 Vitest。目录本身当前没有可见 `.git` 元数据，因此进入开发前需要确认它对应的远程仓库或先做完整备份；不能直接假定它就是 Vercel 当前连接的仓库。

## 2. 当前代码与旧商业模型的对应关系

线上页面的只读 HTML 仍显示旧定位：`Find vetted local experts...`，主导航仍包含 `Chat`、`Experts` 和 `Account`。因此，之前的判断得到线上证据支持：这是产品层重构，不是几处文字微调。

| 代码位置/功能 | 当前含义 | 与新产品的关系 |
|---|---|---|
| `app/page.tsx` | 城市卡片 + 搜索入口 | 可保留视觉结构，需改为路书产品入口 |
| `components/marketing/site-header.tsx` | Home / Chat / Experts / Account | 需要改为 Home / Destinations / How it works / Start a brief |
| `app/chat/page.tsx` | AI concierge + expert shortlist + route book | 需要改为 Trip Brief + Route Direction |
| `components/marketing/chat-concierge-client.tsx` | 依赖专家匹配、语音、旧 route book | 需要拆分为需求采集、路线方向、路书草稿三个状态 |
| `app/experts/page.tsx` | mock 专家目录 | 首版下线或改成产品边界说明 |
| `app/experts/[slug]/page.tsx` | 专家详情页 | 首版不进入主流程 |
| `app/booking/page.tsx` | 专家预约/费用拆分 | 首版移除，不接平台代收 |
| `app/(app)/account/page.tsx` | 账户/历史 | 后置改为 My Roadbooks |
| `app/api/chat/route.ts` | 读取 experts 表并返回 expertMatches | 需要替换为城市数据库路由器接口 |
| `lib/mock-data.ts` | mockExperts、旧 TravelBrief、旧 RouteBook | 需要拆成新数据合同和演示样本 |
| `supabase/migrations/*` | 专家、预约、支付方向的数据基础 | 可保留底层项目，但新表/字段应独立设计 |

## 3. 重要发现

### 3.1 当前聊天接口仍然是专家撮合接口

`app/api/chat/route.ts` 当前会：

- 从 `experts` 表或 `mockExperts` 读取上下文；
- 返回 `expertMatches`；
- 把下一步定义为确认专家、预约和可预订路线。

这不是简单改几句文案就能解决的问题。新产品应让城市数据库成为主要检索源，并把“人工复核”作为明确状态，而不是返回专家列表。

### 3.2 旧首页仍是城市展示 + 搜索

首页当前可以复用城市卡片、图片和整体氛围，但主标题、说明和 CTA 没有清楚说明“数字路书”这一交付物。首页应增加：

- Route Direction 是什么；
- Human-checked Roadbook 是什么；
- 为什么不是直接问通用 AI；
- 用户是否需要自己预订。

### 3.3 源码可以作为改版底座，但不能直接部署改版

只读质量检查结果：

- `pnpm typecheck`：通过；
- `pnpm test`：1 个测试文件、3 个测试通过；
- `pnpm build`：通过，生成 15 个静态页面；
- 未执行部署；
- 未修改源码。

这证明项目当前可继续开发，但不证明它与 Vercel 线上项目的仓库、环境变量和部署分支一致。

## 4. 推荐的最小重构边界

### 保留

- Next.js App Router、React、Tailwind；
- Supabase 客户端与基础认证能力；
- 图片、字体、通用 UI 组件；
- 现有首页的视觉资产，待重新编排；
- 测试、类型检查和构建流程。

### 替换

- `app/api/chat/route.ts` 的专家匹配逻辑；
- `TravelBrief` 和 `RouteBook` 旧类型；
- 首页和聊天页的产品文案；
- `Experts`、`Booking` 作为首发主流程的角色；
- 依赖 `experts` 表的公开输出。

### 新增

- `app/start-a-brief/page.tsx` 或将 `/chat` 迁移为该入口；
- `app/route-direction/page.tsx`；
- `app/roadbooks/[id]/page.tsx`；
- `app/how-it-works/page.tsx`；
- 同源 `/api/destinations`、`/api/route-direction`、`/api/runtime-input`、`/api/dispatch-runtime`、`/api/roadbook-brief`；
- 路书状态、版本和人工复核日期的展示组件。

## 5. 进入开发前必须确认

1. `/Users/apple/Desktop/china-insider` 是否是 Vercel 当前项目的真实源码。
2. 是否存在远程 Git 仓库；若没有，先建立私有仓库并保留完整备份。
3. Vercel 项目连接的分支和环境变量是否可读取。
4. Supabase 中 `experts`、`bookings` 等旧表是否已有真实生产数据；若有，不删除、不改表，先做兼容迁移。
5. 是否允许把旧 `/chat` 路由迁移为新 `Start a Brief`，并为旧链接保留重定向。

## 6. 当前结论

源码已经找到，因此“不知道从哪里开始”这个阻碍已解除。下一步不是重新创建网站，而是在确认仓库和部署关系后，复制一份安全工作副本，先实现首页、导航和 `Start a Brief` 的新产品流程；线上站继续冻结。
