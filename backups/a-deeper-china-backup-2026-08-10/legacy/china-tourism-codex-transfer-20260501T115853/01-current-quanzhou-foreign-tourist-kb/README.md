# 泉州外国游客知识库初稿

更新时间：2026-05-01

这个文件夹用于搭建“外国游客来泉州”的知识库。当前版本基于公开网络资料、官方/半官方文旅资料、UNESCO/FAO 国际组织资料和旅游行业媒体资料整理，不等同于完整实时爬虫数据库；适合作为 RAG 知识库、旅游问答助手、线路策划和海外营销内容的第一版语料。

## 结论快照

泉州对外国游客最强的吸引力不是单点景观，而是“世界级海丝港口 + 多元宗教遗产 + 闽南侨乡记忆 + 美食生活方式 + 手作非遗体验”的组合。

按转化潜力看，最值得优先做的客源市场是：

1. 菲律宾、马来西亚、新加坡、印度尼西亚、泰国：闽南/福建/泉州籍华侨华人、Hokkien 文化、家族寻根、美食和寺庙民俗连接最强。
2. 日本、韩国：短中程亚洲游客，对世界遗产、老城 City Walk、簪花摄影、茶和瓷器体验接受度高。
3. 美国、加拿大、澳大利亚：高价值长线文化客、华人二三代寻根客、大学/博物馆/文化团体客。
4. 阿联酋、阿曼、沙特等中东国家：量级可能不大，但泉州的清净寺、伊斯兰圣墓、阿拉伯商贸记忆和永春香非常有差异化。
5. 意大利、法国、英国、德国、西班牙等欧洲市场：适合用“Zayton/刺桐、马可波罗时代的世界港口、Blanc de Chine 德化白瓷、东方宗教共存城市”做深度文化叙事。

按吸引点排序，建议优先建设的知识库主题是：

1. 海上丝绸之路与世界遗产：泉州最强的国际识别点。
2. 多元宗教与文明共处：对欧美、中东、南亚和文化型游客最有解释价值。
3. 闽南侨乡与寻根旅行：对东南亚市场转化最强。
4. 美食：低门槛、高分享、可日常消费，2025 年泉州加入 UNESCO 创意城市网络“美食之都”后更适合国际传播。
5. 簪花围与蟳埔女：年轻游客、女性游客、社交媒体传播的强钩子。
6. 安溪铁观音、德化白瓷、永春香：适合做半日/一日深度体验、伴手礼、研学和高客单产品。
7. 南音、木偶、梨园戏等表演艺术：适合夜间体验和文化团体。
8. 海岸、古城、桥梁、渔村：适合作为线路场景，不建议单独把“海边风景”作为泉州面向外国游客的第一卖点。

## 文件说明

- `market-analysis.md`：外国游客客源国与游客画像分析。
- `country-profiles.md`：按国家/地区拆分的客群、卖点、产品和内容策略。
- `theme-cards.md`：按吸引点整理的知识库主题卡，可直接拆分入库。
- `knowledge-cards.json`：结构化知识卡片，适合导入向量库或二次加工。
- `qa-seeds.md`：面向外国游客问答助手的种子问题与推荐回答方向。
- `rag-ingestion-guide.md`：知识库字段、切分、标签和后续补数建议。
- `source-register.md`：来源登记表与可信度分层，方便后续维护。

## 关键来源

- UNESCO World Heritage Centre: Quanzhou: Emporium of the World in Song-Yuan China  
  https://whc.unesco.org/en/list/1561/
- UNESCO Creative Cities Network: Quanzhou, Gastronomy, member since 2025  
  https://www.unesco.org/en/creative-cities/quanzhou
- UNESCO Intangible Cultural Heritage: Nanyin  
  https://ich.unesco.org/en/RL/nanyin-00199
- FAO GIAHS: Anxi Tieguanyin Tea Culture System  
  https://www.fao.org/giahs/giahs-around-the-world/china-anxi-tea-culture-system/en
- Quanzhou official gastronomy/application site: About Quanzhou  
  https://www.quanzhou.gov.cn/gastronomy/en/about/unesco-heritage/202412/t20241203_3112420.htm
- TTG China: 福建泉州入境旅游 2025 上半年发展数据  
  https://ttgchina.com/2025/08/21/%E7%A6%8F%E5%BB%BA%E6%B3%89%E5%B7%9E%E5%85%A5%E5%A2%83%E6%97%85%E6%B8%B82025%E4%B8%8A%E5%8D%8A%E5%B9%B4%E8%BF%85%E7%8C%9B%E5%8F%91%E5%B1%95/
