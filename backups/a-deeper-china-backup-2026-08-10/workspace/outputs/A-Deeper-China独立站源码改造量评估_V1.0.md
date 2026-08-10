# A Deeper China｜独立站源码改造量评估 V1.0

日期：2026-08-03  
基于源码：`/Users/apple/Desktop/china-insider`  
状态：只读评估，未修改源码

## 1. 结论

这不是一次“换几句文案”的小改，而也不需要全新建站。最准确的判断是：

> **保留基础设施和视觉底座，重写聊天/路由业务核心，替换专家与预约前台。**

预计首发前台改造量约为现有产品代码的 50%–65%；底层框架、依赖、认证、部署方式和部分视觉组件可以继续复用。

## 2. 模块评估

| 模块 | 当前规模 | 处理方式 | 估计复用 |
|---|---:|---|---:|
| `app/page.tsx` 首页 | 116 行 | 保留布局骨架，重写文案、CTA、城市状态和样本区 | 35%–45% |
| `SiteHeader` | 35 行 | 保留组件形式，替换导航和状态 | 50% |
| `app/chat/page.tsx` | 52 行 | 保留页面容器，改成 Start a Brief | 30% |
| `chat-concierge-client.tsx` | 1,236 行 | **建议拆分并重写核心状态**；语音可后置 | 15%–30% |
| `app/api/chat/route.ts` | 679 行 | **不在原逻辑上打补丁**，新建路由器适配层 | 10%–25% |
| `Experts` 页面 | 240 行左右 | 首发下线或改为 How it works | 0%–15% |
| `Booking` 页面 | 196 行 | 首发下线，保留历史代码但不进主路由 | 0%–10% |
| `Account` 页面 | 49 行 | 改为 My Roadbooks | 20%–35% |
| 城市展示数据 | 58 行 | 用 `/api/destinations` 替代硬编码为主 | 20%–40% |
| Supabase 旧表 | 现有迁移 | 保留，新增产品表和 RLS | 70%–90% |

## 3. 最需要重写的两个核心

### 3.1 `chat-concierge-client.tsx`

当前组件同时承担：

- 文本对话；
- 语音录音、转写和播放；
- 旧 TravelBrief；
- 旧 RouteBook；
- 专家匹配展示；
- 预约下一步。

这些职责混在一个 1,236 行客户端组件里。新版本应拆成：

```text
TripBriefComposer
├── NaturalLanguagePrompt
├── ClarifyingQuestions
├── BriefSummary
└── RouteDirectionResult
```

语音功能不必删除，但应改为可选输入组件，不再决定产品结构。

### 3.2 `app/api/chat/route.ts`

当前接口的主要数据源是 `experts` 表和 `mockExperts`。新版本不应继续在此文件中混合：

- 城市识别；
- 专家检索；
- LLM 生成；
- 预约下一步；
- 路书渲染。

应改为同源调用已完成的 portfolio router API，或在 Next.js route handler 中导入 `site-api.mjs`，让城市数据库成为唯一内容来源。

## 4. 推荐的代码组织

```text
app/
├── page.tsx
├── start-a-brief/page.tsx
├── route-direction/page.tsx
├── roadbooks/[id]/page.tsx
├── how-it-works/page.tsx
└── api/
    ├── destinations/route.ts
    ├── route-direction/route.ts
    ├── runtime-input/route.ts
    ├── dispatch-runtime/route.ts
    └── roadbook-brief/route.ts

lib/
├── travel-brief.ts
├── roadbook.ts
├── product-status.ts
└── router-client.ts

components/roadbook/
├── roadbook-status-banner.tsx
├── roadbook-day-card.tsx
├── fallback-plan-card.tsx
└── human-check-notice.tsx
```

## 5. 不建议的做法

- 在 679 行的旧 `api/chat` 上继续塞新判断；
- 在 1,236 行的旧客户端组件里同时保留两套业务模型；
- 删除旧专家和预约表；
- 直接用所有城市 JSON 填充浏览器端；
- 未确认 Vercel 连接关系就部署；
- 把“通过 typecheck”误当作产品迁移完成。

## 6. 实际开发顺序

1. 复制源码并确认远程仓库关系；
2. 只改导航、首页和城市数据读取；
3. 新建 `Start a Brief`，不碰旧 `/chat` 的内部实现；
4. 接通 `route-direction` 和上海运行时；
5. 新建 `Route Direction` 页面；
6. 接通重庆、泉州；
7. 新建路书和人工复核页面；
8. 最后处理旧 Experts/Booking 的重定向和清理。

## 7. 当前判断

旧站值得继续做，但不值得在旧聊天/专家/预约链路上继续堆功能。最省风险的路径是“同一技术项目内建立新产品路径”，等新路径完成验证后再逐步下线旧路径。

