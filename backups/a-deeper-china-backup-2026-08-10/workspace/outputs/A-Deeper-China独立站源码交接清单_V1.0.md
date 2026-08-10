# A Deeper China｜独立站源码交接清单 V1.0

生成日期：2026-08-03  
检查目录：`/Users/apple/Desktop/china-insider`  
检查方式：只读；未复制、删除或修改源码

## 1. 当前副本概况

- 排除 `node_modules` 和 `.next` 后文件数：121
- 排除构建缓存后的源码体积：约 2.22 MB
- 根目录包含：`app`、`components`、`lib`、`public`、`scripts`、`supabase`、`tests`
- 根目录没有发现 `.git` 目录
- 根目录没有发现 `.vercel` 目录
- 存在 `.env.local`，未读取其内容，也未复制其中的秘密
- 根目录另有一个嵌套的 `china-insider/` 副本，需在确认时说明哪一个才是源目录

## 2. 关键文件 SHA-256 指纹

这些指纹用于以后确认“当前源码是否被修改”或“是否与备份/仓库一致”，不是部署凭证。

| 文件 | SHA-256 |
|---|---|
| `package.json` | `48c81943ccb782fb6ec7a7b03b57b34dcd1758742f62ecf41ad7bf1a9546669d` |
| `pnpm-lock.yaml` | `4a149aebacf6a9b5b62d05d843f65bb953d8fc83cd406ab9145f316e107fb174` |
| `app/page.tsx` | `155ce81f8feaa3d35edbb596ab3019b1564fe521a2b7acbf8b1cf76efd618008` |
| `app/layout.tsx` | `e6882db3216ad131e0d7daffbf21d610d01ba994f3ce98d3cb6d5c021e8d36a1` |
| `app/api/chat/route.ts` | `87569acfdb888603a0f857a55dcec21fc3abd9330835b9b5be58870bed63adbb` |
| `components/marketing/chat-concierge-client.tsx` | `5b161902e11d7d51a178ed521fdad0b9269f3f30ea10673718e99a2265f88e47` |
| `supabase/migrations/0001_init.sql` | `52773493db52aa84bd525f3cfe25b4a5980fe916ea1dd3577d53470b98eb024c` |

## 3. 交接时必须确认

1. 顶层 `/Users/apple/Desktop/china-insider` 与嵌套 `/Users/apple/Desktop/china-insider/china-insider/` 哪一个是源目录；
2. 是否有未显示在本机的 GitHub/Git 仓库；
3. Vercel 项目的连接仓库、分支和环境分别是什么；
4. `.env.local` 是否只用于本地开发，线上环境变量是否在 Vercel 单独维护；
5. 旧 Supabase 项目是否已产生真实用户、专家或订单数据。

## 3.1 两个副本的只读比较

顶层副本不是嵌套副本的完全重复：

- 顶层有 `app/api/realtime` 和 `app/api/voice`，嵌套副本没有；
- 顶层 `package.json` 多出 `ws` 和 `@types/ws`；
- 顶层 `app/api/chat/route.ts`、`app/chat/page.tsx` 和聊天客户端包含更晚的专家匹配、语音和路线书逻辑；
- 顶层有效文件约 121 个，嵌套副本约 57 个；
- 文件时间也显示顶层副本更新（2026 年 4 月 24 日）而嵌套副本主要停留在 4 月 22–23 日。

因此，**顶层副本是更可能的工作副本**，但这仍不能证明它就是线上 Vercel 的部署源。

## 4. 安全结论

当前没有执行任何会改变网站状态的动作。没有初始化 Git、没有移动目录、没有复制 `.env.local`、没有运行部署命令。等源目录和部署关系确认后，再建立备份/分支，避免误改历史副本。
