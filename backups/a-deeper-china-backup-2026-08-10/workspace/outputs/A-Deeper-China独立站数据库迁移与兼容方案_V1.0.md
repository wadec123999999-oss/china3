# A Deeper China｜独立站数据库迁移与兼容方案 V1.0

日期：2026-08-03  
状态：设计阶段；不执行迁移、不删除旧表

## 1. 原则

旧项目的 `experts`、`bookings`、`expert_availability` 和 `reviews` 表必须保留，不能因为产品改版直接删除或重命名。新产品与旧产品并行一段时间，前端先切换公开入口，数据层采用新增表和兼容视图。

目标是：

- 不丢失旧数据；
- 不让新前端读取旧专家撮合数据；
- 支持匿名用户先提交 brief；
- 支持一份路书多次版本化；
- 支持人工复核证据、复核日期和失效时间；
- 将来仍可恢复在地体验功能，但不提前把它混入首发流程。

## 2. 新数据对象

### `travel_briefs`

保存客户主动提交的旅行需求，不保存不必要的聊天全文。

建议字段：

```text
id uuid primary key
owner_id uuid nullable references profiles(id)
anonymous_id text nullable
locale text not null default 'en'
status text check (draft, ready_for_direction, direction_generated,
                   human_check_requested, roadbook_delivered, archived)
raw_prompt text
city_slugs text[]
arrival_date date nullable
departure_date date nullable
night_count integer nullable
party jsonb
preferences jsonb
avoidances jsonb
constraints jsonb
created_at timestamptz
updated_at timestamptz
```

`raw_prompt` 是客户明确同意保存后的原话；未提交的草稿优先留在浏览器，不写入数据库。

### `route_directions`

保存路线方向的版本，而不是覆盖原始 brief。

建议字段：

```text
id uuid primary key
brief_id uuid not null references travel_briefs(id)
version integer not null
status text check (research_draft, superseded)
recommendation jsonb not null
assumptions jsonb not null default '{}'
tradeoffs jsonb not null default '{}'
fallback_logic jsonb not null default '{}'
warnings text[] not null default '{}'
generated_by text not null
created_at timestamptz
```

## 3. `roadbooks`

保存客户可读路书，不直接暴露城市数据库原始 JSON。

建议字段：

```text
id uuid primary key
brief_id uuid not null references travel_briefs(id)
version integer not null
status text check (research_draft, human_check_requested,
                   human_checked_ready, delivered, superseded)
title text not null
content_markdown text not null
content_json jsonb not null default '{}'
city_slugs text[] not null
reviewed_at timestamptz nullable
review_expires_at timestamptz nullable
delivery_notes text[] not null default '{}'
created_at timestamptz
updated_at timestamptz
```

关键规则：

- `research_draft` 不能显示为已核验；
- `human_checked_ready` 必须对应一条真实审核记录；
- `delivered` 只是交付状态，不代表保证结果；
- 新版本不得覆盖旧版本，便于追踪客户看到的内容。

## 4. `human_checks`

保存人工审核闸门的输入、结论和证据引用。

建议字段：

```text
id uuid primary key
roadbook_id uuid not null references roadbooks(id)
reviewer_id uuid nullable references profiles(id)
status text check (queued, in_review, passed, needs_changes, expired)
scope jsonb not null
checked_at timestamptz nullable
expires_at timestamptz nullable
evidence_refs jsonb not null default '[]'
risks text[] not null default '{}'
customer_actions text[] not null default '{}'
notes text
created_at timestamptz
updated_at timestamptz
```

发布条件：`status = passed`、`checked_at` 已填、`scope` 与客户日期匹配、没有未处理的 P0/P1 风险。

## 5. `feedback_events`

记录客户反馈和路线修订，不把所有聊天内容永久当作画像。

建议字段：

```text
id uuid primary key
brief_id uuid references travel_briefs(id)
roadbook_id uuid references roadbooks(id)
event_type text
rating integer nullable
reason text nullable
notes text nullable
consent_to_follow_up boolean not null default false
created_at timestamptz
```

## 6. 旧表兼容策略

| 旧表 | 处理方式 | 首发前端是否读取 |
|---|---|---|
| `profiles` | 保留；将角色扩展时新增枚举，不改已有用户 | 只用于登录/拥有者 |
| `experts` | 保留；停止作为路线方向的检索源 | 否 |
| `expert_availability` | 保留；不再出现在首发导航 | 否 |
| `conversations` | 保留；新 brief 可通过 `conversation_id` 关联 | 仅迁移兼容 |
| `bookings` | 保留历史记录；暂不创建新订单 | 否 |
| `reviews` | 保留历史评价；不在首发产品页展示为交易证明 | 后置 |
| `audit_log` | 继续使用；新增 brief/roadbook/human_check 事件 | 是，内部使用 |

不要执行：

- `drop table`；
- 直接把 `experts` 改名为 `destinations`；
- 用旧 `bookings` 表存路书订单；
- 用 `mockExperts` 填充真实客户输出；
- 把来源记录和审核备注放进公开 Supabase 查询。

## 7. RLS 与权限边界

### 客户

- 只能读取自己的 `travel_briefs`、`route_directions`、`roadbooks` 和 `feedback_events`；
- 匿名 brief 通过不可猜测的 token 或服务端会话访问；
- 不能读取 `human_checks.evidence_refs` 中的内部联系方式和隐私字段。

### 审核人员

- 只能通过受保护的服务端接口读取待审任务；
- 可以写 `human_checks` 和发布状态；
- 不直接向浏览器发送原始数据库。

### 管理员

- 可以访问审核队列和审计日志；
- 所有发布、撤回、修改动作写入 `audit_log`。

## 8. 接口迁移顺序

1. 新增 `POST /api/briefs`，接收客户确认后的 brief；
2. 将 `/api/route-direction` 改为读取城市路由器，不再查 `experts`；
3. 新增 `POST /api/roadbooks/draft` 或复用 `/api/dispatch-runtime`；
4. 新增 `POST /api/human-checks`，只创建审核队列；
5. 新增受保护的 `GET /api/roadbooks/:id`；
6. 最后才考虑支付与账户。

## 9. 上线前验证

- 在本地 Supabase 分支数据库执行迁移；
- 用匿名用户、登录用户、审核人员各做一次 RLS 测试；
- 验证旧 `bookings` 和 `experts` 数据只读且未改变；
- 验证路书版本不会覆盖旧版本；
- 验证没有人工审核记录时不能显示 `human_checked_ready`；
- 验证 API 不返回原始来源和供应商字段；
- 通过 typecheck、test、build 后才进入 Vercel Preview。

## 10. 当前决策

数据库不需要重做；需要在旧表旁边新增“brief—路线方向—路书—人工复核—反馈”这条产品链。这样网站前台可以彻底换成新的商业模型，同时保留过去项目的数据和将来恢复体验业务的可能性。

