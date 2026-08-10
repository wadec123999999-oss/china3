# 深圳智能体运行时 V0.1

运行时现在读取数据库包中的 `深圳决策字段_V1.0.json` 和 `深圳点位决策字段_V1.0.json`，将科技问题、市场/IP/隐私边界、停止条件和替代分支接入英文路书。它不授予工厂、园区、供应商或企业访问权限。

```bash
npm run validate:decision-layer
```

将深圳数据库中的客户信号映射为科技观察模块、点位、追问、拒绝/分流规则和英文路书草稿。

运行：

    npm run validate
    npm run regression
    npm test
    npm run roadbook

这是内容基础，不是企业访问、采购撮合或供应商认证系统。客户路书必须通过同目录外的《深圳人工审核数字路书放行清单 V0.1》。
