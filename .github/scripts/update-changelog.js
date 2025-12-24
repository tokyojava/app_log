/**
 * 更新 CHANGELOG.md 脚本
 * 将 GitHub Release 内容转换为 Keep a Changelog 格式并更新 CHANGELOG.md
 * 
 * 环境变量:
 *   RELEASE_TAG_NAME - Release 的 tag 名称 (如 v1.0.0)
 *   RELEASE_BODY - Release 的内容
 */

const fs = require('fs');

// 从环境变量获取 release 信息
const tagName = process.env.RELEASE_TAG_NAME || '';
const releaseBody = process.env.RELEASE_BODY || '';

if (!tagName) {
  console.error('Error: RELEASE_TAG_NAME environment variable is required');
  process.exit(1);
}

const version = tagName.replace('v', '');
const date = new Date().toISOString().split('T')[0];

/**
 * 将 release-drafter 生成的 release notes 转换为 CHANGELOG 格式
 * @param {string} releaseBody - Release 的内容
 * @returns {string} CHANGELOG 格式的内容
 */
function convertToChangelog(releaseBody) {
  let changelog = '';
  
  // release-drafter 生成的 emoji 标题 -> Keep a Changelog 分类
  const sections = {
    '🚀 New Features': 'Added',
    '🔄 Changes': 'Changed',
    '⚠️ Deprecated': 'Deprecated',
    '🗑️ Removed': 'Removed',
    '🐛 Bug Fixes': 'Fixed',
    '🔒 Security': 'Security'
  };
  
  let currentSection = null;
  const lines = releaseBody.split('\n');
  
  for (const line of lines) {
    // 检查是否是分类标题
    for (const [emoji, section] of Object.entries(sections)) {
      if (line.includes(emoji)) {
        currentSection = section;
        changelog += `\n### ${section}\n\n`;
        break;
      }
    }
    
    // 如果是变更条目（以 - 开头）
    if (line.trim().startsWith('-') && currentSection) {
      changelog += line + '\n';
    }
  }
  
  return changelog || `\n- Release ${version}\n`;
}

/**
 * 更新 CHANGELOG.md 文件
 */
function updateChangelog() {
  const changelogPath = 'CHANGELOG.md';
  
  // 检查文件是否存在
  if (!fs.existsSync(changelogPath)) {
    console.error(`Error: ${changelogPath} not found`);
    process.exit(1);
  }
  
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  
  // 生成新版本内容
  const newVersionContent = `## [${version}] - ${date}\n${convertToChangelog(releaseBody)}`;
  
  // 清空 Unreleased 区域的内容，并添加新版本
  const unreleasedRegex = /(## \[Unreleased\][\s\S]*?)(### Added[\s\S]*?)(## \[|$)/;
  const emptyUnreleased = `## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n### Removed\n\n`;
  
  if (changelog.match(unreleasedRegex)) {
    changelog = changelog.replace(
      unreleasedRegex,
      `${emptyUnreleased}${newVersionContent}\n\n$3`
    );
  } else {
    // 如果没有找到标准格式，在 Unreleased 后插入
    const insertPoint = changelog.indexOf('## [Unreleased]');
    if (insertPoint !== -1) {
      const afterUnreleased = changelog.indexOf('\n## [', insertPoint + 1);
      if (afterUnreleased !== -1) {
        changelog = changelog.slice(0, afterUnreleased) + '\n\n' + newVersionContent + changelog.slice(afterUnreleased);
      } else {
        changelog += '\n\n' + newVersionContent;
      }
    } else {
      // 如果连 Unreleased 都没有，直接追加到文件末尾
      changelog += '\n\n' + newVersionContent;
    }
  }
  
  // 写入更新后的 CHANGELOG
  fs.writeFileSync(changelogPath, changelog);
  console.log(`✅ CHANGELOG.md updated with version ${version}`);
  console.log(`   Date: ${date}`);
}

// 执行更新
updateChangelog();

