# 重庆主城智能体决策内核 V0.1

这不是一个直接聊天的机器人，而是独立站智能体后面的确定性决策层。它把大模型已经提取出的旅行者状态，与重庆主城数据库中的路线模块、硬约束、动态核验项和商业闸门进行匹配，再返回可审计的路线草案。

## 为什么需要这一层

如果让通用 AI 直接从聊天生成攻略，它很容易：

- 把推测当事实；
- 为了“丰富”而塞入过多景点；
- 忽略台阶、轮椅、过敏、商业拍摄和抵离时间；
- 对未核验的开放、价格、档期和供应商作确定承诺；
- 无法解释某次规则修改为什么改变了路线。

本内核把这些风险变成硬规则和机器测试。大模型负责理解与表达，数据库和决策内核负责过滤、排序、去重、追问与商业边界。

## 独立站调用链

1. 对话模型保存客户原话，并提取显性事实、潜意图、硬约束、未知项和状态变化。
2. 服务端按 `schemas/decision-request.schema.json` 组装结构化请求。潜意图必须保留证据原话和置信度。
3. 调用 `decide(database, request)`。
4. 如果返回 `needs_confirmation`，只向客户提出最高优先级的 1—2 个问题。
5. 如果返回 `roadbook_draft_ready`，表达模型仅使用 `days[].modules` 中的承诺、解释、观察任务和现实提醒生成路书。
6. 发布前执行 `audit.dynamicChecks`；未完成的项目必须用条件句或删除。
7. 只有 `commercial.mayQuote`、`mayTakePayment` 和人工实时档期均允许时，才能进入体验结算。

## 运行

要求 Node.js 20 或以上，不依赖第三方运行时包。

```bash
npm test
npm run regression
npm run demo
npm run roadbook
npm run samples
npm run field:validate
npm run field:progress
```

也可以传入自定义请求和数据库：

```bash
node bin/decide.mjs /absolute/path/request.json /absolute/path/database.json
node bin/run-regression.mjs /absolute/path/database.json /absolute/path/report.json
node bin/roadbook.mjs /absolute/path/request.json /absolute/path/database.json
```

## 在服务端导入

```js
import { decide } from "./src/core.mjs";

const response = decide(chongqingDatabase, structuredRequest);
```

不要把游客自由文本直接传给 `decide`。文本理解属于上游模型；本内核只接受已结构化、可校验的状态。

## 输入重点

- `trip`：天数、基础客群、体力、天气、输出长度、抵离和酒店信息是否已知。
- `locale`：`en` 或 `zh-CN`，缺省为 `en`。英文模块来自数据库内的受控文案，不由路书生成器临时自由翻译。
- `intents`：八个潜意图维度，每项包括 0—5 强度、0—1 置信度和客户原话证据；低于 0.50 不参与排序。
- `constraints`：轮椅、过敏、孕期、商业拍摄、无人机、夜间返程、场馆动态等布尔硬约束。
- `liveChecks`：人工或官方渠道已经确认的事实。
- `purchase`：询价、预约、付款、取消等购买信号。

完整定义见 `schemas/decision-request.schema.json`。

## 输出重点

- `status`：需要追问，或已可生成路书草案。
- `followUps`：最多两项高价值追问。
- `days`：每天经过过滤、排序和主题去重后的 2—4 个路线模块。
- `commercial`：报价、收款、档期承诺的硬闸门。
- `audit`：使用/忽略的意图、动态核验项、被排除模块及原因、完整排序结果。

完整定义见 `schemas/decision-response.schema.json`。

模块级决策字段位于 `../chongqing-agent-database-20260729/重庆决策字段_V1.0.json`，点位级字段位于 `../chongqing-agent-database-20260729/重庆点位决策字段_V1.0.json`，并由运行时接入每个选中的模块和点位。它增加了客户需求、推断需求、为什么不选附近替代项、停止条件、低能量/雨天分支、体力成本、点位模式、点位使用条件和释放边界。校验命令：

```bash
npm run validate:decision-layer
```

## 英文路书

V1.0包含24个受控英文模块，每个模块都有经过编辑的英文名称、节点、承诺、核心解释、观察任务、现实提醒和确认项。安全、隐私、开放、拍摄和商业边界被直接写进英文内容。

`src/roadbook.mjs` 将决策结果渲染为对客Markdown，不输出内部评分、画像标签、供应商研究或未选模块。生成器会明确区分：

- 需要确认的规划草案；
- 可生成但仍需动态复核的路线草案；
- 未通过商业闸门的研究候选体验；
- 因无障碍或安全证据不足而必须返回的空路线。

五套英文样例位于 `samples/`。

## 当前商业状态

当前数据库中的体验均为 `research_candidate`。因为实走、供应商七项准入、英语口试、价格与取消规则尚未全部通过：

- 可以生成研究版路线草案；
- 可以出售独立的深度路书或人工咨询；
- 不得把测试价作为正式报价；
- 不得收取体验款；
- 不得承诺导游、场地或档期可用。

`commercial.mayTakePayment` 只表示**体验**能否收款。付费深度路书使用单独的 `commercial.digitalRoadbook`：只有最高优先级的行程和安全信息已确认、并且人工复核范围后，才可收取数字路书费用；这项权限永远不涵盖导游、餐饮、场馆、交通、门票或体验款。

产品档位、下单信息、交付边界和收入测试指标见 [重庆付费深度路书产品与交付标准 V1.0](../chongqing-agent-database-20260729/重庆付费深度路书产品与交付标准_V1.0.md)。

## 回归测试

`fixtures/regression-cases.mjs` 保存 60 个真实对话型案例，覆盖首访、复游、亲子、行动能力、轮椅、孕期、过敏、清真、商业拍摄、无人机、夜间安全、天气、动态开放、购买信号、供应商准入，以及1—4日短行程跨默认日装配。

每次修改数据库字段、排序权重、硬过滤或商业规则后，必须运行：

```bash
npm test
npm run regression
```

机器通过只证明规则按预期执行，不代替重庆实走、官方动态复核和供应商尽调。

## 现场实走回填与放行

`field-records/RUN001.example.json` 是19次实走的可复制回填格式；每一条记录都必须有真实的日期、测试人、天气/人流、路线事实和至少两项证据。它不是演示数据，更不能用示例文本充当通过证据。

```bash
node bin/validate-field-record.mjs /absolute/path/RUN001.json
node bin/field-progress.mjs /absolute/path/to/field-records
```

现场记录只有 `pass` 才能完成对应首发核验；`conditional_pass`、`fail` 和 `incomplete` 都会继续阻止体验放行。即使所有实走通过，三个体验仍必须等待对应供应商的七项准入全部通过，才可以进入可销售状态。

现场执行顺序、供应商准入和放行规则见 [重庆首发现场运营与放行包 V1.0](../chongqing-agent-database-20260729/重庆首发现场运营与放行包_V1.0.md)。
