# A Deeper China 海外流量与获客专业调查 V1.0

**调查日期：2026年8月8日**  
**适用项目：深度城市数据库 + 付费路书 + 人工复核**  
**首发市场：英语用户，独立来华、第一次或第二次来华、计划8—18天行程的人群**

---

## 一、结论先行

### 1. 市场存在，但不能卖“更多中国信息”

2025年中国接待入境游客超过1.5亿人次，其中外国游客约3517万人次；入境旅游消费约3939.8亿元人民币，同比增长49.5%。同时，免签和240小时过境免签政策扩大，海外游客进入中国的门槛正在下降。（来源：中国文化和旅游部、国家移民管理局2025年度公开数据）

真正的商业机会不是再做一个“China Travel Guide”，而是解决游客已经遇到的选择问题：

- 10—14天到底能不能放下4—6个城市？
- 哪个城市应该删掉？
- 高铁时间和真实门到门时间差多少？
- 第一次来中国，哪些城市顺序更容易适应？
- AI生成的行程哪些部分只是看起来合理？
- 支付、预约、酒店、地图和语言问题，哪些需要提前准备？

你的产品应该定义为：

> **We audit the China itinerary you already have — what to keep, cut, reorder and verify.**

中文意思是：审查游客已经有的中国行程，告诉他保留什么、删掉什么、重新排序什么、出发前确认什么。

### 2. 第一批客户不要从“所有外国游客”开始

首发客群应窄化为：

> **英语用户，第一次或第二次来中国，已经开始做行程，计划8—18天，准备去2—5个城市，倾向独立旅行但担心复杂度。**

优先地域：美国、英国、澳大利亚、加拿大、新加坡，以及英语能力较强的印度和东南亚用户。中国当前的外国客源增长中，韩国、马来西亚、越南、澳大利亚、英国、泰国、菲律宾、俄罗斯、日本等市场都较活跃；但你现阶段不应同时做多语言市场，先用英语验证付费。（来源：中国旅游研究院和入境游客客源市场公开信息）

### 3. 最快获得收入的渠道不是SEO，而是“社区回答 + 创作者合作 + 短视频验证”

SEO是长期资产，YouTube是信任资产，TikTok是发现资产，Reddit是高意向问题池。第一批收入应从能够直接看见具体行程问题的地方开始，而不是等待网站自然排名。

推荐顺序：

1. Reddit / 旅行社区：直接回答真实行程问题。
2. TikTok / Instagram Reels / YouTube Shorts：用“路线拆解”获得发现和私信。
3. 微型创作者合作：借用已有信任，不买大网红曝光。
4. YouTube长视频：沉淀搜索和信任。
5. Google SEO：把经过验证的问题写成长期入口。
6. 付费广告：等自然内容验证付费意愿后再做。

### 4. 关键词样本支持“路线优先”，不支持“隐藏景点优先”

2026年8月8日对15组英语种子词进行了Google和YouTube自动补全采样，共收集238个不重复建议词。自动补全不是搜索量数据，但能反映平台当前反复联想的需求方向。

多标签归类结果：

| 需求主题 | 命中建议词数 | 判断 |
|---|---:|---|
| 行程天数、路线、城市组合 | 111 | 最强需求，应作为内容和产品主线 |
| 上海、重庆、北京、成都等城市 | 72 | 城市内容需要绑定具体天数和人群 |
| 家庭、儿童旅行 | 21 | 高痛点、高客单价的第二切口 |
| 高铁、交通、转场 | 21 | 很适合Reality Check产品 |
| App、支付、落地工具 | 20 | 适合引流，不应作为核心收费产品 |
| 签证、免签和政策 | 19 | 流量大但时效风险高，需要动态更新 |
| 第一次来中国、城市选择 | 16 | 首发目标客群的核心问题 |
| 规划工具、行程规划器 | 16 | 说明用户主动寻找规划帮助 |
| 带有Reddit验证意图 | 11 | 用户不只想搜答案，还想听真实人的判断 |

代表性自动补全包括：

- `china itinerary 10 days`
- `china itinerary 2 weeks reddit`
- `first time to china where should i go`
- `first time to china beijing or shanghai`
- `china route planner`
- `china itinerary 10 days with kids`
- `china high speed train booking`
- `essential china travel apps`

详细样本位于：`outputs/traffic-research-v1/autocomplete-keywords-20260808.csv`。

---

## 二、需求调查：游客真正愿意付费的痛点

### 痛点优先级

| 优先级 | 痛点 | 付费可能性 | 适合的产品 |
|---|---|---:|---|
| 1 | 行程太满、城市太多、路线不顺 | 高 | US$39 Reality Check |
| 2 | 高铁/飞机/酒店转换的真实摩擦 | 高 | US$39 Reality Check |
| 3 | 不知道第一次中国应该选哪些城市 | 中高 | Route Direction |
| 4 | 支付、地图、预约、语言等落地问题 | 中 | Practical China Pack |
| 5 | 想深度体验但不知道如何避开模板路线 | 中高 | Deep City Roadbook |
| 6 | 找到极小众“隐藏地点” | 低到中 | 不作为首发主卖点 |

Reddit上近期持续出现类似问题：游客把北京、上海、成都、重庆、张家界、桂林等城市放在同一条路线中，反复询问是否过于拥挤、是否应该删掉城市、交通时间是否值得，以及如何安排天气和缓冲日。（来源：2025—2026年Reddit旅行社区公开讨论样本）

这些问题与A Deeper China的数据库优势高度匹配。游客不缺“景点名称”，缺的是一个能够承担取舍的判断者。

### 一个值得单独验证的高价值切口：家庭游客

关键词样本中，家庭/儿童相关建议词出现21条，包括`china itinerary 10 days with kids`、`shanghai itinerary with kids`、`beijing itinerary with kids`和`china family trip`等。

这类游客通常比单身背包客更在意：

- 每天的步行量和午休；
- 高铁、机场和酒店之间的真实转场；
- 儿童饮食、厕所、天气和排队；
- 雨天和低能量备用方案；
- 景点是否值得为了孩子安排；
- 一家人的支付和网络准备。

你有互联网亲子旅游产品经理的经历，这是市场上很少见的可信身份。建议在主线“第一次独立来华”之外，设置第二条实验线：

> **China itinerary checks for independent families — fewer transfers, realistic days, child-friendly fallbacks.**

家庭线不应取代主线，但很可能产生更高的US$99路书转化率。

---

## 三、同类项目与竞争格局

### 竞争者不是一个类型

| 类型 | 代表项目 | 已公开的产品/价格信号 | 主要流量方式 | 对你的启示 |
|---|---|---|---|---|
| 个人专家咨询 | The China Travel Planner | 约50分钟咨询US$99 | YouTube、免费指南、预约咨询 | 市场已经接受“为中国规划建议付费” |
| 低价数字规划 | MyChinaGuide | 公开展示约US$12.99的定制行程 | SEO、免费攻略、App和工具 | 低价自动化产品竞争激烈，不适合靠低价取胜 |
| 人工路线规划 | Real China Guide | 公开起价US$39 | 目的地页、路线规划页、表单 | US$39是市场可理解的入门价格，但交付必须更窄更快 |
| 人工路线规划 | Hidden China Travel | 公开起价US$99；另有US$50/小时审查 | 表单、SEO、路线服务页 | 你的US$39可以作为更低风险的前置产品 |
| 定制行程服务 | Eventurus Asia | 强调2026入境规则、路线和本地物流 | SEO文章、旅行服务页、社交渠道 | 不能只讲“深度”，要把动态验证写清楚 |
| 创作者型内容 | Baba Goes China | 免费攻略、路线和邮件订阅 | 博客、搜索、社交媒体、邮件 | 个人身份和持续内容比“数据库”更容易建立信任 |
| 传统定制旅行 | China Highlights、WildChina等 | 定制行程、导游和完整地接 | 大规模SEO、目的地内容、询盘 | 不能正面竞争完整预订，应强调独立旅行和不代订 |

### 市场价格带判断

当前可观察到的英语市场大致存在三个价格层：

```text
免费AI / 免费攻略 / 低价App
↓
US$10—20 自动化或轻量定制
↓
US$75—135 人工咨询或定制行程
↓
完整定制旅行与地接服务
```

A Deeper China的机会是占据中间入口：

```text
US$39 Reality Check
→ 用低风险购买证明人工判断价值
→ US$99+ Deep City Roadbook
```

US$39不能交付一份完整定制行程，否则人工成本会失控。它必须严格限制为：

- 3个最重要的问题；
- 需要删减或重排的地方；
- 转场和疲劳风险；
- 需要动态确认的事项；
- 1次异步补充。

### 竞争空位

现有市场的多数选择是：免费内容、自动化工具、专家咨询或完整定制旅行。相对少见的是：

> **对游客现有AI行程进行独立审查，并明确告诉他应该删掉什么。**

这是最适合你率先占领的内容标签和收费入口。

### 第二类痛点：入境后的系统摩擦

中国正在改善外国游客的支付、交通和住宿便利度，外国银行卡可以绑定支付宝或微信支付，签证和过境免签政策也在扩张。正因为系统在变化，游客需要的是“什么时候查、查什么、哪些仍需自己确认”，而不是一篇永远不更新的固定攻略。（来源：中国政府网、国家移民管理局、支付宝面向境外游客的公开指引）

因此内容必须有：

- 更新时间；
- 适用范围；
- 仍需确认的事项；
- 失败后的备用路径；
- “官方信息”和“经验判断”的区分。

---

## 四、渠道调查与优先级

### A级渠道：先做

#### 1. Reddit / 旅行社区

**角色：高意向问题池 + 信任转化。**

适合的社区包括与China travel、travelchina、旅行规划、背包客、独立旅行相关的社区。不要把Reddit当广告位；Reddit官方明确提醒，不同社区对自我推广有严格规则，部分社区采用“90%有帮助内容、10%自我推广”的规则。（来源：Reddit Help公开规则）

你应该做：

- 每周回答5—8个真实行程问题；
- 用“删掉一个城市”的具体判断建立可信度；
- 公开写出假设：天数、季节、兴趣、体力；
- 不在每条回复中贴网站；
- 只有对方主动询问或社区允许时，才提供免费Route Signal。

最适合你的回答标题：

- `Your 14-day China itinerary is not impossible — but I would remove one stop.`
- `The train time is not the real transfer time.`
- `Chengdu and Chongqing are not interchangeable.`
- `A first China trip should not be planned like a checklist.`

#### 2. TikTok / Instagram Reels / YouTube Shorts

**角色：发现、情绪、快速建立“中国判断力”的印象。**

TikTok把旅游发现、搜索和预订逐渐放在同一条路径中；TikTok自己的旅游营销材料也把用户行为拆成Discover、Plan、Book、Share。TikTok官方美国旅游页面还引用调查称，66%的用户认为TikTok是有帮助的旅行灵感来源。（来源：TikTok for Business旅游行业公开材料）

不要拍普通城市风景。你的短视频应该拍“决策”：

- `I would not put these four cities in a 10-day China trip.`
- `The difference between Shanghai and Chongqing in one route.`
- `What AI itineraries forget about arrival days.`
- `The real reason your China itinerary feels exhausting.`
- `One quiet afternoon in Shanghai is worth more than three extra sights.`

每条视频结构：

1. 前2秒提出冲突；
2. 10—30秒解释一个判断；
3. 结尾给出一个可执行动作；
4. 评论区邀请用户贴自己的路线；
5. 只把最有意向的人导向免费Route Signal。

#### 3. 微型创作者合作

**角色：借信任获得第一批高质量用户。**

优先找5,000—80,000粉丝的创作者，而不是大网红：

- 独立旅行；
- 背包旅行；
- 建筑和城市观察；
- 中国生活/留学/外籍居住；
- 美食和文化旅行；
- 家庭旅行；
- 摄影与城市漫步。

合作形式不要一开始付高额广告费，而是：

- 为创作者免费审查一条真实中国路线；
- 共同发布“路线重做前后”内容；
- 给创作者专属链接或优惠码；
- 每成交一个Reality Check，支付固定推荐费；
- 允许创作者公开指出你的建议哪里不适合他。

TikTok官方也建议旅行品牌通过Creator Marketplace寻找适合的创作者，让内容保留原生感和可信度。（来源：TikTok for Business创作者合作指南）

### B级渠道：同步建设

#### 4. YouTube长视频

YouTube的搜索与推荐系统会根据观众兴趣和观看满意度匹配内容，不是简单按发布时间排序。（来源：YouTube Help搜索与推荐系统公开说明）

适合你的长视频：每两周1条，6—12分钟。

- `How to Plan a First China Trip Without Rushing It`
- `Beijing, Shanghai, Chengdu, Chongqing: Which One Should You Cut?`
- `What a Real China Transfer Day Looks Like`
- `Shanghai Architecture for People Who Hate Checklist Travel`
- `How to Read Chongqing Beyond Cyberpunk Photos`

长视频结尾不要只说“访问网站”，而要让观众提交路线，获得一次免费判断。

#### 5. Google SEO / AI搜索可见性

Google明确要求内容以用户为中心、可靠、有实际价值，而不是大量批量生成的同质化页面。Google也说明，AI Overviews和AI Mode并没有额外的“AI SEO秘籍”，基础的高质量SEO仍然适用。（来源：Google Search Central官方指南）

你不应该先做“13个城市各写一篇普通攻略”，而应该先做能证明判断力的页面：

- `Is 10 Days Enough for Beijing, Shanghai, Chengdu and Chongqing?`
- `China Itinerary Mistakes First-Time Visitors Make`
- `Shanghai or Chongqing for a First China Trip?`
- `How Many Cities Should You Visit in China in Two Weeks?`
- `China Travel Route Audit: Keep, Cut, Reorder, Verify`

这些页面要有作者身份、日期、假设、路线图、替代方案和真实数据库判断。

### C级渠道：暂缓

- 大额Google Ads：尚未证明哪个痛点能转化。
- 广泛旅游广告：会带来低意向浏览，难以卖US$39产品。
- 购买大网红内容：成本高，无法确认用户是否真的计划来华。
- 纯视觉城市片：容易获得播放，但很难收集路线需求。
- 大规模AI博客：容易同质化，也不符合Google对非商品化内容的方向。（来源：Google Search Central关于生成式AI内容的公开指南）

---

## 五、你的内容应该是什么，不应该是什么

### 内容四大支柱

#### 支柱一：Route Surgery / 路线外科

核心问题：帮游客删掉、重排、减速。

示例：

- `14 days, 6 cities: what I would remove first`
- `Why adding Zhangjiajie can break a city-focused China trip`
- `Chengdu → Chongqing: how many nights actually make sense?`
- `The difference between train duration and travel-day duration`

#### 支柱二：China Reality / 中国落地现实

核心问题：让游客避免第一次落地时的意外。

示例：

- `What foreign travelers still need to prepare before using Alipay`
- `Hotel check-in and passport rules: what to confirm`
- `How to plan a rain day in Shanghai or Chongqing`
- `What to do when a beautiful AI itinerary ignores fatigue`

#### 支柱三：City Point of View / 城市观点

核心问题：让城市从“景点集合”变成一种理解方式。

示例：

- `Shanghai for architecture, not landmarks`
- `Chongqing is a city of movement, not just neon lights`
- `Beijing is about thresholds and scale`
- `Chengdu is what happens when you leave the afternoon open`

#### 支柱四：Proof / 证据内容

核心问题：证明你比ChatGPT多做了判断。

示例：

- 一条路线修改前后；
- 朋友或客户的原始路线和修改理由；
- 城市数据库记录如何变成英文路书；
- 哪些内容来自公开资料，哪些等待人工核验；
- 一次人工审核如何改变输出。

---

## 六、内容生产系统

每周只需要做一个“母内容”，然后拆分：

| 母内容 | 拆分结果 |
|---|---|
| 一条8—12分钟YouTube视频 | 3条Shorts、1篇SEO文章、2个Reddit回答、1封邮件 |
| 一条真实路线审查 | 1张前后对比图、1条短视频、1个Reddit案例、1个免费样例 |
| 一次城市研究 | 1条城市观点视频、1篇城市决策文章、5条短文案 |

每周最低执行量：

- Shorts/Reels/TikTok：3条；
- YouTube长视频：隔周1条；
- Reddit高质量回答：5条；
- SEO长文：1篇；
- 微型创作者私信：10—15人；
- 邮件：1封。

重点不是数量，而是每条内容都围绕一个“要不要、删不删、怎么排、如何验证”的决定。

---

## 七、获客漏斗

### 不要把所有流量导向首页

不同内容应进入不同的单一入口：

```text
短视频：
路线冲突 → 评论/私信 → 免费 Route Signal → US$39 Reality Check

Reddit：
具体问题回答 → 用户主动询问 → 公开样例 → US$39 Reality Check

YouTube：
完整路线分析 → 免费 China Route Sanity Check → 邮件 → US$99 Roadbook

SEO：
高意向问题页 → 路线自检表 → 提交个人路线 → 付费审查

创作者合作：
创作者真实路线 → 联合案例 → 专属链接 → 推荐分成
```

### 免费产品不要做成普通电子书

建议免费入口：

> **China Route Sanity Check**  
> 5分钟判断：你的城市数量、转场、节奏和落地摩擦是否合理。

收集字段只要：

- 国家/地区；
- 旅行日期；
- 总天数；
- 已确定的城市；
- 最担心的事情；
- 邮箱。

提交后，不要立即输出长篇AI答案。先给一个简短判断，再邀请购买US$39审查。

---

## 八、30/60/90天执行计划

### 第1—7天：准备可销售的最小系统

- 确定英语首发客群和一句话定位；
- 做一份5页英文Route Sanity Check；
- 准备3个真实路线前后案例：上海、重庆、北京/成都；
- 完成Instagram、TikTok、YouTube、Reddit个人简介；
- 建立简单表单和邮箱列表；
- 不重做完整网站，只做一个清晰承接页。

### 第8—30天：手工获得第一批询盘

- 发布12条短视频；
- 发布2条YouTube长视频；
- 回答20个Reddit真实行程问题；
- 联系40个小型创作者；
- 在允许的旅行社区发布3个完整路线案例；
- 开放前10个US$39 Reality Check名额；
- 目标不是播放量，而是获得至少20个合格路线提交。

### 第31—60天：找到转化最高的内容主题

- 统计哪个主题带来最多路线提交；
- 只保留转化前两名的内容柱；
- 做5篇高意向SEO页面；
- 与3—5名创作者做联合案例；
- 把US$39产品升级为固定交付模板；
- 让第一批客户提供可公开的匿名反馈。

### 第61—90天：形成可重复获客系统

- 每周固定母内容和拆分流程；
- 建立城市主题页面；
- 开始测试YouTube或TikTok小额广告；
- 为创作者设置专属推荐码；
- 建立邮件自动跟进：路线问题、案例、产品说明；
- 评估是否需要重做网站，而不是先假设需要。

---

## 九、关键指标

### 不能只看播放量

第一阶段只看五个指标：

1. 合格路线提交数；
2. 用户是否留下具体日期、天数和城市；
3. 免费Route Signal到US$39的转化率；
4. 每个渠道带来的付费客户成本；
5. 客户是否愿意继续购买US$99路书。

建议记录：

| 指标 | 解释 |
|---|---|
| Qualified lead | 有日期、天数、城市和明确问题的人 |
| Route-to-paid | 提交路线后购买Reality Check的比例 |
| Content-to-lead | 单条内容带来的合格路线提交 |
| Lead-to-roadbook | US$39客户升级US$99+的比例 |
| Partner conversion | 单个创作者带来的付费客户 |

公开资料无法可靠提供你的目标关键词真实搜索量，因此不应假装知道“哪个词一定有多少流量”。前30天用内容和表单测试真实需求，再用Search Console、Google Ads Keyword Planner或Semrush补充量化关键词数据。

---

## 十、最终建议

### 现在最应该做的事情

不是继续做网站视觉，而是：

1. 用你的个人身份建立可信度：重庆人、上海生活、互联网亲子旅游产品经理、背包客；
2. 每周公开拆解真实中国路线；
3. 在Reddit和短视频中回答“删哪个城市、怎么排序、哪里会累”的问题；
4. 用US$39产品承接已经有明确行程的人；
5. 先获得10个付费案例，再决定网站要不要重做。

### 你真正的流量卖点

不是：

> We have a 13-city database.

而是：

> **You already have too many China itineraries. We help you decide which one is actually worth taking.**

---

## 十一、调查证据来源

- 中国国家移民管理局：2025年出入境与免签数据；
- 中国文化和旅游部、商务部：2025年入境旅游与消费数据；
- 中国旅游研究院：中国入境旅游发展年度报告相关信息；
- TikTok for Business：旅游营销与旅行用户发现、规划、预订路径；
- Google Search Central：People-first content、Search Essentials、AI features guidance；
- YouTube Help：Search & Discovery与观看满意度；
- Reddit Help：社区自我推广和垃圾信息规则；
- Reddit r/travel、r/travelchina：近期真实中国行程讨论；
- TripAdvisor、Nomadic Matt、China Discovery、TravelChinaGuide：英文市场竞争内容观察。

**证据限制：**TikTok、Instagram、YouTube的公开平台数据多为平台营销材料，适合判断渠道方向，不适合作为你的收入预测。真实关键词量、转化率和客户成本必须在第一轮30天实验中测得。
