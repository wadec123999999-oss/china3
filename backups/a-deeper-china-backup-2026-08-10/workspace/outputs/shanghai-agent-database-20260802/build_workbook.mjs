import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(await fs.readFile(path.join(root, '上海主城智能体数据库_V1.0.json'), 'utf8'));
const workbook = Workbook.create();
const navy = '#102A43', blue = '#2563EB', pale = '#EFF6FF', green = '#DCFCE7', amber = '#FEF3C7', red = '#FEE2E2', line = '#D9E2EC';

function styleTitle(sheet, title, subtitle, endCol) {
  sheet.mergeCells(`A1:${endCol}1`); sheet.getRange('A1').values = [[title]];
  sheet.getRange('A1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 16 }, horizontalAlignment: 'left', verticalAlignment: 'center' };
  sheet.getRange('A1').format.rowHeight = 30;
  sheet.mergeCells(`A2:${endCol}2`); sheet.getRange('A2').values = [[subtitle]];
  sheet.getRange('A2').format = { fill: '#F8FAFC', font: { color: '#486581', italic: true }, horizontalAlignment: 'left', verticalAlignment: 'center' };
  sheet.getRange('A2').format.rowHeight = 24;
}
function styleHeader(range) { range.format = { fill: blue, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, borders: { preset: 'outside', style: 'thin', color: line } }; }
function styleData(range) { range.format = { verticalAlignment: 'top', wrapText: true, borders: { preset: 'insideHorizontal', style: 'thin', color: line } }; }

const overview = workbook.worksheets.add('总览'); overview.showGridLines = false; styleTitle(overview, 'A Deeper China｜上海核心数据库 V1.0', '首发范围：上海核心城区｜英语独立旅行者｜2–4 天｜更新：2026-08-02', 'H');
overview.getRange('A4:H4').values = [['指标','数值','说明','', '状态定义','含义','','']]; styleHeader(overview.getRange('A4:H4'));
overview.getRange('A5:H10').values = [
  ['结构化点位', db.points.length, '含候选体验；动态事实不写死','','content_foundation_not_field_verified','内容已建，未现场验证','',''],
  ['路线模块', db.route_modules.length, '按问题组织，不是景点清单','','field_verified','已完成对应现场核验','',''],
  ['意图信号', db.signals.length, '识别显性需求与潜意图','','commercial_release','体验可预订/收款；须满足七项 gate','',''],
  ['追问规则', db.follow_up_rules.length, '避免凭空假设客户需求','','research_candidate','仅研究候选，不可报价/收款','',''],
  ['英文路书样稿', 3, '首访、亲子长者、二访艺术','','动态字段','开放、预约、班次、价格必须交付前复核','',''],
  ['现场放行项', 6, '当前真实通过数为 0','','','','','']
]; styleData(overview.getRange('A5:H10'));
overview.getRange('B5:B10').format.numberFormat = [['#,##0'],['#,##0'],['#,##0'],['#,##0'],['#,##0'],['#,##0']];
overview.getRange('A12:H12').merge(); overview.getRange('A12').values = [['产品原则：用江岸、历史街区、老城、公共生活和城市更新回答问题；不出售“网红清单”，不把住区或陌生人生活当体验。']]; overview.getRange('A12').format = { fill: pale, font: { bold: true, color: navy }, wrapText: true, verticalAlignment: 'center', borders: { preset: 'outside', style: 'thin', color: blue } }; overview.getRange('A12').format.rowHeight = 34;
overview.getRange('A14:H14').values = [['首发模块','核心问题','默认客群','动态复核重点','','','','']]; styleHeader(overview.getRange('A14:H14'));
overview.getRange(`A15:D${14 + db.route_modules.length}`).values = db.route_modules.map(m => [m.id, m.question, m.roles, m.dynamic_checks]); styleData(overview.getRange(`A15:D${14 + db.route_modules.length}`));
overview.getRange('A:A').format.columnWidth = 20; overview.getRange('B:B').format.columnWidth = 45; overview.getRange('C:C').format.columnWidth = 25; overview.getRange('D:D').format.columnWidth = 38; overview.getRange('E:E').format.columnWidth = 38; overview.getRange('F:F').format.columnWidth = 36; overview.getRange('G:H').format.columnWidth = 12; overview.freezePanes.freezeRows(4);

const points = workbook.worksheets.add('点位与体验'); points.showGridLines = false; styleTitle(points, '上海点位与体验库', '动态字段必须在交付前使用第一方来源复核；太极为 research_candidate。', 'N');
const pointHeaders = ['ID','点位/体验','模块','产品角色','核心解释','最佳时段','外国客摩擦/边界','证据','动态','来源','现场状态','默认输出','备注','检查日期'];
points.getRange('A4:N4').values = [pointHeaders]; styleHeader(points.getRange('A4:N4'));
const pointRows = db.points.map(p => [p.id,p.name,p.module,p.role,p.why,p.best_time,p.friction,p.evidence,p.dynamic ? '是' : '否',p.source,'未现场验证','按兴趣',p.id === 'SH020' ? '不可报价/预订/收款' : '',db.metadata.checked_at]);
points.getRange(`A5:N${4 + pointRows.length}`).values = pointRows; styleData(points.getRange(`A5:N${4 + pointRows.length}`));
points.getRange(`I5:I${4 + pointRows.length}`).conditionalFormats.add('containsText', { text: '是', format: { fill: amber, font: { color: '#92400E', bold: true } } });
points.getRange(`K5:K${4 + pointRows.length}`).conditionalFormats.add('containsText', { text: '未现场验证', format: { fill: red, font: { color: '#991B1B' } } });
for (const [col,width] of Object.entries({A:12,B:30,C:12,D:22,E:48,F:18,G:48,H:10,I:10,J:46,K:16,L:15,M:28,N:14})) points.getRange(`${col}:${col}`).format.columnWidth = width;
points.freezePanes.freezeRows(4);

const intent = workbook.worksheets.add('意图与追问'); intent.showGridLines = false; styleTitle(intent, '客户意图与追问库', '智能体应先识别用户说出的需求与未说出的约束，再选择模块。', 'D');
intent.getRange('A4:D4').values = [['用户表达/信号','潜意图','优先模块','状态']]; styleHeader(intent.getRange('A4:D4'));
intent.getRange(`A5:D${4 + db.signals.length}`).values = db.signals.map(({signal, latent_need, priority}) => [signal, latent_need, priority, '可调用']); styleData(intent.getRange(`A5:D${4 + db.signals.length}`));
const ruleRow = 7 + db.signals.length; intent.getRange(`A${ruleRow}:D${ruleRow}`).merge(); intent.getRange(`A${ruleRow}`).values = [['必须追问的情况']]; intent.getRange(`A${ruleRow}`).format = { fill: navy, font: { bold: true, color: '#FFFFFF' } };
intent.getRange(`A${ruleRow + 1}:C${ruleRow + 1}`).values = [['触发条件','必须问的问题','目的']]; styleHeader(intent.getRange(`A${ruleRow + 1}:C${ruleRow + 1}`));
intent.getRange(`A${ruleRow + 2}:C${ruleRow + 1 + db.follow_up_rules.length}`).values = db.follow_up_rules.map(r => [r.when,r.ask,'补齐可执行约束']); styleData(intent.getRange(`A${ruleRow + 2}:C${ruleRow + 1 + db.follow_up_rules.length}`));
intent.getRange('A:A').format.columnWidth = 26; intent.getRange('B:B').format.columnWidth = 55; intent.getRange('C:C').format.columnWidth = 38; intent.getRange('D:D').format.columnWidth = 16; intent.freezePanes.freezeRows(4);

const field = workbook.worksheets.add('现场放行'); field.showGridLines = false; styleTitle(field, '现场核验与商业放行', '没有可追溯的真实证据，不可将路线升级为 field_verified；太极须全部七项通过。', 'H');
field.getRange('A4:H4').values = [['核验编号','对象','最低证据','当前收到','当前通过','放行状态','下一步','关联产品']]; styleHeader(field.getRange('A4:H4'));
const fieldRows = [
  ['SHRUN001','人民广场—博物馆线','入口/英语/实际耗时/雨天与休息点',0,0,'未放行','实走并录入 JSON','首访、亲子'],
  ['SHRUN002','外滩—浦东过江线','过江方式/等待/人流/返程',0,0,'未放行','实走并录入 JSON','首访城市'],
  ['SHRUN003','衡复—武康步行线','连续性/树荫/厕所/住区边界',0,0,'未放行','实走并录入 JSON','建筑慢行'],
  ['SHRUN004','杨浦或西岸线','起终点/连续性/节目/照明',0,0,'未放行','实走并录入 JSON','二访艺术'],
  ['SHRUN005','外国客路书试用','任务完成/迷路点/反馈',0,0,'未放行','招募并测试','所有路书'],
  ['SHRUN006','英文太极体验','七项 gate + 现场试教',0,0,'不可售卖','联系老师并试教','太极体验']
];
field.getRange('A5:H10').values = fieldRows; styleData(field.getRange('A5:H10'));
field.getRange('F5:F10').conditionalFormats.add('containsText',{text:'未放行',format:{fill:red,font:{color:'#991B1B',bold:true}}}); field.getRange('F5:F10').conditionalFormats.add('containsText',{text:'不可售卖',format:{fill:red,font:{color:'#991B1B',bold:true}}});
field.getRange('A13:H13').merge(); field.getRange('A13').values = [['太极七项：英文试教｜公开资历｜主/雨备场地｜人数时长价格｜拍摄授权｜预约付款取消｜健康安全。七项都不是“以后再补”。']]; field.getRange('A13').format = { fill: amber, font: { bold:true, color:'#92400E' }, wrapText:true, verticalAlignment:'center' }; field.getRange('A13').format.rowHeight = 32;
for (const [col,width] of Object.entries({A:14,B:25,C:48,D:12,E:12,F:16,G:28,H:18})) field.getRange(`${col}:${col}`).format.columnWidth = width;

const sources = workbook.worksheets.add('动态来源'); sources.showGridLines = false; styleTitle(sources, '动态来源与复核台账', '第一方页面能说明“此刻的运营信息”，但不得当作长期不变事实。', 'G');
sources.getRange('A4:G4').values = [['对象','稳定可用的解释','必须复核的动态字段','复核频率','首选来源','当前状态','备注']]; styleHeader(sources.getRange('A4:G4'));
const sourceRows = [
  ['上海博物馆人民广场馆','中国物质文化框架','开放/预约/入口/展览','交付当天','https://www.shanghaimuseum.net/mu/frontend/pg/m/en/open-info','已查 2026-08-02','与东馆规则不可混用'],
  ['上海博物馆东馆','浦东文化日候选','开放/预约/入口/展览','交付当天','https://www.shanghaimuseum.net/mu/frontend/pg/m/en/service/visit-east','已查 2026-08-02','先确认客人指哪一馆'],
  ['外滩','江岸、贸易与金融叙事','人流/活动/天气/夜间条件','当天+现场','https://www.meet-in-shanghai.net/en/huangpu-district/the-bund-648313/','已查 2026-08-02','不承诺具体机位'],
  ['武康路','衡复街区阅读入口','施工/人流/店铺/步行环线','交付前+现场','https://english.shanghai.gov.cn/en-ScenicSpots/20231218/596192f5f59048bbbc3fa54d92304e93.html','已查 2026-08-02','住区隐私边界'],
  ['杨浦滨江','工业遗存与公共空间','连续性/骑行/照明/节目','交付前+现场','https://english.shanghai.gov.cn/en-CityTour/20250325/100ec92cb0ba4c36b24c5af1d2564715.html','已查 2026-08-02','不承诺全程'],
  ['豫园','园林与老城问题','票/预约/排队/活动','交付当天','https://english.shanghai.gov.cn/en-UniqueExperience-travelinshanghai/20250729/25cfb8bce97d4e798f99ac62986255ff.html','已查 2026-08-02','不等同“真实老上海”']
];
sources.getRange('A5:G10').values = sourceRows; styleData(sources.getRange('A5:G10'));
for (const [col,width] of Object.entries({A:25,B:35,C:36,D:16,E:55,F:18,G:25})) sources.getRange(`${col}:${col}`).format.columnWidth = width; sources.freezePanes.freezeRows(4);

const friction = workbook.worksheets.add('旅行摩擦'); friction.showGridLines = false; styleTitle(friction, '外国客旅行摩擦处理库', '先降低支付、进站、预约与天气的不确定性，再推荐体验；所有运营信息须动态复核。', 'F');
friction.getRange('A4:F4').values = [['触发信号','真实担心','智能体动作','禁止承诺','首选来源','状态']]; styleHeader(friction.getRange('A4:F4'));
const frictionRows = [
  ['Will my card work?','付款失败/没有本地手机号','移动支付 + 实体卡/少量现金双路径','所有地方都能刷卡','https://english.shanghai.gov.cn/en-PaymentMethods/20240313/6f4e58272f1a4cea9aec59c518915bdf.html','动态'],
  ['Can I use the Metro?','进站/换乘失败','国际卡、单程票、App 多路径；先非高峰试一次','一张卡必定全程无忧','https://www.meet-in-shanghai.net/en/news/shanghai-metro-now-accepts-international-credit-cards-339321/','动态'],
  ['Late airport arrival','到市区第一段焦虑','按到达时间、行李、酒店区当天核查','依据旧攻略承诺末班/价格','https://english.shanghai.gov.cn/en-Transportation/20250326/8540e79353de48a5b62e7b5e91488ffa.html','动态'],
  ['Which app do I need?','工具过多/账户失败','只给当前任务需要的最少工具','所有客人安装同一堆 App','https://english.shanghai.gov.cn/en-LatestNews/20251117/2da8d2d6c336475da7d90329c15221d8.html','动态'],
  ['Can I reserve?','实名/手机号/预约失败','确认日期证件人数，失败则给无预约替代','预约成功是默认','https://www.shanghaimuseum.net/mu/frontend/pg/m/en/open-info','动态'],
  ['Visa-free layover','资格与可用时间','只链接官方政策，按缓冲时间倒推','替客人判断签证资格','https://english.shanghai.gov.cn/en-240HourVisaFreeTransit/','动态'],
  ['Can I try Tai Chi?','英语/安全/可信度','收集限制，只有七项通过才给预订','推荐未核验课程','internal: SHRUN006','未放行'],
  ['Local food','点单/忌口/排队','先问忌口与场景；使用现场核验点','20 家必吃清单','internal: field records','待核验'],
  ['Parents/kids','台阶/厕所/雨天','降低跨区，输出实测休息点','仅凭地图说方便','internal: SHRUN001–004','待核验'],
  ['Rain/heat','行程崩盘','室内锚点 + 可缩短室外线','临时删除景点','venue first-party sources','动态']
];
friction.getRange('A5:F14').values = frictionRows; styleData(friction.getRange('A5:F14'));
friction.getRange('F5:F14').conditionalFormats.add('containsText',{text:'未放行',format:{fill:red,font:{color:'#991B1B',bold:true}}});
friction.getRange('F5:F14').conditionalFormats.add('containsText',{text:'待核验',format:{fill:amber,font:{color:'#92400E',bold:true}}});
for (const [col,width] of Object.entries({A:22,B:28,C:40,D:32,E:58,F:14})) friction.getRange(`${col}:${col}`).format.columnWidth = width; friction.freezePanes.freezeRows(4);

const out = path.join(root, '上海主城智能体内容与意图数据库_V1.0.xlsx');
const exported = await SpreadsheetFile.exportXlsx(workbook); await exported.save(out);
const inspect = await workbook.inspect({ kind: 'table', range: '总览!A1:H22', include: 'values,formulas', tableMaxRows: 24, tableMaxCols: 8 });
console.log(inspect.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'formula error scan' });
console.log(errors.ndjson);
for (const [sheetName, range, filename] of [
  ['总览', 'A1:H38', '01-overview'], ['点位与体验', 'A1:N44', '02-points'], ['意图与追问', 'A1:D50', '03-intents'],
  ['现场放行', 'A1:H13', '04-release'], ['动态来源', 'A1:G10', '05-sources'], ['旅行摩擦', 'A1:F14', '06-friction']
]) {
  const image = await workbook.render({ sheetName, range, scale: 1.1 });
  await fs.writeFile(path.join(root, `上海主城智能体内容与意图数据库_V1.0.${filename}.png`), new Uint8Array(await image.arrayBuffer()));
}
console.log(out);
