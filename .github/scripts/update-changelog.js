/**
 * 更新 CHANGELOG.md 脚本
 * 将 GitHub Release 内容转换为 Keep a Changelog 格式并更新 CHANGELOG.md
 * 
 * 环境变量:
 *   RELEASE_TAG_NAME - Release 的 tag 名称 (如 v1.0.0)
 *   RELEASE_BODY - Release 的内容 (包含累积的多个 PR)
 * 
 * 工作原理:
 *   1. 解析 release-drafter 生成的 release body
 *   2. 将 emoji 分类标题转换为 Keep a Changelog 格式
 *   3. 提取所有变更条目（可能来自多个 PR）
 *   4. 更新 CHANGELOG.md，将新版本插入到 Unreleased 之后
 */

const fs = require('fs');

// 从环境变量获取 release 信息
const tagName = process.env.RELEASE_TAG_NAME || '';
const releaseBody = process.env.RELEASE_BODY || '';

if (!tagName) {
  console.error('❌ Error: RELEASE_TAG_NAME environment variable is required');
  process.exit(1);
}

const version = tagName.replace(/^v/, '');
const date = new Date().toISOString().split('T')[0];

// release-drafter 生成的分类标题（用文字匹配，不用 emoji）
const SECTION_KEYWORDS = [
  '🚀 New Features',
  '🔄 Changes',
  '⚠️ Deprecated',
  '🗑️ Removed',
  '🐛 Bug Fixes',
  '🔒 Security'
];

/**
 * 将 release-drafter 生成的 release notes 转换为 CHANGELOG 格式
 * @param {string} body - Release 的内容
 * @returns {{ changelog: string, stats: { total: number, bySection: Record<string, number> } }}
 */
function convertToChangelog(body) {
  const result = {
    changelog: '',
    stats: {
      total: 0,
      bySection: {}
    }
  };

  if (!body || !body.trim()) {
    result.changelog = `\n### New Features\n\n- Release ${version}\n`;
    result.stats.total = 1;
    return result;
  }

  let currentSection = null;
  let currentItem = null;
  const sections = {};

  // 初始化所有分类
  for (const section of SECTION_KEYWORDS) {
    sections[section] = [];
  }

  const lines = body.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 检查是否是分类标题（包含 New Features, Bug Fixes 等关键词）
    let isSectionHeader = false;
    for (const section of SECTION_KEYWORDS) {
      if (line.includes(section)) {
        // 保存之前的条目
        if (currentItem && currentSection) {
          sections[currentSection].push(currentItem);
          result.stats.total++;
        }
        currentSection = section;
        currentItem = null;
        isSectionHeader = true;
        break;
      }
    }
    if (isSectionHeader) continue;

    // 检查是否是变更条目标题（以 ### 开头）
    if (trimmedLine.startsWith('### ') && currentSection) {
      // 保存之前的条目
      if (currentItem) {
        sections[currentSection].push(currentItem);
        result.stats.total++;
      }
      // 开始新条目
      currentItem = {
        title: trimmedLine.replace(/^### /, ''),
        body: []
      };
      continue;
    }

    // 收集条目正文
    if (currentItem && trimmedLine) {
      currentItem.body.push(trimmedLine);
    }
  }

  // 保存最后一个条目
  if (currentItem && currentSection) {
    sections[currentSection].push(currentItem);
    result.stats.total++;
  }

  // 生成 changelog 内容，保持原有分类名称
  for (const section of SECTION_KEYWORDS) {
    const items = sections[section];
    if (items.length > 0) {
      result.changelog += `\n### ${section}\n\n`;
      for (const item of items) {
        result.changelog += `#### ${item.title}\n\n`;
        if (item.body.length > 0) {
          result.changelog += item.body.join('\n') + '\n\n';
        }
      }
      result.stats.bySection[section] = items.length;
    }
  }

  // 如果没有任何变更，添加默认条目
  if (result.stats.total === 0) {
    result.changelog = `\n### New Features\n\n- Release ${version}\n`;
    result.stats.total = 1;
  }

  return result;
}

/**
 * 更新 CHANGELOG.md 文件
 */
function updateChangelog() {
  const changelogPath = 'CHANGELOG.md';

  // 检查文件是否存在
  if (!fs.existsSync(changelogPath)) {
    console.error(`❌ Error: ${changelogPath} not found`);
    process.exit(1);
  }

  let changelog = fs.readFileSync(changelogPath, 'utf8');

  // 转换 release body 为 changelog 格式
  const { changelog: changelogContent, stats } = convertToChangelog(releaseBody);

  // 生成新版本内容
  const newVersionContent = `## [${version}] - ${date}\n${changelogContent}`;

  // 空的 Unreleased 区域
  const emptyUnreleased = `## [Unreleased]\n\n### New Features\n\n### Changes\n\n### Bug Fixes\n\n### Removed\n\n`;

  // 尝试多种模式匹配 Unreleased 区域
  let updated = false;

  // 模式 1: 标准格式 - Unreleased 区域后面有其他版本
  const pattern1 = /(## \[Unreleased\][\s\S]*?)(## \[\d)/;
  if (changelog.match(pattern1)) {
    changelog = changelog.replace(
      pattern1,
      `${emptyUnreleased}${newVersionContent}\n\n$2`
    );
    updated = true;
  }

  // 模式 2: Unreleased 是最后一个区域（首次发布）
  if (!updated) {
    const pattern2 = /(## \[Unreleased\][\s\S]*)$/;
    if (changelog.match(pattern2)) {
      changelog = changelog.replace(
        pattern2,
        `${emptyUnreleased}${newVersionContent}\n`
      );
      updated = true;
    }
  }

  // 模式 3: 没有 Unreleased 区域，追加到文件末尾
  if (!updated) {
    changelog += `\n\n${newVersionContent}`;
    updated = true;
  }

  // 写入更新后的 CHANGELOG
  fs.writeFileSync(changelogPath, changelog);

  // 输出统计信息
  console.log(`✅ CHANGELOG.md 已更新`);
  console.log(`   版本: ${version}`);
  console.log(`   日期: ${date}`);
  console.log(`   变更总数: ${stats.total} 条`);

  if (Object.keys(stats.bySection).length > 0) {
    console.log(`   分类统计:`);
    for (const [section, count] of Object.entries(stats.bySection)) {
      console.log(`     - ${section}: ${count} 条`);
    }
  }
}

// 执行更新
updateChangelog();
