# GitHub Labels 设置指南

## 快速设置 (使用 GitHub CLI)

确保已安装 [GitHub CLI](https://cli.github.com/)，然后在仓库根目录运行：

```bash
# 创建 Changelog 分类 Labels
gh label create "changelog:added" --color "0E8A16" --description "新增功能 - 会出现在 CHANGELOG 的 Added 分类"
gh label create "changelog:changed" --color "1D76DB" --description "功能变更 - 会出现在 CHANGELOG 的 Changed 分类"
gh label create "changelog:deprecated" --color "FEF2C0" --description "即将废弃 - 会出现在 CHANGELOG 的 Deprecated 分类"
gh label create "changelog:removed" --color "B60205" --description "移除功能 - 会出现在 CHANGELOG 的 Removed 分类"
gh label create "changelog:fixed" --color "FBCA04" --description "Bug 修复 - 会出现在 CHANGELOG 的 Fixed 分类"
gh label create "changelog:security" --color "D93F0B" --description "安全修复 - 会出现在 CHANGELOG 的 Security 分类"
gh label create "changelog:skip" --color "EEEEEE" --description "不记录到 CHANGELOG"

# 创建版本类型 Labels
gh label create "version:major" --color "B60205" --description "主版本更新 (breaking changes)"
gh label create "version:minor" --color "0E8A16" --description "次版本更新 (新功能)"
gh label create "version:patch" --color "FBCA04" --description "补丁版本更新 (bug 修复)"
```

## 手动设置

1. 进入 GitHub 仓库页面
2. 点击 **Issues** → **Labels**
3. 点击 **New label** 按钮
4. 按照 `labels.yml` 中的配置创建每个 label

## Label 使用规范

| Label | 何时使用 | 示例 |
|-------|---------|------|
| `changelog:added` | 新增功能、新 API | "新增用户导出功能" |
| `changelog:changed` | 修改现有功能行为 | "优化搜索算法性能" |
| `changelog:deprecated` | 标记即将移除的功能 | "废弃 v1 API" |
| `changelog:removed` | 移除功能 | "移除旧版登录页面" |
| `changelog:fixed` | 修复 bug | "修复登录失败问题" |
| `changelog:security` | 安全相关修复 | "修复 XSS 漏洞" |
| `changelog:skip` | 不需要记录的改动 | 文档更新、CI 配置 |

## 版本号递增规则

- `version:major`: 有破坏性变更时使用 (1.0.0 → 2.0.0)
- `version:minor`: 新增功能时使用 (1.0.0 → 1.1.0)  
- `version:patch`: 修复 bug 时使用 (1.0.0 → 1.0.1)

如果 PR 没有版本标签，默认按 `patch` 处理。

