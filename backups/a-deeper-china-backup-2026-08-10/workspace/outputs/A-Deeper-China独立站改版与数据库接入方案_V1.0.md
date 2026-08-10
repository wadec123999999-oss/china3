# A Deeper China｜独立站改版与数据库接入方案 V1.0

基于 2026-08-02 对线上站点的公开页面检查。本方案只定义改版，不直接修改线上站。

## 结论：先改商业叙事，再接数据

当前站点的视觉氛围、城市卡片和“从城市/情绪开始”的入口可保留。但它将产品描述为：

- “vetted local experts”；
- 平台收款、支付后才放出专家身份；
- 平台保证文化体验、控制路线与取消政策；
- Wudang 的 “internal practice”、Jingmai 的 “quiet ritual”、Jingdezhen 的 “kilns and workshops”。

这与现阶段真实产品冲突：你目前拥有的是深度数据库、智能体意图识别、人工复核数字路书；各城市的互动资源尚未普遍放行。继续使用“专家撮合/平台代收款”模型，既让用户误解，也把合规、履约、安全和售后风险提前扛在自己身上。

## 新的一句话定位

> **A Deeper China helps independent travelers understand China through human-checked digital roadbooks—built around what they care about, what they want to avoid, and what needs checking before they go.**

辅助说明：

> Start with a conversation. Receive a thoughtful route brief, a realistic fallback plan, and the information you need to book directly.

不要使用：`vetted local experts`、`guaranteed cultural experience`、`pay the platform`、`expert identity locked`、`local support`（除非定义清楚）、`authentic access`。

## 首页信息架构

### 现状问题

首页是“城市卡片 + 搜索框”，用户能感受美学，却不知道：输入后会得到什么、是否付费、为什么不直接问 ChatGPT、是否有真人、谁负责预订。

### 首页建议（从上到下）

1. **Hero：清楚交付物**
   - 标题：`China, understood before you arrive.`
   - 副标题：`Thoughtful digital roadbooks for independent travelers—shaped by AI, checked by a human when the details matter.`
   - 主 CTA：`Start your trip brief`
   - 次 CTA：`See a sample roadbook`

2. **为什么不是通用 AI（3 张卡）**
   - `Read the trip behind the question`：识别“我不想赶景点”“我怕语言摩擦”等未明说的需求。
   - `Know what not to promise`：不把天气、私密场所、课程或交通说成保证。
   - `Check the changing details`：在交付前人工复核时间、开放、节奏与限制。

3. **如何工作（4 步）**
   - Tell us your trip → Receive a first route brief → We check the live details → You book directly and travel independently.

4. **首发城市，不要一次全展示为“可售体验”**
   - 首推：Shanghai、Quanzhou、Chongqing。
   - `Explore next`：Beijing、Chengdu、Hangzhou/Suzhou、Guangzhou/Shenzhen、Guilin/Yangshuo、Jingdezhen。
   - `Research-led / limited release`：Wudang、Jingmai。
   - 每张卡展示“适合谁、建议停留、当前产品等级”，而不是声称可见专家。

5. **样本路书切片**
   - 展示一天主线、一个雨天替代、一个客户行动项；去掉具体未复核商家。

6. **边界与信任**
   - `Independent travel information. We do not book, guide, or package travel.`
   - `A human-checked label means the time-sensitive parts were reviewed on a stated date.`

## 导航重构

| 当前 | 改为 | 原因 |
|---|---|---|
| Home | Home | 保留 |
| Chat | Start a brief | 对话不是目的，旅行简报才是产品入口 |
| Destinations | Destinations | 保留，但要标注产品等级 |
| Experts | How it works | **下线 Experts**，避免虚构或过早承诺在地专家 |
| Workspace | My roadbooks（后置） | 只有用户保存 brief/购买后出现，不放在首次访问主导航 |

右上主按钮：`Start your brief`。不要首屏要求登录。

## Chat 页面重做：从自由聊天改为“有结构的对话式 intake”

首屏不写“voice or text to shape a first route”，改为：

> `Tell us the China you want to understand. I’ll ask only what changes the route.`

推荐流程（允许用户自然语言插入）：

1. 城市或中国主题；
2. 日期、实际可用夜数、抵达/离开；
3. 最想要的两项与明确不想要的两项；
4. 同行、孩子/行动限制、步行与天气弹性；
5. 住宿区域、语言/支付准备、食物限制；
6. 展示客户可编辑的 `travel_brief` 摘要；
7. CTA 分级：`Get a free route direction` / `Request a human-checked roadbook`。

语音输入可留作便利功能，但不能是价值主张；它必须明确告知保存和转写政策。

## 目的地页改法

每个城市页的固定模块：

1. `Why this city`：一个清晰叙事，不用广告形容词。
2. `Best for / Not for`：让用户自筛。
3. `What a roadbook can decide`：例如重庆是“城市主城节奏与地形交通”，不是“大足/武隆一网打尽”。
4. `Typical length and trade-offs`：非保证性的时间/取舍说明。
5. `Current product level`：`Research-led` / `Human-check available` / `Limited-release interaction`。
6. `Start a brief for this city`。

### 立即修改的敏感文案

| 页面/城市 | 当前风险表述 | 替换方向 |
|---|---|---|
| 全站 meta description | “Find vetted local experts…” | 改为 human-checked independent-travel roadbooks |
| Experts | 平台收款、付费后放出专家、保证体验 | 整页下线，替换为 How it works |
| Account | booking/payment/expert handoff | 替换为 brief、roadbook、check status、feedback |
| Wudang | “internal practice”“Taiji guides” | 建筑/山地/礼仪；太极资源仅在 `partner_ready` 后出现 |
| Jingmai | “quiet ritual”“village-stay hosts” | 古茶林文化景观、慢旅行、社区尊重；不承诺进入村寨/仪式 |
| Jingdezhen | “kilns and workshops” | 瓷业系统和公共观察；工作室/课程需独立放行 |
| 组合线路 | 一次打包北京—成都—重庆等 | 改为“对比与顺序建议”，不表现为可预订行程产品 |

## 与 V0.1 数据协议的接入映射

| 页面动作 | 读取/写入对象 | 需要的状态限制 |
|---|---|---|
| Chat/Start brief | 写 `travel_brief` | 客户可修改；最小化个人数据 |
| 城市页 | 读城市 JSON 的 module / signal / guardrail | 不展示候选供应商和内部字段 |
| AI 初稿 | 生成 `retrieval_packet`、`draft_roadbook` | 只允许 `research_draft` 文案 |
| 请求人工复核 | 创建审核队列 | 必须有日期、城市、实际停留、限制和客户确认 |
| 审核后台 | 写 `human_check` | 显示来源、核验时间、风险、失效时间 |
| 客户 Workspace | 读 `travel_brief` 和已发布 `roadbook` | 只显示自己的数据；无专家/供应商隐私信息 |
| 反馈页 | 写 `feedback_event` / 个案模板字段 | 客户可选择不保存后续联系数据 |

## MVP 页面清单（建议顺序）

1. 首页文案与导航改版；
2. Start a brief（6–8 步对话/表单 + brief 预览）；
3. 上海目的地页 + 一份去敏后的样本路书；
4. 人工审核队列（内部页，哪怕先是受保护表格）；
5. 客户 Roadbook 页面（只读、带版本和复核时间）；
6. 反馈页面；
7. 再复制到泉州、重庆；
8. 最后才评估登录、支付和互动资源页面。

## 不应现在做的功能

- 专家身份隐藏/解锁；
- 平台代收体验费；
- 实时可订库存；
- 公开供应商市场；
- 用“认证”“独家”“正宗”“保证”卖茶、太极、寺观、工作室访问；
- 将客户聊天记录当作无需确认的画像。

## 关键转化事件（第一版只看这些）

`landing_view` → `brief_started` → `brief_completed` → `draft_viewed` → `human_check_requested` → `roadbook_purchased_or_trial` → `roadbook_delivered` → `feedback_completed`

每一步同时记录中断原因：城市未覆盖、日期未定、价格不明、路线不适配、想要代订、信任不足、其他。不要先追求页面停留时间或虚高的聊天轮数。
