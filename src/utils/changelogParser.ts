/**
 * CHANGELOG.md 解析工具
 * 将 Keep a Changelog 格式的 markdown 解析为结构化数据
 */

export interface ChangelogVersion {
  version: string;
  date: string | null;
  categories: {
    Added: string[];
    Changed: string[];
    Deprecated: string[];
    Removed: string[];
    Fixed: string[];
    Security: string[];
  };
  rawContent: string;
}

export interface ParsedChangelog {
  versions: ChangelogVersion[];
  rawContent: string;
}

/**
 * 解析 CHANGELOG.md 内容
 * @param content CHANGELOG.md 的原始文本内容
 * @returns 解析后的版本列表
 */
export function parseChangelog(content: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];
  
  // 匹配版本标题: ## [版本号] - 日期 或 ## [Unreleased]
  const versionRegex = /^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/gm;
  
  // 分割内容为版本块
  const versionMatches: Array<{
    version: string;
    date: string | null;
    startIndex: number;
  }> = [];

  let match;
  while ((match = versionRegex.exec(content)) !== null) {
    versionMatches.push({
      version: match[1],
      date: match[2] || null,
      startIndex: match.index,
    });
  }

  // 解析每个版本的内容
  for (let i = 0; i < versionMatches.length; i++) {
    const current = versionMatches[i];
    const nextStart = versionMatches[i + 1]?.startIndex ?? content.length;
    const versionContent = content.slice(current.startIndex, nextStart);

    const version: ChangelogVersion = {
      version: current.version,
      date: current.date,
      categories: {
        Added: [],
        Changed: [],
        Deprecated: [],
        Removed: [],
        Fixed: [],
        Security: [],
      },
      rawContent: versionContent,
    };

    // 解析分类
    const categoryNames = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'] as const;
    
    for (const categoryName of categoryNames) {
      const categoryRegex = new RegExp(
        `### ${categoryName}\\s*\\n([\\s\\S]*?)(?=### |## \\[|$)`,
        'i'
      );
      const categoryMatch = versionContent.match(categoryRegex);
      
      if (categoryMatch) {
        const items = parseCategoryItems(categoryMatch[1]);
        version.categories[categoryName] = items;
      }
    }

    versions.push(version);
  }

  return versions;
}

/**
 * 解析分类下的条目列表
 * @param content 分类内容
 * @returns 条目数组
 */
function parseCategoryItems(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');
  let currentItem = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过空行
    if (!trimmedLine) {
      if (currentItem) {
        items.push(currentItem.trim());
        currentItem = '';
      }
      continue;
    }

    // 新条目（以 - 开头）
    if (trimmedLine.startsWith('- ')) {
      if (currentItem) {
        items.push(currentItem.trim());
      }
      currentItem = trimmedLine.slice(2);
    } 
    // 多行条目的续行
    else if (currentItem && !trimmedLine.startsWith('#')) {
      currentItem += ' ' + trimmedLine;
    }
  }

  // 添加最后一个条目
  if (currentItem) {
    items.push(currentItem.trim());
  }

  return items;
}

/**
 * 获取最新版本（排除 Unreleased）
 * @param versions 版本列表
 * @returns 最新版本或 null
 */
export function getLatestVersion(versions: ChangelogVersion[]): ChangelogVersion | null {
  return versions.find(v => v.version !== 'Unreleased') || null;
}

/**
 * 获取 Unreleased 版本的变更
 * @param versions 版本列表
 * @returns Unreleased 版本或 null
 */
export function getUnreleasedVersion(versions: ChangelogVersion[]): ChangelogVersion | null {
  return versions.find(v => v.version === 'Unreleased') || null;
}

/**
 * 检查版本是否有任何变更
 * @param version 版本对象
 * @returns 是否有变更
 */
export function hasChanges(version: ChangelogVersion): boolean {
  return Object.values(version.categories).some(items => items.length > 0);
}

/**
 * 获取版本的变更总数
 * @param version 版本对象
 * @returns 变更条目总数
 */
export function getChangeCount(version: ChangelogVersion): number {
  return Object.values(version.categories).reduce((sum, items) => sum + items.length, 0);
}

/**
 * 将版本对象转换回 markdown 格式
 * @param version 版本对象
 * @returns markdown 字符串
 */
export function versionToMarkdown(version: ChangelogVersion): string {
  let markdown = `## [${version.version}]`;
  if (version.date) {
    markdown += ` - ${version.date}`;
  }
  markdown += '\n\n';

  const categoryOrder = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'] as const;
  
  for (const category of categoryOrder) {
    const items = version.categories[category];
    if (items.length > 0) {
      markdown += `### ${category}\n\n`;
      for (const item of items) {
        markdown += `- ${item}\n`;
      }
      markdown += '\n';
    }
  }

  return markdown;
}

