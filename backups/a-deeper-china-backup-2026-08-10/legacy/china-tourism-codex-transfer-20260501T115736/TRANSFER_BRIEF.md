# 中国入境旅游 / 泉州外国游客资料迁移包

生成时间：2026-05-01T11:57:38.248Z

## 这个包包含什么

- 泉州外国游客知识库：市场分析、国家画像、主题卡、JSON 知识卡、FAQ 种子、RAG 入库指南、来源登记。
- 穷游泉州相关整理资料。
- China Insider 相关文档和项目代码的脱敏副本。
- 桌面“旅游智能平台”中的旅游方案/报告文档。
- Claude Code 本地会话中与泉州、外国游客、中国旅游、China Insider 相关的脱敏摘录。

## 这个包不包含什么

- API key、token、cookie、登录态、账号凭证。
- .env、Claude settings、Codex/Claude auth 配置。
- node_modules、.next、构建产物、缓存、大体积依赖。

## 给另一台电脑的 Codex 的接续提示

请先阅读：

1. 01-current-quanzhou-foreign-tourist-kb/README.md
2. 01-current-quanzhou-foreign-tourist-kb/market-analysis.md
3. 01-current-quanzhou-foreign-tourist-kb/theme-cards.md
4. 01-current-quanzhou-foreign-tourist-kb/knowledge-cards.json
5. 01-current-quanzhou-foreign-tourist-kb/rag-ingestion-guide.md

项目目标：
为外国游客来中国，尤其来泉州，建立可用于 RAG/问答助手/线路策划/海外营销的知识库。当前核心判断是：泉州最强卖点不是普通海滨风景，而是“世界级海丝港口 + 多元宗教遗产 + 闽南侨乡记忆 + 美食生活方式 + 手作非遗体验”。

下一步建议：

1. 把 Markdown 资料扩展成英文版知识库。
2. 把 knowledge-cards.json 转成 JSONL，每张卡独立入库。
3. 补实时数据：开放时间、价格、预约、交通、halal 餐厅、祈祷空间、机场/高铁可达性。
4. 抓取 UGC：Google Maps、Tripadvisor、TikTok、Instagram、小红书、YouTube 评论和高频问题。
5. 生成按国家的营销文案和 1/3/5/7 日英文线路。

## 主要客源市场判断

第一梯队：菲律宾、马来西亚、新加坡、印度尼西亚、泰国。
理由：Hokkien/闽南文化、侨乡寻根、家族记忆、美食、寺庙民俗。

第二梯队：日本、韩国。
理由：UNESCO、老城 City Walk、簪花摄影、茶、瓷器、短途亚洲旅行。

第三梯队：美国、加拿大、澳大利亚。
理由：高价值文化客、华裔寻根、大学/博物馆/宗教研究团体。

第四梯队：阿联酋、阿曼、沙特等中东国家。
理由：清净寺、伊斯兰圣墓、阿拉伯商贸记忆、Zayton、香料与永春香。

第五梯队：欧洲市场。
理由：UNESCO、Zayton、马可波罗时代叙事、Blanc de Chine 德化白瓷、多元宗教。
