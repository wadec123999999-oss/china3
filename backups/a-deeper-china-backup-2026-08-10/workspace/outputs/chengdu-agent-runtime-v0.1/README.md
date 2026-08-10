# 成都智能体运行时 V0.1

这是 A Deeper China 的成都城市底库调用层。它把客户信号映射为模块、点位、追问与安全边界，并生成仅供人工审核的英文路书草稿。

## 使用

在本目录运行：

    npm run validate
    npm test
    npm run roadbook

样例输出位于 samples/first-time-3-day.md。

## 当前边界

数据库是内容基础，不是现场或供应商认证。任何客户路书交付前都必须使用同目录外的《成都人工审核数字路书放行清单 V0.1》逐项复核。
