# RAG 知识库入库指南

更新时间：2026-05-01

## 建议入库结构

推荐先把知识库拆成三类集合：

1. `market_profiles`：客源国、游客画像、卖点、产品策略。
2. `theme_cards`：海丝、宗教、美食、簪花、茶、瓷、香、表演、海岸等主题知识。
3. `qa_seeds`：常见问题、意图识别、推荐回答方向。

如果只建一个向量库，也建议给每个 chunk 加字段：

```json
{
  "doc_type": "theme_card",
  "country": ["Philippines", "Malaysia"],
  "theme": ["Hokkien roots", "food", "Maritime Silk Road"],
  "audience": ["foreign tourists", "diaspora travelers"],
  "language": "zh",
  "source_confidence": "high",
  "needs_update": false
}
```

## 切分建议

- `theme-cards.md`：按二级标题切分，每张主题卡一个 chunk。
- `country-profiles.md`：按国家切分，每个国家一个 chunk。
- `qa-seeds.md`：每个 Q/A 一个 chunk，或按主题组切分。
- `knowledge-cards.json`：每个 JSON object 作为一个 chunk，不要把整份 JSON 当成一个 chunk。

## 检索标签

推荐标签：

- `world_heritage`
- `maritime_silk_road`
- `zayton`
- `religion`
- `islamic_heritage`
- `hokkien`
- `diaspora_roots`
- `food`
- `gastronomy`
- `zanhua`
- `xunpu`
- `tea`
- `tieguanyin`
- `porcelain`
- `blanc_de_chine`
- `incense`
- `nanyin`
- `coast`
- `family_travel`
- `halal`
- `shopping`
- `day_trip`

## 回答风格

面向外国游客时，答案要做到：

- 先回答游客的实际问题，再补背景。
- 给英文名或可搜索拼写，比如 Quanzhou, Kaiyuan Temple, Qingjing Mosque, Dehua porcelain, Anxi Tieguanyin。
- 给时间建议：half day, one day, 2-3 days。
- 对饮食、宗教、交通、预约、开放时间、拥挤时段加提醒。
- 涉及历史时优先引用 UNESCO/FAO/官方资料，不要只用宣传口号。
- 不知道时要说“需要实时查询”，尤其是开放时间、票价、演出时间、餐厅 halal 认证、航班和天气。

## 后续最值得补的数据

1. 实际入境游客国家分布：按年、按国家、按旅行目的。
2. 机场/高铁可达性：晋江机场国际航线、厦门机场中转、厦泉高铁/城际交通。
3. 多语言服务：英文、日文、韩文、马来文、阿语导游与导览资源。
4. Halal 信息：清真/halal-friendly 餐厅、祈祷空间、穆斯林游客礼仪说明。
5. 开放时间与预约：世遗点、博物馆、演出、簪花体验、茶园、工坊。
6. 价格区间：簪花摄影、私导、小团、茶体验、瓷器工坊、香制作。
7. 安全与舒适度：老人小孩友好、雨天方案、夏季避暑、台风季提醒。
8. UGC 数据：Tripadvisor、Google Maps、小红书、TikTok、Instagram、YouTube 评论与热门内容。

## 推荐评分逻辑

可用 1-5 分对主题做优先级：

- `appeal_score`: 对外国游客的总体吸引力。
- `conversion_score`: 是否容易促成真实到访或付费。
- `content_score`: 是否适合短视频/图文传播。
- `differentiation_score`: 与中国其他城市相比是否独特。
- `service_readiness_score`: 当前是否容易接待外国游客。

当前初稿的判断：

| 主题 | appeal | conversion | content | differentiation | service readiness |
|---|---:|---:|---:|---:|---:|
| 海丝/世界遗产 | 5 | 4 | 4 | 5 | 4 |
| 闽南侨乡/寻根 | 5 | 5 | 3 | 5 | 3 |
| 美食 | 5 | 5 | 5 | 4 | 4 |
| 多元宗教 | 5 | 3 | 4 | 5 | 3 |
| 簪花 | 4 | 4 | 5 | 4 | 4 |
| 茶 | 4 | 4 | 4 | 4 | 4 |
| 德化瓷 | 4 | 3 | 4 | 5 | 3 |
| 永春香 | 4 | 3 | 4 | 5 | 3 |
| 南音 | 4 | 3 | 3 | 5 | 3 |
| 海岸 | 3 | 3 | 4 | 3 | 4 |

