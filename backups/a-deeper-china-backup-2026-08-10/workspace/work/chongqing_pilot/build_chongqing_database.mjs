import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/apple/Documents/旅游视频/outputs/chongqing-pilot-20260728";
const outputPath = `${outputDir}/重庆入境深度旅行数据库_首轮研究版_V0.1.xlsx`;
const previewDir = `${outputDir}/previews`;
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = Workbook.create();
workbook.comments.setSelf({ displayName: "User" });

const summary = workbook.worksheets.add("项目总览");
const method = workbook.worksheets.add("筛选方法");
const places = workbook.worksheets.add("地点库");
const route = workbook.worksheets.add("5天路线");
const pain = workbook.worksheets.add("游客问题库");
const suppliers = workbook.worksheets.add("供应商候选");
const decisions = workbook.worksheets.add("产品决策");
const sources = workbook.worksheets.add("来源台账");

const colors = {
  navy: "#0A2036",
  blue: "#1F6FB2",
  blueLight: "#EAF2F8",
  gold: "#C49642",
  cream: "#F8F5EE",
  ink: "#17212B",
  muted: "#5F6B76",
  line: "#D8E1E8",
  green: "#237A57",
  greenLight: "#EAF5EF",
  amber: "#B7791F",
  amberLight: "#FFF5DE",
  red: "#B53A3A",
  redLight: "#FCEEEE",
  grayLight: "#F4F6F8",
  white: "#FFFFFF",
};

const checkedDate = new Date("2026-07-28T00:00:00+08:00");

function setTitle(sheet, title, subtitle, endCol, titleEndCol = endCol) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endCol}1`).format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 19 },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange(`A1:${titleEndCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format.rowHeight = 36;
  sheet.getRange(`A2:${endCol}2`).format = {
    fill: colors.cream,
    font: { color: colors.muted, size: 10 },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange(`A2:${titleEndCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format.rowHeight = 28;
}

function styleHeader(range) {
  range.format = {
    fill: colors.blueLight,
    font: { bold: true, color: colors.navy, size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: {
      bottom: { style: "medium", color: colors.blue },
      insideVertical: { style: "thin", color: colors.line },
    },
  };
  range.format.rowHeight = 34;
}

function styleData(range) {
  range.format = {
    font: { color: colors.ink, size: 9 },
    verticalAlignment: "top",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: colors.line },
    },
  };
}

function setWidths(sheet, widths) {
  for (const [col, width] of Object.entries(widths)) {
    sheet.getRange(`${col}:${col}`).format.columnWidth = width;
  }
}

const sourceUrls = {
  stats2025: "https://whlyw.cq.gov.cn/sjfb/202607/t20260706_15801807.html",
  intlPlan: "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/qtgw/202607/t20260710_15814399_app.html",
  streetMap: "https://www.cq.gov.cn/zwgk/zfxxgkml/zdlyxxgk/ggwh/ly/zxdt/202408/t20240816_13513807.html",
  huguang: "https://whlyw.cq.gov.cn/zjwl/yzq/cqwlzy/zqwwzy/202405/t20240507_13182428.html",
  hongya: "https://www.cq.gov.cn/zjcq/cycq/jplyxl/dsy/dsjp/202409/t20240905_13599455.html",
  rail: "https://jtj.cq.gov.cn/zwgk_240/zfxxgkml/gggs/tzgg/202603/t20260302_15481715.html",
  transitTips: "https://www.cq.gov.cn/ywdt/bmts/202504/t20250403_14491761.html",
  sightseeingBus: "https://cq.gov.cn/ywdt/bmts/202501/t20250123_14203069.html",
  museum: "https://www.3gmuseum.cn/web/article/1430010139317059584/web/content_1430010139317059584.html",
  cableway: "https://www.cqsuodao.com/zhangjiangsuodao.html",
  wulong: "https://cqwl.gov.cn/bmjz_sites/bm/wlw/zwgk_98942/zfxxgkml/jczwgkzl/ggwhfwly/ggfw/ggwljgmd/202601/t20260104_15286062.html",
  dazu: "https://www.dazu.gov.cn/qzfjz/smz/zwgk_53321/zfxxgkml/jczwgk_218260/ggwhfwlyjczwgk_1/ggfw/ggeljgml/202601/t20260105_15291915.html",
  redditPacked: "https://www.reddit.com/r/travelchina/comments/1v4olqp/thoughts_on_my_chongqing_itinerary/",
  redditDayCity: "https://www.reddit.com/r/travelchina/comments/1rotlj9/is_chongqing_just_a_night_city_what_to_do_during/",
  redditMistakes: "https://www.reddit.com/r/travelchina/comments/1tto8t7/common_mistakes_i_keep_seeing_in_china_travel/",
  redditSolo: "https://www.reddit.com/r/chinatravel/comments/1uv133a/first_time_in_china_solo_traveling/",
  redditHeat: "https://www.reddit.com/r/China/comments/1qw4zvj/things_you_should_know_before_visiting_chongqing/",
  redditLocal: "https://www.reddit.com/r/travelchina/comments/1oxtmu6/im_a_local_in_chongqing_here_to_answer_your/",
  yedu: "https://www.yedutrip.com/yedushop/p/chongqing-walking-tour",
  cqTours: "https://www.chongqingtours.com/",
  cqGuide: "https://chongqingtourguide.com/",
  tao: "https://taoinchongqing.com/",
  hugh: "https://hughchongqing.com/city-experiences/food-tour/",
  trippest: "https://www.trippest.com/chongqing-tours/3-hour-walking-tour/",
  opera: "https://whlyw.cq.gov.cn/zwxx_221/bmdt/gzdt/202607/t20260713_15818348.html",
  hotelReview: "https://www.wallpaper.com/travel/hotels/the-sunyata-renai-hall-hotel-chongqing-review",
};

// 项目总览
setTitle(
  summary,
  "重庆入境深度旅行数据库｜首轮研究版 V0.1",
  "目标不是生成景点清单，而是建立可解释、可取舍、可更新的产品判断系统。最后检查：2026-07-28",
  "J",
);
summary.getRange("A4:B4").merge();
summary.getRange("C4:D4").merge();
summary.getRange("E4:F4").merge();
summary.getRange("G4:H4").merge();
summary.getRange("I4:J4").merge();
summary.getRange("A4").values = [["地点条目"]];
summary.getRange("C4").values = [["必去/深度推荐"]];
summary.getRange("E4").values = [["证据 A/B 级"]];
summary.getRange("G4").values = [["待实地核验"]];
summary.getRange("I4").values = [["5天路线段"]];
summary.getRange("A5:B5").merge();
summary.getRange("C5:D5").merge();
summary.getRange("E5:F5").merge();
summary.getRange("G5:H5").merge();
summary.getRange("I5:J5").merge();
summary.getRange("A5").formulas = [["=COUNTA('地点库'!$A$6:$A$205)"]];
summary.getRange("C5").formulas = [[
  '=COUNTIF(\'地点库\'!$F$6:$F$205,"必去核心")+COUNTIF(\'地点库\'!$F$6:$F$205,"深度推荐")',
]];
summary.getRange("E5").formulas = [[
  '=COUNTIF(\'地点库\'!$T$6:$T$205,"A")+COUNTIF(\'地点库\'!$T$6:$T$205,"B")',
]];
summary.getRange("G5").formulas = [["=COUNTIF('地点库'!$R$6:$R$205,0)"]];
summary.getRange("I5").formulas = [["=COUNTA('5天路线'!$A$6:$A$205)"]];
summary.getRange("A4:J4").format = {
  fill: colors.blueLight,
  font: { bold: true, color: colors.navy, size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
summary.getRange("A5:J5").format = {
  fill: colors.white,
  font: { bold: true, color: colors.blue, size: 22 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { bottom: { style: "medium", color: colors.gold } },
};
summary.getRange("A4:J4").format.rowHeight = 26;
summary.getRange("A5:J5").format.rowHeight = 42;

summary.getRange("A7:J7").merge();
summary.getRange("A7").values = [["首轮产品判断"]];
summary.getRange("A7:J7").format = {
  fill: colors.navy,
  font: { bold: true, color: colors.white, size: 12 },
};
summary.getRange("A8:J12").values = [
  ["1", "主产品", "Beyond Cyberpunk Chongqing｜4天城区 + 1天文化/自然延伸", "", "", "", "", "", "", ""],
  ["2", "差异化", "用“城市如何运转、山地如何塑造生活”串联夜景、交通、历史、社区与食物，不以打卡数量为目标。", "", "", "", "", "", "", ""],
  ["3", "建议主线", "文化型付费路书优先大足石刻；自然型版本将武隆作为可替换的第5天。", "", "", "", "", "", "", ""],
  ["4", "明确降级", "洪崖洞内部、十八梯、TESTBED2、磁器口、长江索道和两江游船不做“必去”，按时段或客群条件推荐。", "", "", "", "", "", "", ""],
  ["5", "核心壁垒", "推荐理由、删除理由、冲突记录、外国人摩擦、路线实测与供应商履约数据，而不是地点数量。", "", "", "", "", "", "", ""],
];
for (let r = 8; r <= 12; r += 1) {
  summary.getRange(`C${r}:J${r}`).merge();
}
summary.getRange("A8:B12").format = {
  fill: colors.cream,
  font: { bold: true, color: colors.navy },
  verticalAlignment: "top",
};
summary.getRange("C8:J12").format = {
  font: { color: colors.ink, size: 10 },
  verticalAlignment: "top",
  wrapText: true,
  borders: { bottom: { style: "thin", color: colors.line } },
};
summary.getRange("A8:J12").format.rowHeight = 42;

summary.getRange("A14:J14").merge();
summary.getRange("A14").values = [["你只需要判断的五个问题"]];
summary.getRange("A14:J14").format = {
  fill: colors.gold,
  font: { bold: true, color: colors.navy, size: 12 },
};
summary.getRange("A15:J19").values = [
  ["Q1", "5天主版本第5天用大足，还是用更有大众传播力的武隆？", "建议：大足为深度文化版主线，武隆为自然版替换。", "", "", "", "", "", "", ""],
  ["Q2", "重庆的核心目标客群先做背包客/自由行，还是精品小团？", "建议：先用自由行路书验证，再把高摩擦模块升级为小团体验。", "", "", "", "", "", "", ""],
  ["Q3", "是否接受“少而深”：每天3—5个主节点，而不是8—12个打卡点？", "建议：接受，并把体力与坡度分级做成付费价值。", "", "", "", "", "", "", ""],
  ["Q4", "是否把火锅、川剧、茶馆做成可预约体验，而不是写进普通攻略？", "建议：是，但必须先验证英语、价格、影像权与取消规则。", "", "", "", "", "", "", ""],
  ["Q5", "是否同时制作低台阶/亲子版本？", "建议：先保留路线骨架，第二轮增加低体力替代，不与主线混写。", "", "", "", "", "", "", ""],
];
for (let r = 15; r <= 19; r += 1) {
  summary.getRange(`C${r}:J${r}`).merge();
}
summary.getRange("A15:J19").format = {
  font: { color: colors.ink, size: 9 },
  wrapText: true,
  verticalAlignment: "top",
  borders: { bottom: { style: "thin", color: colors.line } },
};
summary.getRange("A15:B19").format.fill = colors.grayLight;
summary.getRange("A15:A19").format.font = { bold: true, color: colors.blue };
summary.getRange("A15:J19").format.rowHeight = 45;
setWidths(summary, { A: 7, B: 18, C: 16, D: 12, E: 12, F: 12, G: 12, H: 12, I: 12, J: 12 });
summary.freezePanes.freezeRows(2);

// 筛选方法
setTitle(
  method,
  "去广告、去噪音的研究与编辑标准",
  "事实层、需求层、产品判断层分开；营销页面只能提供线索，不能直接证明产品价值。",
  "H",
);
method.getRange("A4:H4").values = [[
  "来源层级",
  "典型来源",
  "允许确认什么",
  "不能确认什么",
  "广告风险",
  "默认权重",
  "处理方式",
  "例子",
]];
styleHeader(method.getRange("A4:H4"));
const methodRows = [
  ["S1 原始权威", "政府、景区、交通、博物馆", "开放、票务、政策、地址、规则", "体验是否值得", "低", 5, "事实基准；仍记录发布日期", "重庆政府、三峡博物馆"],
  ["S2 专业研究", "遗产机构、学术、专业媒体", "历史背景、文化价值、设计与保护", "当日运营与实时拥挤", "低—中", 4, "用于叙事与解释", "遗产资料、建筑评论"],
  ["S3 海外真实使用", "Reddit、Trip Report、独立博客", "外国人困难、路线冲突、真实感受", "官方价格与开放时间", "中", 3, "提炼问题；至少两条独立证据", "路线过满、台阶、支付"],
  ["S4 本地发现", "本地媒体、小红书、抖音、B站", "新地点、社区线索、拍摄角度", "是否适合外国游客", "中—高", 2, "只进候选池，需反向检索", "隐藏机位、季节活动"],
  ["S5 商业营销", "OTA、旅行社、供应商官网", "产品存在、语言、标价、联系方式", "真实质量与履约能力", "高", 1, "供应商与评价分开；不进入事实结论", "英文导游、食物团"],
];
method.getRange(`A5:H${4 + methodRows.length}`).values = methodRows;
styleData(method.getRange(`A5:H${4 + methodRows.length}`));
method.getRange("F5:F9").format.numberFormat = "0";

method.getRange("A11:H11").merge();
method.getRange("A11").values = [["地点产品分（判断是否值得进入付费路书）"]];
method.getRange("A11:H11").format = {
  fill: colors.navy,
  font: { bold: true, color: colors.white, size: 12 },
};
method.getRange("A12:E12").values = [["维度", "权重", "高分定义", "低分定义", "注意"]];
styleHeader(method.getRange("A12:E12"));
const scoreRows = [
  ["独特性", 0.25, "离开重庆很难替代", "其他城市或网红街区可替代", "热度不等于独特性"],
  ["叙事密度", 0.25, "能解释城市、历史和生活", "只有拍照动作", "必须能写出“为什么”"],
  ["路线适配", 0.2, "能与前后节点形成顺路的一天", "单点孤立、转场代价大", "按门到门时间判断"],
  ["外国人可用", 0.2, "证件、支付、语言和入口清楚", "需要本地手机号或中文协助", "可通过人工服务补足"],
  ["摩擦成本反向分", 0.1, "低排队、低台阶、低不确定", "高拥挤、高台阶、高变动", "高摩擦可转为付费服务"],
];
method.getRange("A13:E17").values = scoreRows;
styleData(method.getRange("A13:E17"));
method.getRange("B13:B17").format.numberFormat = "0%";

method.getRange("A19:H19").merge();
method.getRange("A19").values = [["反向检索清单：每个热门地点必须补搜"]];
method.getRange("A19:H19").format = {
  fill: colors.gold,
  font: { bold: true, color: colors.navy, size: 12 },
};
method.getRange("A20:H24").values = [
  ["英文", "overrated / tourist trap / closed / too crowded", "stairs / disabled / elderly / stroller", "passport / foreign card / English", "rain / heat / last train / taxi", "", "", ""],
  ["中文", "暂停开放 / 施工 / 客流 / 限流", "排队 / 绕路 / 台阶 / 封路", "预约 / 护照 / 外卡 / 现金", "雨天 / 高温 / 末班车 / 打车", "", "", ""],
  ["评价抽样", "不只看首页高赞", "抽取近期、中评、差评", "区分服务失败与个人偏好", "记录反复出现的问题", "", "", ""],
  ["冲突处理", "不替用户猜", "保留多个来源及日期", "降低可信等级", "列入电话/实地核验", "", "", ""],
  ["更新机制", "高风险信息30天复核", "一般运营信息90天", "历史背景按年复核", "重大变化立即下架", "", "", ""],
];
for (let r = 20; r <= 24; r += 1) {
  method.getRange(`E${r}:H${r}`).merge();
}
styleData(method.getRange("A20:H24"));
method.getRange("A20:H24").format.rowHeight = 34;
setWidths(method, { A: 16, B: 24, C: 25, D: 24, E: 28, F: 12, G: 15, H: 24 });
method.freezePanes.freezeRows(4);

// 地点库
setTitle(
  places,
  "重庆地点与体验数据库",
  "V0.1 为网络研究版；现场核验字段全部为 0。产品分衡量“值得进入付费路书”，证据分衡量“现在能否对外承诺”。",
  "AF",
  "H",
);
places.getRange("A4:AF4").merge();
places.getRange("A4").values = [[
  "评分说明：产品分 = 独特性25% + 叙事密度25% + 路线适配20% + 外国人可用20% + 低摩擦10%；证据等级 A≥85、B≥70、C≥50、D<50。",
]];
places.getRange("A4:AF4").format = {
  fill: colors.cream,
  font: { color: colors.muted, italic: true, size: 9 },
  wrapText: true,
};
const placeHeaders = [
  "ID", "地点/体验", "区域", "类型", "核心主题", "推荐等级", "适合客群", "推荐/删除理由",
  "独特性", "叙事密度", "路线适配", "外国人可用", "摩擦成本", "产品分", "来源权威",
  "交叉一致", "时效", "现场核验", "证据分", "等级", "停留", "体力/台阶", "最佳时段",
  "预约/购票", "支付/证件", "英语支持", "雨天/替代", "主要风险/噪音", "来源URL 1",
  "来源URL 2", "最后检查", "下一步",
];
places.getRange("A5:AF5").values = [placeHeaders];
styleHeader(places.getRange("A5:AF5"));

const placeRows = [
  ["CQ001", "解放碑步行街", "渝中区", "城市地标", "抗战记忆与当代商业中心", "必去核心", "首次来渝/城市观察", "适合作为方向与城市层级的起点；不建议长时间购物式停留。", 4, 4, 5, 5, 2, null, 4, 4, 4, 0, null, null, "30—45分钟", "低", "上午或夜间顺路", "开放街区", "移动支付/现金", "中英标识较好", "雨天可用地下通道和商场", "节假日拥挤；商业内容噪音高", sourceUrls.intlPlan, sourceUrls.hongya, checkedDate, "实地核验"],
  ["CQ002", "洪崖洞（外观与层级体验）", "渝中区", "城市地标", "山地建筑、悬崖高差与夜景", "必去核心", "首次来渝/摄影", "价值在外部视角和高差感知；内部商业内容降级，限时45分钟。", 5, 3, 5, 4, 5, null, 5, 5, 4, 0, null, null, "30—60分钟", "中；台阶/拥挤", "亮灯前后", "开放街区；客流管控可能变化", "移动支付/现金", "标识尚可", "雨天改大剧院一侧远观", "内部同质化商业、拥挤、排队", sourceUrls.hongya, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ003", "千厮门大桥/大剧院江岸视角", "江北区", "城市景观", "两江、桥梁与洪崖洞整体关系", "深度推荐", "摄影/建筑/背包客", "比洪崖洞内部更能解释重庆空间；与洪崖洞组成一组。", 5, 4, 5, 5, 2, null, 3, 4, 3, 0, null, null, "45—75分钟", "中；步行", "日落至亮灯", "开放空间", "免费", "无需服务", "雨天谨慎桥面风雨", "大型活动与人流管制", sourceUrls.hongya, sourceUrls.redditDayCity, checkedDate, "实地核验"],
  ["CQ004", "魁星楼", "渝中区", "城市空间", "屋顶地面、22层落差", "深度推荐", "建筑/城市观察", "短停即可获得“8D”直观理解；不可单独拉长成景点。", 5, 4, 5, 5, 2, null, 3, 4, 3, 0, null, null, "20—30分钟", "低—中", "白天", "开放空间", "免费", "无需服务", "雨天防滑", "只拍照会显得浅", sourceUrls.redditPacked, sourceUrls.redditDayCity, checkedDate, "实地核验"],
  ["CQ005", "罗汉寺", "渝中区", "宗教/历史", "闹市中的佛教空间", "深度推荐", "文化/建筑/安静体验", "与周边摩天楼形成强烈对照，能打破纯赛博朋克叙事。", 4, 5, 4, 4, 2, null, 3, 3, 3, 0, null, null, "45—60分钟", "低", "上午", "现场规则待核验", "待核验", "英文导览待核验", "雨天可参观", "宗教礼仪与拍摄边界", sourceUrls.redditPacked, sourceUrls.redditDayCity, checkedDate, "电话核验"],
  ["CQ006", "朝天门与来福士江岸", "渝中区", "城市景观", "两江交汇、码头史与当代城市更新", "深度推荐", "建筑/城市史/摄影", "江岸公共空间值得；付费观景台不默认推荐。", 4, 5, 5, 5, 2, null, 4, 4, 3, 0, null, null, "60—90分钟", "中", "傍晚", "江岸开放；内部项目另购票", "移动支付/外卡待核验", "商业体英语较好", "雨天转室内", "观景台价格与天气影响价值", sourceUrls.sightseeingBus, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ007", "湖广会馆", "渝中区", "历史建筑/博物馆", "湖广填四川、移民与会馆文化", "必去核心", "文化/建筑/亲子/深度游客", "能解释重庆人口与城市形成，是从网红景观走向深度内容的关键节点。", 5, 5, 5, 3, 2, null, 5, 5, 4, 0, null, null, "90—120分钟", "中；坡地", "开馆后早段", "票务与护照规则待核验", "待核验", "英文内容待核验", "适合雨天", "演出和讲解可能有营销包装", sourceUrls.huguang, sourceUrls.streetMap, checkedDate, "电话核验"],
  ["CQ008", "白象居及下半城坡坎", "渝中区", "社区/建筑", "山地住宅、铁路与生活空间", "深度推荐", "建筑/摄影/背包客", "观察性强，但必须尊重居民；不把住宅楼当无边界影棚。", 5, 5, 4, 3, 4, null, 2, 3, 2, 0, null, null, "45—75分钟", "高；台阶", "白天非通勤时段", "社区开放边界待核验", "免费", "无英文服务", "雨天不推荐", "社区扰民、错误机位、消防通道", sourceUrls.sightseeingBus, sourceUrls.redditLocal, checkedDate, "实地核验"],
  ["CQ009", "山城巷/山城步道", "渝中区", "城市步行", "城墙、坡坎、社区与长江视角", "必去核心", "背包客/城市观察/摄影", "最能把地形、历史和日常生活连成一条线；需明确上/下行方向。", 5, 5, 5, 3, 4, null, 3, 5, 3, 0, null, null, "2—3小时", "高；大量坡道台阶", "上午或下午早段", "开放街区", "免费", "无统一英文导览", "雨天使用低体力替代", "入口与高差容易走错；不适合轮椅", sourceUrls.redditPacked, sourceUrls.yedu, checkedDate, "实地核验"],
  ["CQ010", "十八梯传统风貌区", "渝中区", "历史街区/商业", "母城下半城与城市更新", "只顺路", "首次来渝/低研究门槛", "与下浩里等内容重叠且商业化较强；作为连接节点，不占完整时段。", 3, 3, 4, 5, 3, null, 5, 5, 4, 0, null, null, "30—45分钟", "中；台阶", "平日白天", "开放街区", "移动支付/现金", "标识较好", "雨天可短停", "同质商业、节假日人流", sourceUrls.streetMap, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ011", "重庆中国三峡博物馆", "渝中区", "博物馆", "巴渝、三峡与重庆城市史", "必去核心", "首次来渝/文化/亲子", "为后续街区与江河路线建立认知框架；不是可删的普通博物馆。", 5, 5, 4, 5, 1, null, 5, 5, 5, 0, null, null, "2—3小时", "低", "开馆即入", "2025-10起免预约，凭有效证件；节假日需复核", "免费；带护照", "有英文页面，馆内覆盖待核验", "最佳雨天主项目", "周一闭馆/临时展览变化", sourceUrls.museum, sourceUrls.intlPlan, checkedDate, "实地核验"],
  ["CQ012", "人民大礼堂外观", "渝中区", "建筑地标", "20世纪城市象征与公共建筑", "只顺路", "建筑/摄影", "与三峡博物馆组合，外观20分钟足够；不单独拉时段。", 3, 4, 5, 5, 1, null, 4, 4, 3, 0, null, null, "20—30分钟", "低", "博物馆前后", "外观开放", "免费", "无需服务", "雨天外观短停", "活动封控", sourceUrls.museum, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ013", "中山四路", "渝中区", "历史街道", "抗战、外交与近代城市记忆", "深度推荐", "历史/城市步行", "安静、叙事密度高，可与博物馆串联；需要高质量英文解释。", 4, 5, 5, 4, 1, null, 3, 4, 3, 0, null, null, "60—90分钟", "低", "工作日下午", "开放街道；场馆另核验", "免费", "英文解释需自带", "雨天可步行缩短", "没有讲解容易变普通街景", sourceUrls.redditDayCity, sourceUrls.intlPlan, checkedDate, "实地核验"],
  ["CQ014", "李子坝轨道穿楼（含2号线乘坐）", "渝中区", "交通/城市空间", "单轨、山地交通与住宅共生", "必去核心", "首次来渝/亲子/交通迷", "应把乘坐2号线作为体验主体，观景台仅短停，避免排队式打卡。", 5, 5, 5, 5, 2, null, 5, 5, 5, 0, null, null, "45—75分钟", "低—中", "非高峰白天", "轨道正常购票", "交通码/单程票/现金", "中英标识", "雨天仍可乘坐", "高峰拥挤、只在观景台拍照过浅", sourceUrls.rail, sourceUrls.redditSolo, checkedDate, "实地核验"],
  ["CQ015", "鹅岭公园", "渝中区", "公园/视点", "两江地形与本地公共生活", "深度推荐", "城市观察/摄影/慢旅行", "白天理解城市地形，夜间可替代热门观景台；与李子坝顺路。", 4, 4, 5, 4, 2, null, 3, 4, 3, 0, null, null, "60—90分钟", "中；坡道", "上午或日落", "公园开放信息需核验", "免费/塔楼待核验", "无统一英文服务", "小雨可用，暴雨不宜", "能见度、塔楼开放", sourceUrls.redditDayCity, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ016", "TESTBED2 鹅岭二厂", "渝中区", "创意园/商业", "工业遗存与文创更新", "只顺路", "摄影/年轻游客", "与鹅岭公园相邻可短停；商业化强，不作为深度主节点。", 3, 2, 5, 5, 2, null, 2, 4, 3, 0, null, null, "30—45分钟", "中", "平日下午", "开放园区", "移动支付", "部分商户可英文沟通", "雨天可进店", "商业同质化、影视滤镜噪音", sourceUrls.redditDayCity, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ017", "黄桷坪涂鸦街", "九龙坡区", "艺术街区", "学院艺术、城市更新与社区", "深度推荐", "艺术/摄影/年轻游客", "与交通茶馆和川美组合后才有产品价值；单独看墙不够。", 4, 4, 5, 4, 2, null, 2, 4, 3, 0, null, null, "60—90分钟", "低—中", "白天", "开放街区", "免费", "英文解释需自带", "小雨可用", "涂鸦更替、部分内容陈旧", sourceUrls.redditPacked, sourceUrls.redditDayCity, checkedDate, "实地核验"],
  ["CQ018", "交通茶馆", "九龙坡区", "茶馆/社区体验", "老茶馆与重庆日常社交", "深度推荐", "文化/摄影/慢旅行", "真实生活感强，但需确认接待边界、拍摄礼仪与是否过度网红化。", 5, 5, 5, 2, 4, null, 1, 3, 2, 0, null, null, "60—90分钟", "低", "工作日上午", "现场消费", "现金/移动支付待核验", "无稳定英文服务", "雨天适合", "居民被拍摄、座位与商业拍摄冲突", sourceUrls.redditDayCity, sourceUrls.redditLocal, checkedDate, "实地核验"],
  ["CQ019", "四川美术学院黄桷坪校区周边", "九龙坡区", "艺术/校园周边", "当代艺术与城市文化", "条件推荐", "艺术专业/院校团体", "对艺术客群价值高；普通首访客只作为黄桷坪组合中的背景。", 4, 4, 5, 3, 2, null, 2, 3, 2, 0, null, null, "45—90分钟", "低", "白天", "校园访问规则待核验", "免费", "英文服务不稳定", "雨天部分可用", "校园开放边界、展览变化", sourceUrls.redditDayCity, sourceUrls.intlPlan, checkedDate, "电话核验"],
  ["CQ020", "磁器口", "沙坪坝区", "古镇/商业", "巴渝民居、码头与非遗", "条件推荐", "亲子/首次来渝/购物", "官方文化价值明确，但主街商业化强；只在早晨或有明确非遗目标时进入。", 4, 4, 3, 5, 4, null, 5, 4, 4, 0, null, null, "90—150分钟", "中；石板路", "开门后1小时内", "开放街区", "移动支付/现金", "热门区标识较好", "雨天可但拥挤", "主街同质化、节假日过载", sourceUrls.streetMap, sourceUrls.sightseeingBus, checkedDate, "实地核验"],
  ["CQ021", "白公馆—渣滓洞", "沙坪坝区", "历史遗址", "抗战末期与政治历史", "条件推荐", "历史研究/教育团体", "叙事重要但敏感、沉重且英文解释不足；不默认放入轻松休闲版。", 4, 5, 3, 3, 3, null, 5, 4, 5, 0, null, null, "2—3小时", "中；转场", "上午", "官方预约与开放需复核", "多为免费", "英文导览待核验", "雨天可", "需要平衡、准确、克制的历史说明", "https://www.hongyanmuseum.cn/", sourceUrls.sightseeingBus, checkedDate, "电话核验"],
  ["CQ022", "龙门浩—下浩里", "南岸区", "历史街区", "开埠史、山地街巷与南岸视角", "必去核心", "建筑/慢旅行/摄影", "比十八梯更适合深度步行；与东水门、黄葛古道形成南岸历史线。", 5, 5, 5, 4, 3, null, 5, 4, 4, 0, null, null, "2—3小时", "高；坡道台阶", "下午至日落", "开放街区", "移动支付/现金", "商户英语不稳定", "雨天缩短路线", "入口与上下层混淆、节假日拍照人群", sourceUrls.streetMap, sourceUrls.redditPacked, checkedDate, "实地核验"],
  ["CQ023", "黄葛古道—黄桷垭老街", "南岸区", "古道/街区", "川黔古道、马帮与山城陆路", "深度推荐", "徒步/历史/背包客", "能解释重庆不只有江运，也有山地陆路；适合高体力版。", 5, 5, 4, 2, 5, null, 4, 4, 3, 0, null, null, "2.5—4小时", "高；持续爬升", "凉爽季上午", "开放步道", "免费", "无稳定英文服务", "雨天禁用", "高温、湿滑、体力误判", sourceUrls.streetMap, sourceUrls.trippest, checkedDate, "实地核验"],
  ["CQ024", "老君洞", "南岸区", "宗教/观景", "道教、山地信仰与城市视角", "深度推荐", "文化/徒步/摄影", "与黄葛古道组合价值高；需明确宗教礼仪和台阶。", 5, 5, 4, 3, 5, null, 2, 3, 2, 0, null, null, "60—90分钟", "高；台阶", "上午或日落前", "开放规则待核验", "待核验", "英文解释需自带", "雨天不推荐", "礼仪、拍摄边界、台阶", sourceUrls.redditPacked, sourceUrls.trippest, checkedDate, "电话核验"],
  ["CQ025", "南山一棵树", "南岸区", "观景台", "重庆夜景", "条件推荐", "首次来渝/摄影", "天气好且不想徒步时使用；不是唯一夜景选择，能见度差时删除。", 3, 2, 3, 4, 4, null, 3, 4, 2, 0, null, null, "60—90分钟", "中", "日落前抵达", "票务与开放需复核", "待核验", "基础服务", "雨雾天删除", "堵车、能见度、返程打车", sourceUrls.redditPacked, sourceUrls.redditHeat, checkedDate, "实地核验"],
  ["CQ026", "弹子石老街", "南岸区", "历史街区/商业", "开埠史与现代商业更新", "只顺路", "亲子/休闲/低体力", "空间友好但商业化较强；作为低体力南岸替代，不与下浩里重复安排。", 3, 3, 4, 5, 2, null, 5, 4, 4, 0, null, null, "60—90分钟", "低—中", "傍晚", "开放街区", "移动支付/现金", "标识尚可", "雨天可", "主题重叠、商业噪音", sourceUrls.streetMap, sourceUrls.sightseeingBus, checkedDate, "实地核验"],
  ["CQ027", "长江索道", "渝中—南岸", "交通体验", "跨江交通与城市视角", "条件推荐", "首次来渝/亲子", "早班或排队短时才值得；排队超过30分钟则用轨道/步行桥替代。", 4, 3, 4, 4, 5, null, 5, 4, 3, 0, null, null, "20—60分钟", "低；排队", "开门后早段", "官方平台购票，实时复核", "移动支付/证件规则待核验", "热门项目服务较成熟", "大风雨可能停运", "排队、临停、单程终点安排", sourceUrls.cableway, sourceUrls.redditPacked, checkedDate, "电话核验"],
  ["CQ028", "两江游船", "渝中区码头", "夜游", "两江夜景", "条件推荐", "低体力/亲子/首次来渝", "为低体力客群提供完整夜景；背包客可用桥上步行替代。", 3, 2, 3, 4, 3, null, 2, 3, 2, 0, null, null, "60—90分钟", "低", "夜间", "船班、码头与票价需当日核验", "移动支付", "可能有基础英文", "雨天视船况", "码头混淆、营销票种、能见度", sourceUrls.redditPacked, sourceUrls.sightseeingBus, checkedDate, "电话核验"],
  ["CQ029", "重庆川剧院/川剧演出", "中心城区", "表演/非遗", "川剧、变脸与巴蜀舞台艺术", "深度推荐", "文化/亲子/小团", "必须从“看变脸”升级为演前解释、后台/互动和英文支持，才可形成高客单体验。", 5, 5, 4, 2, 3, null, 4, 4, 5, 0, null, null, "90—150分钟", "低", "按演出时段", "档期与票务待核验", "待核验", "英文讲解需洽谈", "雨天主项目", "演出质量差异、影像权、商业拼盘", sourceUrls.opera, sourceUrls.intlPlan, checkedDate, "供应商洽谈"],
  ["CQ030", "本地社区火锅体验", "中心城区", "饮食体验", "码头饮食、香料与社交规则", "必去核心", "全部客群（需饮食分级）", "不是“网红店清单”，而是锅底、点菜、蘸料、辣度与社交的可解释体验。", 5, 5, 5, 2, 4, null, 2, 3, 2, 0, null, null, "2—3小时", "低", "晚餐", "最好预约；餐厅待选", "外卡/现金能力需验证", "需英文主理人或翻译", "雨天适合", "辣度、过敏、内脏、油烟、排队", sourceUrls.hugh, sourceUrls.cqTours, checkedDate, "供应商洽谈"],
  ["CQ031", "观音桥夜市/街区", "江北区", "本地商业/夜生活", "当代城市生活与年轻人社交", "深度推荐", "年轻背包客/食物/夜生活", "比游客型小吃街更接近日常消费；适合作为住宿与夜间模块，不强塞进白天主线。", 4, 4, 4, 4, 3, null, 4, 4, 5, 0, null, null, "2—3小时", "低", "晚间", "开放街区", "移动支付/现金", "英语不稳定", "雨天转商场/室内餐厅", "噪音、饮食卫生与夜归", sourceUrls.intlPlan, sourceUrls.hugh, checkedDate, "实地核验"],
  ["CQ032", "重庆动物园", "九龙坡区", "动物园/亲子", "大熊猫与城市家庭客群", "条件推荐", "亲子/熊猫首访", "只在亲子或熊猫优先客群中加入；普通深度城市版删除。", 3, 2, 3, 5, 3, null, 3, 4, 3, 0, null, null, "3—4小时", "中", "开园后早段", "票务与动物出场需复核", "移动支付/现金", "热门景点标识较好", "高温雨天体验下降", "高温、动物活动时间、人流", sourceUrls.sightseeingBus, sourceUrls.redditLocal, checkedDate, "实地核验"],
  ["CQ033", "大足石刻（宝顶山/北山）", "大足区", "世界遗产/艺术史", "9—13世纪石窟艺术与儒释道融合", "必去核心", "文化/艺术/宗教/高客单小团", "比普通重庆打卡线更能建立文化权威；适合作为深度版第5天。", 5, 5, 4, 3, 4, null, 5, 5, 5, 0, null, null, "完整1天", "中；景区步行", "早出发", "官方公众号预约；最新票价复核", "护照购票流程待核验", "英文讲解/导览待核验", "小雨可，大雨调整", "城际交通、讲解质量、闭馆时点", sourceUrls.dazu, "https://whc.unesco.org/en/list/912/", checkedDate, "电话核验"],
  ["CQ034", "武隆天生三桥/龙水峡地缝", "武隆区", "世界自然遗产/地貌", "深切峡谷与喀斯特", "条件推荐", "自然/摄影/首次来渝", "大众传播力强，适合作为自然版第5天；体力和城际交通必须写清。", 5, 4, 3, 3, 5, null, 5, 5, 5, 0, null, null, "完整1天", "高；长距离步行", "早出发", "官方小程序/OTA；季节时间明确", "护照与接驳待核验", "景区英语待核验", "暴雨/地质风险时删除", "步行量、接驳、天气、残障适配", sourceUrls.wulong, sourceUrls.redditPacked, checkedDate, "实地核验"],
];
places.getRange(`A6:AF${5 + placeRows.length}`).values = placeRows;
styleData(places.getRange(`A6:AF${5 + placeRows.length}`));
for (let r = 6; r <= 5 + placeRows.length; r += 1) {
  places.getRange(`N${r}`).formulas = [[`=ROUND((I${r}*25+J${r}*25+K${r}*20+L${r}*20+(6-M${r})*10)/5,0)`]];
  places.getRange(`S${r}`).formulas = [[`=ROUND((O${r}*35+P${r}*25+Q${r}*20+IF(R${r}=1,5,2)*20)/5,0)`]];
  places.getRange(`T${r}`).formulas = [[`=IF(S${r}>=85,"A",IF(S${r}>=70,"B",IF(S${r}>=50,"C","D")))`]];
}
places.getRange(`I6:S${5 + placeRows.length}`).format.horizontalAlignment = "center";
places.getRange(`N6:N${5 + placeRows.length}`).format.numberFormat = "0";
places.getRange(`S6:S${5 + placeRows.length}`).format.numberFormat = "0";
places.getRange(`AE6:AE${5 + placeRows.length}`).format.numberFormat = "yyyy-mm-dd";
places.getRange(`F6:F205`).dataValidation = {
  rule: { type: "list", values: ["必去核心", "深度推荐", "条件推荐", "只顺路", "不推荐"] },
};
places.getRange(`R6:R205`).dataValidation = {
  rule: { type: "whole", operator: "between", formula1: 0, formula2: 1 },
};
places.getRange(`AF6:AF205`).dataValidation = {
  rule: { type: "list", values: ["无需", "线上复核", "电话核验", "实地核验", "供应商洽谈"] },
};
for (const [text, fill, color] of [
  ["必去核心", colors.greenLight, colors.green],
  ["深度推荐", colors.blueLight, colors.blue],
  ["条件推荐", colors.amberLight, colors.amber],
  ["只顺路", colors.grayLight, colors.muted],
  ["不推荐", colors.redLight, colors.red],
]) {
  places.getRange(`F6:F205`).conditionalFormats.add("containsText", {
    text,
    format: { fill, font: { bold: true, color } },
  });
}
places.getRange(`T6:T205`).conditionalFormats.add("containsText", {
  text: "A",
  format: { fill: colors.greenLight, font: { bold: true, color: colors.green } },
});
places.getRange(`T6:T205`).conditionalFormats.add("containsText", {
  text: "D",
  format: { fill: colors.redLight, font: { bold: true, color: colors.red } },
});
places.tables.add(`A5:AF${5 + placeRows.length}`, true, "PlacesTable");
places.freezePanes.freezeRows(5);
places.freezePanes.freezeColumns(2);
setWidths(places, {
  A: 10, B: 26, C: 12, D: 15, E: 24, F: 13, G: 20, H: 42,
  I: 9, J: 10, K: 10, L: 12, M: 10, N: 10, O: 10, P: 10, Q: 8,
  R: 10, S: 10, T: 8, U: 14, V: 16, W: 16, X: 30, Y: 23, Z: 20,
  AA: 24, AB: 32, AC: 44, AD: 44, AE: 13, AF: 15,
});

// 5天路线
setTitle(
  route,
  "Beyond Cyberpunk Chongqing｜5天深度路线骨架",
  "主版本为4天城区 + 1天大足文化延伸；武隆为第5天可替换自然版。所有门到门时间仍需实走。",
  "O",
  "H",
);
const routeHeaders = [
  "段ID", "天", "主题", "建议时间", "节点", "建议时长", "交通/方向", "为什么放这里",
  "必须讲清的内容", "体力", "外国人摩擦", "雨天/低体力替代", "推荐状态", "来源", "待核验",
];
route.getRange("A5:O5").values = [routeHeaders];
styleHeader(route.getRange("A5:O5"));
const routeRows = [
  ["D1-01", 1, "城市为何长成这样", "09:00", "解放碑方向与地面层级说明", "45分钟", "步行", "先建立方向感和山城“地面不唯一”的概念", "碑的历史；不要把步行街当购物项目", "低", "地图海拔与出口", "雨天转地下通道", "主线", sourceUrls.intlPlan, "出口实测"],
  ["D1-02", 1, "城市为何长成这样", "10:00", "罗汉寺", "50分钟", "步行", "用宗教空间对照摩天楼与商业中心", "礼仪、香火与拍摄边界", "低", "英文解释不足", "雨天保留", "主线", sourceUrls.redditDayCity, "开放/拍摄规则"],
  ["D1-03", 1, "城市为何长成这样", "11:10", "魁星楼与高差观察", "30分钟", "步行", "第一次直观看到屋顶、广场和22层高差", "重庆的立体交通不是视觉噱头", "中", "入口层级", "雨天防滑", "主线", sourceUrls.redditPacked, "最佳观察点"],
  ["D1-04", 1, "城市为何长成这样", "12:00", "非网红午餐", "75分钟", "步行", "避免第一天直接上重辣火锅", "点菜、辣度、内脏与过敏提示", "低", "英文菜单/支付", "室内", "主线", sourceUrls.redditHeat, "餐厅候选"],
  ["D1-05", 1, "城市为何长成这样", "14:00", "朝天门江岸", "75分钟", "轨道/步行", "从两江、码头和城市更新理解重庆的门户性", "朝天门不是只有来福士", "中", "江岸入口与高差", "雨天转商业体", "主线", sourceUrls.sightseeingBus, "江岸路线实测"],
  ["D1-06", 1, "城市为何长成这样", "16:30", "洪崖洞外部层级体验", "45分钟", "步行", "白天先看建筑结构，不在内部购物层消耗时间", "洪崖门、吊脚楼意象与现代重建", "中", "人流/出口", "大雨删除", "主线", sourceUrls.hongya, "亮灯时点"],
  ["D1-07", 1, "城市为何长成这样", "18:30", "千厮门桥—大剧院江岸看夜景", "90分钟", "步行过桥/轨道返程", "从外部获得完整夜景并避开内部商业噪音", "灯光、桥梁、两江关系", "中", "桥面天气/活动封控", "雨天转鹅岭或室内", "主线", sourceUrls.hongya, "桥面通行"],
  ["D2-01", 2, "移民与下半城", "09:00", "湖广会馆", "100分钟", "轨道/步行", "先理解湖广填四川和会馆体系", "移民如何重塑重庆人口和商业", "中", "护照购票/英文导览", "雨天保留", "主线", sourceUrls.huguang, "票务/英文讲解"],
  ["D2-02", 2, "移民与下半城", "10:50", "白象居外围与坡坎", "60分钟", "步行", "紧邻下半城，观察住宅与交通叠加", "尊重居民，不追逐私密机位", "高", "社区边界/台阶", "低体力者删除", "主线", sourceUrls.redditLocal, "居民边界"],
  ["D2-03", 2, "移民与下半城", "12:10", "下半城午餐", "75分钟", "步行", "让餐饮服务路线而不是反过来", "小面/江湖菜的点餐逻辑", "低", "辣度/菜单", "室内", "主线", sourceUrls.redditHeat, "餐厅候选"],
  ["D2-04", 2, "移民与下半城", "14:00", "山城巷/山城步道（建议自上而下）", "2.5小时", "短程车到高点后下行", "用完整步行而非碎片打卡理解城墙、坡坎与长江", "入口方向、地形、近代遗址与居民生活", "高", "Google地图偏差/台阶", "三峡博物馆替代", "主线", sourceUrls.yedu, "完整实走"],
  ["D2-05", 2, "移民与下半城", "17:00", "十八梯只作通行与比较", "30分钟", "步行", "比较保护更新与商业化，不占完整时段", "为什么不把网红街区都列为必去", "中", "人流", "可直接删除", "降级", sourceUrls.streetMap, "上下行出口"],
  ["D2-06", 2, "移民与下半城", "18:00", "社区型火锅体验", "2.5小时", "步行/短程车", "把食物、社交和点菜规则做成可交付体验", "锅底、油碟、内脏、辣度、节奏", "低", "过敏/支付/英语", "雨天保留", "主线", sourceUrls.cqTours, "供应商试吃"],
  ["D3-01", 3, "重庆的历史骨架", "09:00", "重庆中国三峡博物馆", "2.5小时", "轨道", "为三峡、巴渝、抗战和城市变迁建立知识框架", "优先展厅和英文内容选择", "低", "护照入馆/英文覆盖", "雨天核心", "主线", sourceUrls.museum, "展厅实测"],
  ["D3-02", 3, "重庆的历史骨架", "11:40", "人民大礼堂外观", "20分钟", "步行", "与博物馆形成20世纪公共建筑对照", "只外观，不占用半天", "低", "活动封控", "雨天短停", "主线", sourceUrls.museum, "入口"],
  ["D3-03", 3, "重庆的历史骨架", "13:10", "中山四路", "75分钟", "短程车/步行", "把抗战陪都与外交史放进安静街区", "建筑、机构与城市记忆", "低", "英文解释", "雨天缩短", "主线", sourceUrls.redditDayCity, "场馆开放"],
  ["D3-04", 3, "重庆的历史骨架", "15:00", "鹅岭公园", "90分钟", "轨道/步行", "在高点重新读取两江与半岛", "城市地形与本地公园生活", "中", "坡道/能见度", "大雨转室内", "主线", sourceUrls.redditDayCity, "塔楼开放"],
  ["D3-05", 3, "重庆的历史骨架", "16:45", "TESTBED2 短停", "35分钟", "步行", "只讨论工业遗存与文创更新，不长时间消费", "什么被保存、什么被商业化", "中", "同质商户", "雨天可", "降级", sourceUrls.redditDayCity, "30分钟够不够"],
  ["D3-06", 3, "重庆的历史骨架", "18:00", "观音桥夜间社区消费观察", "2小时", "轨道", "从游客中心转到本地年轻人的夜生活", "夜市、商圈、夜归与消费", "低", "拥挤/晚归", "雨天转商场", "可选", sourceUrls.intlPlan, "夜市位置"],
  ["D4-01", 4, "单轨、工业与艺术社区", "09:00", "乘坐2号线至李子坝", "60分钟", "2号线", "乘车本身比观景台更重要", "跨座式单轨与山地城市交通", "低", "高峰拥挤", "雨天保留", "主线", sourceUrls.rail, "最佳车厢/方向"],
  ["D4-02", 4, "单轨、工业与艺术社区", "10:10", "李子坝观景台短停", "25分钟", "步行", "补足外部观察，不排长队", "住宅、站体与城市空间共生", "低", "人流", "可跳过", "主线", sourceUrls.redditSolo, "人流时点"],
  ["D4-03", 4, "单轨、工业与艺术社区", "11:30", "黄桷坪—交通茶馆", "90分钟", "轨道+短程车", "从交通地标转入真实社交空间", "茶馆礼仪、摄影边界与本地节奏", "低", "英语/拍摄", "雨天保留", "主线", sourceUrls.redditLocal, "拍摄规则"],
  ["D4-04", 4, "单轨、工业与艺术社区", "13:30", "黄桷坪涂鸦街/川美周边", "2小时", "步行", "把公共艺术、学院与社区更新放在一起", "不是只找网红墙", "中", "校园边界", "小雨可", "主线", sourceUrls.redditDayCity, "展览/开放"],
  ["D4-05", 4, "单轨、工业与艺术社区", "16:30", "龙门浩—下浩里", "2.5小时", "短程车", "在南岸完成开埠史、街巷与日落", "东水门、开埠建筑与街区更新", "高", "台阶/入口", "低体力改弹子石", "主线", sourceUrls.streetMap, "完整实走"],
  ["D4-06", 4, "单轨、工业与艺术社区", "19:30", "南岸晚餐后返程", "90分钟", "步行+轨道/车", "避免再叠加热门夜景点", "体力回收与夜归交通", "低", "打车/末班车", "室内", "主线", sourceUrls.redditMistakes, "返程时间"],
  ["D5A-01", 5, "文化延伸版", "07:30", "重庆城区—大足", "2—3小时", "高铁/巴士/包车待定", "把转场成本公开写进产品", "不同交通方案的门到门时间", "低—中", "车站/护照/接驳", "大雨视情况", "主版本", sourceUrls.dazu, "交通实测"],
  ["D5A-02", 5, "文化延伸版", "10:30", "宝顶山石刻", "3小时", "景区交通", "用核心造像讲儒释道、宋代社会与日常伦理", "讲解质量决定产品价值", "中", "英文讲解/购票", "小雨可", "主版本", sourceUrls.dazu, "英文讲解"],
  ["D5A-03", 5, "文化延伸版", "14:30", "北山石刻或大足博物馆", "2小时", "短程车", "根据客群在艺术深度和低体力之间选择", "不追求五山全打卡", "中", "接驳", "博物馆替代", "主版本", sourceUrls.dazu, "开放/动线"],
  ["D5A-04", 5, "文化延伸版", "17:00", "返重庆", "2—3小时", "高铁/巴士/包车", "保证不过度承诺晚间安排", "返程缓冲", "低", "堵车/车次", "无", "主版本", sourceUrls.dazu, "末班交通"],
  ["D5B-01", 5, "自然替换版", "07:00", "重庆城区—武隆", "2.5—3.5小时", "高铁+接驳/包车", "只在自然偏好客群中替换大足", "门到门时间与接驳不可省略", "低—中", "车站/接驳", "暴雨删除", "替换", sourceUrls.wulong, "交通实测"],
  ["D5B-02", 5, "自然替换版", "10:30", "天生三桥", "3小时", "景区接驳+步行", "核心喀斯特体验", "电梯、步行距离、体力和天气", "高", "长步行/残障适配", "暴雨删除", "替换", sourceUrls.wulong, "全程步数"],
  ["D5B-03", 5, "自然替换版", "14:00", "龙水峡地缝（体力允许）", "2小时", "接驳+步行", "仅在天气和体力合适时叠加", "不要为打卡强塞两个高强度景区", "高", "湿滑/台阶", "仙女山或提前返程", "可选", sourceUrls.wulong, "实际体力"],
  ["D5B-04", 5, "自然替换版", "16:30", "返重庆", "3小时", "接驳+高铁/包车", "预留充足返程缓冲", "不要安排当晚刚性演出", "低", "错过车次", "无", "替换", sourceUrls.wulong, "返程方案"],
];
route.getRange(`A6:O${5 + routeRows.length}`).values = routeRows;
styleData(route.getRange(`A6:O${5 + routeRows.length}`));
route.getRange(`B6:B${5 + routeRows.length}`).format.numberFormat = "0";
route.getRange(`M6:M205`).dataValidation = {
  rule: { type: "list", values: ["主线", "主版本", "替换", "可选", "降级", "删除"] },
};
route.getRange("M6:M205").conditionalFormats.add("containsText", {
  text: "主线",
  format: { fill: colors.greenLight, font: { bold: true, color: colors.green } },
});
route.getRange("M6:M205").conditionalFormats.add("containsText", {
  text: "降级",
  format: { fill: colors.grayLight, font: { color: colors.muted } },
});
route.tables.add(`A5:O${5 + routeRows.length}`, true, "RouteTable");
route.freezePanes.freezeRows(5);
route.freezePanes.freezeColumns(2);
setWidths(route, {
  A: 10, B: 6, C: 22, D: 12, E: 30, F: 14, G: 22, H: 36, I: 35, J: 11,
  K: 26, L: 28, M: 12, N: 40, O: 22,
});

// 游客问题库
setTitle(
  pain,
  "外国游客问题库",
  "这些问题决定路书是否有付费价值。事实解决方案必须在发布前再次复核。",
  "L",
  "H",
);
const painHeaders = [
  "问题ID", "旅程阶段", "真实问题", "为什么通用AI容易答错", "严重度", "出现频率",
  "产品解决方案", "需收集字段", "证据类型", "来源1", "来源2", "下一步",
];
pain.getRange("A5:L5").values = [painHeaders];
styleHeader(pain.getRange("A5:L5"));
const painRows = [
  ["P01", "行前", "支付工具未提前设置或外卡偶发失败", "只说“绑定支付宝即可”，没有失败备份与小商户场景", "高", "高", "提供设置清单、测试支付、现金备份和失败处理", "外卡/现金/ATM/限额", "海外游客+政策", sourceUrls.redditMistakes, sourceUrls.intlPlan, "建立测试流程"],
  ["P02", "行前", "Google地图位置与中国实际导航、楼层入口不一致", "无法理解重庆多个地面层和POI高差", "高", "高", "为每个节点提供中文名、入口照片、最近出口和高差说明", "中文名/坐标/入口/海拔层", "海外游客", sourceUrls.redditPacked, sourceUrls.redditDayCity, "逐点实测"],
  ["P03", "抵达", "重庆西站、北站、东站和沙坪坝站选择错误", "只计算直线距离，不计安检、拥堵与站内步行", "高", "中—高", "路书明确车站全名、适合线路和门到门缓冲", "车站/地铁/打车/行李", "海外游客+交通", sourceUrls.redditMistakes, sourceUrls.intlPlan, "实测西/北站"],
  ["P04", "交通", "下雨或高峰期打车困难，地面交通慢", "忽略天气与山地道路造成的动态时间", "高", "高", "优先轨道；每段提供雨天与高峰替代", "高峰/雨天/末班车", "海外游客", sourceUrls.redditMistakes, sourceUrls.transitTips, "建立时间带"],
  ["P05", "交通", "只去李子坝观景台，错过单轨乘坐本身", "热门清单把“拍照点”当完整体验", "中", "高", "指定乘坐区间、方向和观景台短停上限", "车厢/方向/时段", "海外游客+产品判断", sourceUrls.redditSolo, sourceUrls.redditDayCity, "实测方向"],
  ["P06", "游览", "一天塞太多跨区景点", "AI按地点相似度排列，不计算坡度、排队和真实转场", "高", "高", "每天3—5个主节点；记录门到门和体力", "转场/坡度/排队/恢复", "海外游客", sourceUrls.redditPacked, sourceUrls.redditMistakes, "整日实走"],
  ["P07", "游览", "台阶、坡度和无障碍信息不足", "网页只写“步行”，不写连续爬升、湿滑和替代入口", "高", "中—高", "建立体力等级、台阶类型和低体力平行路线", "台阶/坡道/电梯/座椅", "海外游客", sourceUrls.redditPacked, sourceUrls.redditHeat, "低体力实测"],
  ["P08", "游览", "洪崖洞内部花费时间但体验同质", "热门度掩盖内部商业化与最佳视角在外部", "中", "高", "明确“外观必去、内部限时”，给跨桥视角", "亮灯/人流/视角/出口", "官方+海外游客", sourceUrls.hongya, sourceUrls.redditPacked, "夜间实测"],
  ["P09", "游览", "长江索道排队时间超过体验价值", "通用答案把索道列为必去，不设删除阈值", "中", "高", "设30分钟排队阈值；超过即改轨道或步行桥", "实时排队/停运/终点", "官方+海外游客", sourceUrls.cableway, sourceUrls.redditPacked, "早晚实测"],
  ["P10", "餐饮", "不会控制辣度、内脏、过敏与点菜份量", "翻译菜名不能解释锅底、油碟和点餐节奏", "高", "高", "建立英文点菜卡、禁忌清单与可信餐厅", "辣度/过敏/素食/卫生", "海外游客+供应商", sourceUrls.redditHeat, sourceUrls.hugh, "供应商试吃"],
  ["P11", "信息", "微信小程序预约对护照和海外手机号不友好", "只给小程序名称，不说明证件类型、失败路径和人工窗口", "高", "中", "逐景点记录护照、手机号、支付和现场替代", "证件/手机号/支付/窗口", "官方+实测", sourceUrls.museum, sourceUrls.dazu, "护照测试"],
  ["P12", "沟通", "餐厅、茶馆和社区英语能力有限", "“有翻译App”不能替代复杂点菜和礼仪说明", "中", "高", "关键体验配置双语主理人；一般地点提供中文卡片", "英语/翻译/紧急联系", "海外游客+政策", sourceUrls.redditLocal, sourceUrls.intlPlan, "英语接待测试"],
  ["P13", "天气", "夏季高温、湿度和阵雨破坏路线", "按固定清单推荐，没有热暴露和恢复节点", "高", "季节性高", "夏季改早晚双峰；中午室内；补水与中暑提示", "温度/暴晒/室内替代", "海外游客", sourceUrls.redditHeat, sourceUrls.redditPacked, "夏季实走"],
  ["P14", "行李", "山城老街酒店与民宿存在台阶和车辆无法抵达", "住宿平台距离不代表真实落客和搬运行李难度", "高", "中", "记录落客点、电梯、台阶、行李服务和雨天入口", "落客/台阶/电梯/前台", "专业媒体+实测", sourceUrls.hotelReview, sourceUrls.redditMistakes, "酒店核验"],
  ["P15", "城际", "武隆/大足一日游被低估转场和体力", "只显示景区游览时间，不计高铁站、接驳和排队", "高", "高", "公开门到门时间；大足与武隆不在同一天混搭", "车次/接驳/步数/天气", "官方+海外游客", sourceUrls.wulong, sourceUrls.dazu, "完整实走"],
  ["P16", "节假日", "高铁售罄、景点拥挤、营业变化", "静态推荐忽略中国节假日需求峰值", "高", "季节性高", "设置节假日禁售/替换规则和提前预订窗口", "节假日/余票/限流", "海外游客", sourceUrls.redditMistakes, sourceUrls.intlPlan, "建立日历"],
];
pain.getRange(`A6:L${5 + painRows.length}`).values = painRows;
styleData(pain.getRange(`A6:L${5 + painRows.length}`));
pain.getRange(`E6:E205`).dataValidation = { rule: { type: "list", values: ["高", "中", "低"] } };
pain.getRange("E6:E205").conditionalFormats.add("containsText", {
  text: "高",
  format: { fill: colors.redLight, font: { bold: true, color: colors.red } },
});
pain.tables.add(`A5:L${5 + painRows.length}`, true, "PainTable");
pain.freezePanes.freezeRows(5);
setWidths(pain, { A: 10, B: 12, C: 35, D: 42, E: 10, F: 12, G: 42, H: 28, I: 18, J: 42, K: 42, L: 20 });

// 供应商候选
setTitle(
  suppliers,
  "供应商与合作对象候选池",
  "出现于此表不等于推荐或合作。商业页面只证明“产品存在”，必须完成资质、英语、价格、影像权、安全与退款核验。",
  "M",
  "H",
);
const supplierHeaders = [
  "候选ID", "名称", "类型", "可补足的产品模块", "公开语言", "公开形式", "广告风险",
  "当前状态", "必须核验", "淘汰触发", "公开来源", "联系结果", "下一步",
];
suppliers.getRange("A5:M5").values = [supplierHeaders];
styleHeader(suppliers.getRange("A5:M5"));
const supplierRows = [
  ["S001", "Yedu", "步行向导/数字路书", "山城步道、城市历史、14km深度步行", "英/法/粤/普通话", "独立官网", "高", "候选", "执照、保险、真实带团、路线边界、分成", "无法出示资质或责任条款", sourceUrls.yedu, "", "体验竞品并访谈"],
  ["S002", "Chongqing Tours", "英文地接/食物团", "城市+食物7小时体验", "英语", "商业官网", "高", "候选", "旅行社资质、导游证、保险、团型、退款", "只有营销文案无真实运营证明", sourceUrls.cqTours, "", "索取正式报价"],
  ["S003", "ChongqingTourGuide.com", "私人英文向导", "定制城市深度游", "英语", "商业官网", "高", "候选", "人员身份、资质、评价真实性、报价", "联系人与履约主体不清", sourceUrls.cqGuide, "", "背景核验"],
  ["S004", "Tao in Chongqing", "持证导游候选", "摄影、城市一日游、本地文化", "英语", "个人商业官网", "高", "候选", "导游证、旅行社合作主体、保险、影像权", "无法提供合法收款与合同", sourceUrls.tao, "", "线上访谈"],
  ["S005", "Hugh Chongqing", "食物团/司机", "观音桥食物与夜生活", "英语", "商业官网", "高", "候选", "餐厅清单、过敏规则、司机资质、报价", "餐饮安全与责任不清", sourceUrls.hugh, "", "体验竞品"],
  ["S006", "Trippest", "步行产品平台", "山城巷或黄葛古道英文步行", "英语", "商业平台", "高", "候选", "实际履约方、佣金、取消、讲解质量", "平台与实际供应商信息不透明", sourceUrls.trippest, "", "反查履约方"],
  ["S007", "重庆川剧院/演出机构", "文化机构", "川剧演出、演前解释、互动体验", "待核验", "官方机构", "低", "候选", "英语、档期、团体价格、后台、影像权、安全", "只能看演出且无法形成差异化", sourceUrls.opera, "", "正式联系"],
  ["S008", "重庆湖广会馆", "文博/演出场地", "移民文化、建筑、戏台与讲解", "待核验", "官方景区", "低", "候选", "英文讲解、团体接待、非开放区、影像权", "无法提供英文/深度讲解", sourceUrls.huguang, "", "电话核验"],
  ["S009", "大足石刻官方及讲解团队", "世界遗产景区", "文化版第5天核心交付", "待核验", "官方景区", "低", "候选", "英文讲解、护照购票、包车/接驳、团体政策", "英文解释质量不足且无替代", sourceUrls.dazu, "", "电话核验"],
  ["S010", "武隆景区及接驳方", "自然景区", "自然版第5天核心交付", "待核验", "官方景区", "低", "候选", "护照购票、英文、步行量、残障、接驳", "天气与体力信息无法标准化", sourceUrls.wulong, "", "电话核验"],
  ["S011", "既下山·重庆山城巷仁爱堂", "住宿/B2B潜在伙伴", "历史建筑住宿、行李与社区体验", "基础英语待核验", "专业媒体报道", "中", "候选", "外国人登记、落客、行李、英语、B2B意愿", "到店交通与语言无法稳定交付", sourceUrls.hotelReview, "", "酒店访谈"],
  ["S012", "持证入境旅行社（待筛选）", "合规承接主体", "组合报价、收款、保险、用车与合同", "必须英语", "待调研", "未知", "待建池", "国内+入境资质、责任险、外币/外卡、投诉", "资质不全或只做传统大团", "", "", "建立5家名单"],
];
suppliers.getRange(`A6:M${5 + supplierRows.length}`).values = supplierRows;
styleData(suppliers.getRange(`A6:M${5 + supplierRows.length}`));
suppliers.getRange("H6:H205").dataValidation = {
  rule: { type: "list", values: ["待建池", "候选", "已联系", "已核验", "试用", "合作", "淘汰"] },
};
suppliers.getRange("H6:H205").conditionalFormats.add("containsText", {
  text: "淘汰",
  format: { fill: colors.redLight, font: { bold: true, color: colors.red } },
});
suppliers.getRange("H6:H205").conditionalFormats.add("containsText", {
  text: "合作",
  format: { fill: colors.greenLight, font: { bold: true, color: colors.green } },
});
suppliers.tables.add(`A5:M${5 + supplierRows.length}`, true, "SupplierTable");
suppliers.freezePanes.freezeRows(5);
setWidths(suppliers, { A: 10, B: 28, C: 20, D: 34, E: 16, F: 18, G: 12, H: 12, I: 42, J: 34, K: 45, L: 22, M: 20 });

// 产品决策
setTitle(
  decisions,
  "产品决策记录",
  "把“为什么收录/删除”变成可积累资产。你的判断会覆盖我的默认建议，但保留版本和理由。",
  "J",
);
const decisionHeaders = [
  "决策ID", "问题", "我的建议", "理由", "不采用的代价", "你的决定", "状态", "决定日期", "影响范围", "下一次复盘",
];
decisions.getRange("A5:J5").values = [decisionHeaders];
styleHeader(decisions.getRange("A5:J5"));
const decisionRows = [
  ["D001", "第5天主线：大足还是武隆？", "大足为深度文化版主线；武隆为自然版替换", "大足更稀缺、更适合讲解和高客单；武隆更有大众传播力", "只选武隆会接近通用攻略；只选大足会损失自然热度", "", "待你判断", "", "路线/定位/供应链", "首轮实走后"],
  ["D002", "住宿基地区域", "首次来渝用解放碑/小什字；二次来访或夜生活用观音桥", "第一次需要步行便利和城市冲击；观音桥更本地但转场多", "选错基地区域会放大高差和打车成本", "", "待你判断", "", "住宿/B2B/路线", "酒店核验后"],
  ["D003", "每天节点数量", "3—5个主节点，餐饮与休息算正式节点", "重庆的坡度、天气和转场会让8—12点路线失真", "看起来内容少，但交付稳定性更高", "", "建议通过", "", "全部路书", "用户测试后"],
  ["D004", "洪崖洞的定位", "外观必去、内部限时，不做购物推荐", "真正价值在外部整体和城市高差，内部商业噪音高", "可能与大众“必逛内部”的期待冲突", "", "建议通过", "", "D1/营销内容", "夜间实测后"],
  ["D005", "十八梯与下浩里是否都做主节点", "下浩里主节点；十八梯只作比较/连接", "内容重叠，十八梯商业化更强", "减少一个知名打卡点", "", "建议通过", "", "D2/D4", "实走后"],
  ["D006", "是否做低台阶/亲子版本", "第二轮单独做，不在主路线里用括号堆砌", "低体力路线需要不同入口、交通和停留逻辑", "开发量增加约30%—40%", "", "待你判断", "", "产品版本", "主线完成后"],
  ["D007", "火锅是否作为可预约产品", "是；从餐厅推荐升级为双语点菜与文化解释", "食物是重庆最强的社交体验，但外国人摩擦也最高", "需要供应商、过敏和责任规则", "", "待你判断", "", "供应链/高客单", "试吃后"],
  ["D008", "川剧是否进入重庆主产品", "进入雨天/夜间模块，但前提是英文和互动", "能补足文化深度并改善雨天交付", "若只有变脸拼盘会显得商业化", "", "待你判断", "", "体验/B2B", "机构访谈后"],
  ["D009", "磁器口是否保留", "保留为早晨/非遗定向模块，不进默认5天主线", "官方文化价值高，但主街商业化和客流代价大", "可能错过首次游客的知名期待", "", "待你判断", "", "可选模块", "早晨实走后"],
  ["D010", "产品核心叙事", "“城市如何运转”优先于“赛博朋克打卡”", "海外流量由视觉进入，但付费靠解释、顺路和可执行", "营销钩子仍需保留夜景与单轨", "", "建议通过", "", "品牌/内容/路书", "用户访谈后"],
];
decisions.getRange(`A6:J${5 + decisionRows.length}`).values = decisionRows;
styleData(decisions.getRange(`A6:J${5 + decisionRows.length}`));
decisions.getRange("G6:G205").dataValidation = {
  rule: { type: "list", values: ["待你判断", "建议通过", "已通过", "需修改", "暂缓", "否决"] },
};
decisions.getRange("G6:G205").conditionalFormats.add("containsText", {
  text: "待你判断",
  format: { fill: colors.amberLight, font: { bold: true, color: colors.amber } },
});
decisions.getRange("G6:G205").conditionalFormats.add("containsText", {
  text: "已通过",
  format: { fill: colors.greenLight, font: { bold: true, color: colors.green } },
});
decisions.getRange("H6:H205").format.numberFormat = "yyyy-mm-dd";
decisions.tables.add(`A5:J${5 + decisionRows.length}`, true, "DecisionTable");
decisions.freezePanes.freezeRows(5);
setWidths(decisions, { A: 10, B: 30, C: 38, D: 42, E: 34, F: 28, G: 14, H: 14, I: 24, J: 18 });

// 来源台账
setTitle(
  sources,
  "来源台账与广告风险",
  "每条来源只承担它能证明的内容。海外讨论与商业页面不可用于确认开放时间或票务事实。",
  "I",
);
const sourceHeaders = [
  "来源ID", "来源名称", "来源类型", "层级", "主要用途", "广告风险", "发布日期/状态", "核心信息", "URL",
];
sources.getRange("A5:I5").values = [sourceHeaders];
styleHeader(sources.getRange("A5:I5"));
const sourceRows = [
  ["SRC001", "2025年重庆市旅游业统计公报", "官方统计", "S1", "市场背景", "低", "2026-07发布", "重庆入境旅游总体增长与规模", sourceUrls.stats2025],
  ["SRC002", "境外人员来渝便利化三年行动计划", "市政府政策", "S1", "支付、交通、语言、入境服务", "低", "2026-07", "明确涉外标识、支付、景区和交通改进方向；也说明当前仍有缺口", sourceUrls.intlPlan],
  ["SRC003", "重庆旅游休闲街区地图", "政府/规划", "S1", "街区定位与官方边界", "低", "2024-08", "磁器口、十八梯、龙门浩、黄桷垭等官方定位", sourceUrls.streetMap],
  ["SRC004", "湖广会馆", "文旅委/文物", "S1", "建筑、历史与文化解释", "低", "2024-05", "会馆建筑与移民文化价值", sourceUrls.huguang],
  ["SRC005", "洪崖洞", "市政府景点页", "S1", "地址、交通、官方叙事", "低", "2024-09", "洪崖洞建筑与交通信息", sourceUrls.hongya],
  ["SRC006", "重庆轨道交通线网图", "交通主管部门", "S1", "轨道线路", "低", "2026-02", "当前线网基础", sourceUrls.rail],
  ["SRC007", "三峡博物馆取消预约公告", "博物馆官方", "S1", "入馆规则", "低", "2025-09", "主馆等自2025-10起凭有效证件免预约入馆", sourceUrls.museum],
  ["SRC008", "长江索道官方页", "运营方", "S1", "运营与购票候选", "低", "持续更新", "需以当日运营信息为准", sourceUrls.cableway],
  ["SRC009", "武隆A级景区名录2026", "区文旅委", "S1", "票价、开放、预约", "低", "2026-01", "天生三桥、龙水峡等官方信息", sourceUrls.wulong],
  ["SRC010", "大足A级景区名录2026", "区文旅委", "S1", "地址、电话、预约", "低", "2026-01", "大足石刻官方预约与咨询方式", sourceUrls.dazu],
  ["SRC011", "Reddit：重庆路线过满讨论", "海外用户讨论", "S3", "体力、路线冲突、重复景点", "中", "2026-07", "台阶、转场和Shibati/下浩里内容重叠", sourceUrls.redditPacked],
  ["SRC012", "Reddit：重庆白天做什么", "海外用户讨论", "S3", "昼间内容与深度叙事", "中", "2026-03", "不应把重庆只做成夜景和赛博朋克", sourceUrls.redditDayCity],
  ["SRC013", "Reddit：中国行程常见错误", "海外用户讨论", "S3", "支付、车站、雨天与高峰", "中", "2026-06", "西站转场、雨天打车、节假日和外卡失败", sourceUrls.redditMistakes],
  ["SRC014", "Reddit：首次独自旅行中国", "海外用户讨论", "S3", "轨道、12306、护照闸机", "中", "2026-07", "先熟悉轨道、护照走人工通道等实际问题", sourceUrls.redditSolo],
  ["SRC015", "Reddit：来重庆前应知道", "海外/本地讨论", "S3", "高温、餐饮与英文", "中", "2026-02", "夏季热风险和点菜摩擦", sourceUrls.redditHeat],
  ["SRC016", "Yedu walking tour", "商业供应商", "S5", "竞品、路线强度、语言", "高", "公开售卖", "14km步行与多语言服务为候选信号，不等于质量已验证", sourceUrls.yedu],
  ["SRC017", "Chongqing Tours", "商业供应商", "S5", "食物团/地接竞品", "高", "公开售卖", "英文城市与食物产品存在", sourceUrls.cqTours],
  ["SRC018", "Hugh Chongqing food tour", "商业供应商", "S5", "观音桥食物团竞品", "高", "公开售卖", "英文向导与司机为候选信号", sourceUrls.hugh],
  ["SRC019", "重庆川剧院接待海外创作者报道", "文旅委", "S1", "川剧国际体验可行性", "低", "2026-07", "海外创作者参访、观看和互动说明机构具备涉外场景", sourceUrls.opera],
  ["SRC020", "Wallpaper：山城巷仁爱堂酒店评论", "专业媒体", "S2", "住宿、行李、语言和社区体验", "中", "2025", "历史建筑住宿的价值与落客、语言摩擦", sourceUrls.hotelReview],
  ["SRC021", "重庆观光巴士线路", "市政府", "S1", "热门景点连接关系", "低", "2025-01", "解放碑、洪崖洞、南滨路、李子坝等公共交通串联", sourceUrls.sightseeingBus],
  ["SRC022", "重庆官方涉外服务目标", "市政府", "S1", "产品机会与缺口", "低", "2026-07", "2026年底双语标识、线路、支付与多语种服务目标", sourceUrls.intlPlan],
];
sources.getRange(`A6:I${5 + sourceRows.length}`).values = sourceRows;
styleData(sources.getRange(`A6:I${5 + sourceRows.length}`));
sources.getRange("F6:F205").dataValidation = { rule: { type: "list", values: ["低", "中", "高", "未知"] } };
sources.getRange("F6:F205").conditionalFormats.add("containsText", {
  text: "高",
  format: { fill: colors.redLight, font: { bold: true, color: colors.red } },
});
sources.tables.add(`A5:I${5 + sourceRows.length}`, true, "SourceTable");
sources.freezePanes.freezeRows(5);
setWidths(sources, { A: 11, B: 35, C: 20, D: 10, E: 30, F: 12, G: 18, H: 45, I: 55 });

// Shared polish
for (const sheet of [summary, method, places, route, pain, suppliers, decisions, sources]) {
  const used = sheet.getUsedRange();
  used.format.verticalAlignment = "top";
}

// Compact previews for visual QA.
const previews = [
  ["项目总览", "A1:J19", "01-summary.png"],
  ["筛选方法", "A1:H24", "02-method.png"],
  ["地点库", "A1:H18", "03-places-main.png"],
  ["地点库", "N1:T18", "04-places-scores.png"],
  ["5天路线", "A1:J20", "05-route.png"],
  ["游客问题库", "A1:H18", "06-pain.png"],
  ["供应商候选", "A1:I18", "07-suppliers.png"],
  ["产品决策", "A1:J16", "08-decisions.png"],
  ["来源台账", "A1:I18", "09-sources.png"],
];
for (const [sheetName, range, fileName] of previews) {
  const blob = await workbook.render({ sheetName, range, scale: 1.35, format: "png" });
  await fs.writeFile(`${previewDir}/${fileName}`, new Uint8Array(await blob.arrayBuffer()));
}

const inspectSummary = await workbook.inspect({
  kind: "table",
  range: "项目总览!A1:J19",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 10,
});
console.log(inspectSummary.ndjson);

const inspectPlaces = await workbook.inspect({
  kind: "table",
  range: `地点库!A5:T${Math.min(15, 5 + placeRows.length)}`,
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 20,
});
console.log(inspectPlaces.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`OUTPUT=${outputPath}`);
