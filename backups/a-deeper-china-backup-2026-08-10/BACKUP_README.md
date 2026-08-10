# A Deeper China 项目完整备份

- 备份日期：2026-08-10
- 原始工作区：`/Users/apple/Documents/旅游视频`
- 本地备份目录：`/Users/apple/Documents/A-Deeper-China-完整备份-20260810`
- 目的：保留数据库、前端、资料、素材、旧版前端和本地 Git 状态，防止后续清理或改版造成资料丢失。

## 备份内容

- `workspace/`：当前 A Deeper China 工作区的项目资料，包括正式数据库、13 城运行时、组合路由器、前端预览、路书样本、研究资料、设计方案和测试记录。
- `legacy/`：电脑中找到的旧版 China Insider 前端补丁、历史 Codex 迁移包和 A Deeper China 设计系统。
- `private-recovery-snapshots/`：原工作区中已有的恢复快照，仅保留在本地备份，不上传公开 GitHub。
- `git-state/`：原工作区和前端预览项目的 `.git` 状态，用于必要时恢复 Git 工作状态；不上传公开 GitHub。
- `MANIFEST.sha256`：全部备份文件的 SHA-256 校验清单。
- `FILE_LIST.txt`：备份文件列表。

## 明确排除

- `node_modules/`、`dist/`、`build/`、`.wrangler/`：可由依赖安装或构建重新生成。
- `tmp/`、`.qa/`、`.playwright-cli/`：临时渲染、测试缓存和浏览器运行状态。
- 工作区根目录的 `.git` 不进入公开上传包，但已复制到本地 `git-state/`。
- 证件、营业执照等与项目无关的临时材料不上传公开仓库。

## 恢复原则

1. 不删除原工作区。
2. 后续备份使用新的日期目录，不覆盖本目录。
3. GitHub 使用独立备份分支，不覆盖原 `main`。
4. 恢复前先核对 `MANIFEST.sha256`，再复制回工作目录。
