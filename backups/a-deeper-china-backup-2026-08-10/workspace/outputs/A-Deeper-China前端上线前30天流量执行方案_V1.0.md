# A Deeper China｜前端上线前 30 天流量与收入验证方案 V1.0

更新：2026-08-09

## 先给结论

前端还没做，不影响开始。前30天不做完整网站，先验证三件事：

1. 是否有人愿意提交真实中国行程；
2. 哪类问题最容易带来付费；
3. US$39 的路线审查能否在可接受人工时长内交付。

现有资料已经足够确定测试方向，但还没有完成真实客户验证。因此现在可以开始跑实验，不能把渠道、转化率和价格当成已经证明的事实。

## 产品只保留一条漏斗

```text
YouTube Shorts / TikTok / Instagram Reels / Reddit回答 / 创作者合作
                                ↓
                  免费 Route Signal 表单
                                ↓
              人工回复 3 个最重要判断（24小时内）
                                ↓
           China Trip Reality Check（US$39）
                                ↓
                Deep City Roadbook（US$99+）
```

前端上线前使用：Tally 或 Google Form + Gmail + 一张跟踪表。确认有付费意向后，用 Stripe Payment Link 收款。不要先开发登录、地图、复杂RAG界面或完整订单系统。

## 只测四个内容入口

数据库可以覆盖13个目的地，但流量入口先限制为四组：

1. Shanghai–Hangzhou–Suzhou：建筑、节奏、第一次来中国；
2. Beijing–Great Wall：首访、历史、长城取舍；
3. Chengdu–Chongqing：慢生活与立体城市的选择；
4. Guangzhou–Shenzhen + Guilin–Yangshuo：粤菜/科技/山水的组合取舍。

景德镇、泉州—德化用于差异化内容；武当山、景迈茶山保持研究型，不作为首月主流量入口。

## 渠道打法

### 1. Reddit：高意向问题池

每周回答5个真实中国行程问题。先给判断，后解释假设；不复制模板，不每条贴链接。

回答格式：

```text
Short answer: I would remove / reorder ...

Why: the real issue is ...

What I would do instead: ...

This changes if your dates, pace or interests are different.
```

只有对方主动询问，或社区规则允许时，才提供表单链接。身份透明说明：

```text
I’m building a roadbook product for independent China travel; here is the useful answer regardless.
```

### 2. Shorts / TikTok / Reels：发现流量

每周制作3条，三平台同步，不额外为每个平台重做。

内容只讲“一个取舍”：

- `I would remove one city from this 14-day China itinerary.`
- `Why Chengdu and Chongqing should not be planned the same way.`
- `The train time is not the real travel-day time.`
- `What AI itineraries forget about your first arrival day.`
- `How many cities can a family really handle in 12 days in China?`

固定结构：冲突假设 → 一个判断 → 一个删除或重排动作 → 邀请提交路线。

统一CTA：

```text
Submit your China itinerary for a free three-point fit check.
```

### 3. 微型创作者：借信任

30天建立40人名单，发30条个性化私信，争取3个联合内容样本。

优先对象：5,000—80,000粉丝的独立旅行、中国生活、建筑/城市、亲子和美食创作者。

合作方式：免费审查一条真实路线 → 共同发布“前后对比” → 使用专属链接/优惠码 → 成交后支付推荐佣金。首月不要购买大网红曝光。

### 4. SEO与广告：延后

前30天不把SEO或广告当主要收入来源。先从真实问题中选出转化最好的两个主题，再制作：

- `/china-itinerary-review`；
- `/chengdu-chongqing-route`；
- `/shanghai-hangzhou-suzhou-route`；
- `/china-family-itinerary`。

只有自然内容已经带来合格表单后，才用小预算测试搜索广告。广告必须导向具体问题页，不导向泛首页。

## 每周执行表

| 周 | 内容与分发 | 交付目标 |
|---|---|---|
| 第1周 | 3条短视频、5个Reddit回答、10个创作者名单、建立表单并准备Stripe产品 | 3个真实路线提交 |
| 第2周 | 3条短视频、5个Reddit回答、10条创作者私信、人工回复所有线索 | 5个合格线索、至少1次付费询价 |
| 第3周 | 发布1个匿名路线前后对比、3条短视频、5个Reddit回答 | 1—2个US$39付费Reality Check |
| 第4周 | 重做转化最高的主题、争取创作者联合发布、整理客户原话 | 累计3个付费客户，决定首个前端页面 |

## 免费表单只问这些

1. 你考虑哪些城市？
2. 有多少个完整旅行日/晚数？
3. 抵达和离开时间？
4. 最想理解什么：历史、建筑、食物、自然、科技、茶、陶瓷或城市生活？
5. 最不想遇到什么：赶路、台阶、排队、商业化、语言/支付摩擦？
6. 是否需要亲子、低体力、饮食或其他限制？
7. 邮箱和来源渠道。

不要在免费表单里交付完整路线；只承诺3句话的初步判断。

## Reality Check 交付边界

US$39 只交付：

- 3个最大路线风险；
- 应删掉或重排的部分；
- 转场和疲劳判断；
- 需要游客自行确认的动态事项；
- 1次异步补充。

它不是完整路书、导游、代订或旅行团服务。目标是把人工时间控制在30—45分钟以内。

## 只看这些指标

不要先看播放量，先记录：

- 合格路线提交数；
- 表单完成率；
- 付费Reality Check数量；
- 每单人工耗时；
- 哪个渠道带来付费；
- 客户愿意付费的具体问题；
- 客户说“AI没有帮我解决”的原话。

首月通过标准：至少10个合格路线提交、3个付费Reality Check、每单平均人工时间不超过45分钟。未达到时，先改问题和CTA，不开发更多前端功能。

## 什么时候开始做前端

达到以下条件后再做第一版前端：

- 已有10个以上真实路线提交；
- 至少3个付费客户；
- 已确定一个最高转化主题；
- 已知道客户最常缺少哪些信息；
- 已有一份可公开展示的匿名前后对比案例。

第一版前端只需要：一个主张、一个案例、一个表单、一个付费入口、一个边界说明。它不是完整旅游平台。
