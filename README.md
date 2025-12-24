# App Log - CHANGELOG 自动化方案

一套完整的 CHANGELOG 自动生成、管理和展示方案，基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) 规范。

## 特性

- 📝 **标准化格式**: 基于 Keep a Changelog 规范
- 🤖 **自动生成**: 通过 GitHub Actions + release-drafter 自动收集 PR 信息
- 🏷️ **Label 分类**: 使用 PR Labels 自动分类变更类型
- 🎨 **React 组件**: 美观的前端展示组件，支持深色模式
- ✏️ **可编辑**: 随时可手动编辑润色 CHANGELOG 内容

## 快速开始

### 1. 设置 GitHub Labels

参考 [.github/LABELS_SETUP.md](.github/LABELS_SETUP.md) 创建所需的 Labels。

使用 GitHub CLI 快速创建：

```bash
gh label create "changelog:added" --color "0E8A16" --description "新增功能"
gh label create "changelog:changed" --color "1D76DB" --description "功能变更"
gh label create "changelog:fixed" --color "FBCA04" --description "Bug 修复"
gh label create "changelog:removed" --color "B60205" --description "移除功能"
gh label create "changelog:skip" --color "EEEEEE" --description "不记录"
gh label create "changelog:deprecated" --color "FF0012" --description "Deprecated"
```

### 2. 安装前端依赖

```bash
npm install react-markdown
# 或
yarn add react-markdown
```

### 3. 使用 React 组件展示 CHANGELOG

```tsx
import { ChangelogDisplay } from './src/components/ChangelogDisplay';

function App() {
  return (
    <ChangelogDisplay 
      changelogUrl="/CHANGELOG.md"
      versionsToShow={1}
      title="最新更新"
    />
  );
}
```

## 工作流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   创建 PR       │────▶│   添加 Label    │────▶│   Merge 到 main │
│                 │     │ changelog:added │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  前端展示更新   │◀────│ 更新 CHANGELOG  │◀────│ 生成 Draft      │
│                 │     │                 │     │ Release         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 详细流程

1. **开发阶段**
   - 创建 PR 时添加对应的 changelog label（如 `changelog:added`）
   - PR 模板会提醒你选择合适的 label

2. **自动收集**
   - 每次 PR 合并到 main，release-drafter 自动更新 Draft Release
   - 根据 label 自动分类到 Added/Changed/Fixed 等区域

3. **发布版本**
   - 在 GitHub Releases 中编辑 Draft Release，确认内容后发布
   - 发布时自动触发 Action 更新 CHANGELOG.md

4. **前端展示**
   - 使用 `ChangelogDisplay` 组件读取并展示最新版本

## 文件结构

```
.
├── CHANGELOG.md                          # 主 changelog 文件
├── README.md                             # 本文档
├── .github/
│   ├── labels.yml                        # Labels 配置
│   ├── LABELS_SETUP.md                   # Labels 设置指南
│   ├── release-drafter.yml               # release-drafter 配置
│   ├── pull_request_template.md          # PR 模板
│   └── workflows/
│       ├── release-drafter.yml           # 收集 PR 信息的 Action
│       └── update-changelog.yml          # 发布时更新 CHANGELOG 的 Action
└── src/
    ├── index.ts                          # 主入口
    ├── components/
    │   ├── ChangelogDisplay.tsx          # CHANGELOG 展示组件
    │   ├── ChangelogDisplay.css          # 组件样式
    │   └── index.ts                      # 组件导出
    ├── utils/
    │   └── changelogParser.ts            # CHANGELOG 解析工具
    └── examples/
        └── ChangelogExample.tsx          # 使用示例
```

## 组件 API

### ChangelogDisplay

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `changelogUrl` | `string` | `'/CHANGELOG.md'` | CHANGELOG 文件的 URL |
| `changelogContent` | `string` | - | 直接传入 CHANGELOG 内容 |
| `versionsToShow` | `number` | `1` | 显示的版本数量 |
| `showUnreleased` | `boolean` | `false` | 是否显示 Unreleased 区域 |
| `showAll` | `boolean` | `false` | 是否显示全部版本 |
| `title` | `string` | `'更新日志'` | 标题文本 |
| `className` | `string` | `''` | 自定义类名 |

### 使用示例

```tsx
// 显示最新版本
<ChangelogDisplay changelogUrl="/CHANGELOG.md" />

// 显示最近 3 个版本
<ChangelogDisplay versionsToShow={3} />

// 从 GitHub 获取
<ChangelogDisplay changelogUrl="https://raw.githubusercontent.com/org/repo/main/CHANGELOG.md" />

// 显示全部（包括未发布的）
<ChangelogDisplay showAll showUnreleased />
```

## Labels 说明

| Label | 分类 | 何时使用 |
|-------|-----|---------|
| `changelog:added` | Added | 新增功能 |
| `changelog:changed` | Changed | 修改现有功能 |
| `changelog:deprecated` | Deprecated | 即将废弃的功能 |
| `changelog:removed` | Removed | 已移除的功能 |
| `changelog:fixed` | Fixed | Bug 修复 |
| `changelog:security` | Security | 安全相关修复 |
| `changelog:skip` | - | 不记录到 CHANGELOG |

## 手动编辑

CHANGELOG.md 是纯文本文件，你可以随时直接编辑：

- 润色变更描述
- 修正分类
- 合并相关条目
- 添加更多上下文

建议在发布前 review Draft Release 内容，确保描述清晰准确。

## 参考

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/)
- [release-drafter](https://github.com/release-drafter/release-drafter)

