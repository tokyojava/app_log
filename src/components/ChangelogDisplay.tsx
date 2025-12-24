import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { parseChangelog, ChangelogVersion } from '../utils/changelogParser';
import './ChangelogDisplay.css';

interface ChangelogDisplayProps {
  /** CHANGELOG.md 文件的路径或 URL */
  changelogUrl?: string;
  /** 直接传入 CHANGELOG 内容（优先级高于 url） */
  changelogContent?: string;
  /** 显示的版本数量，默认为 1（只显示最新版本） */
  versionsToShow?: number;
  /** 是否显示 Unreleased 区域 */
  showUnreleased?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标题 */
  title?: string;
  /** 是否显示完整的 changelog（展开所有版本） */
  showAll?: boolean;
}

/**
 * CHANGELOG 展示组件
 * 解析 CHANGELOG.md 并以美观的方式展示最新更新
 */
export const ChangelogDisplay: React.FC<ChangelogDisplayProps> = ({
  changelogUrl = '/CHANGELOG.md',
  changelogContent,
  versionsToShow = 1,
  showUnreleased = false,
  className = '',
  title = '更新日志',
  showAll = false,
}) => {
  const [rawContent, setRawContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  // 获取 CHANGELOG 内容
  useEffect(() => {
    if (changelogContent) {
      setRawContent(changelogContent);
      setLoading(false);
      return;
    }

    const fetchChangelog = async () => {
      try {
        setLoading(true);
        const response = await fetch(changelogUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch changelog: ${response.status}`);
        }
        const text = await response.text();
        setRawContent(text);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load changelog');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [changelogUrl, changelogContent]);

  // 解析 CHANGELOG
  const versions = useMemo(() => {
    if (!rawContent) return [];
    return parseChangelog(rawContent);
  }, [rawContent]);

  // 过滤要显示的版本
  const displayVersions = useMemo(() => {
    let filtered = versions;
    
    // 过滤 Unreleased
    if (!showUnreleased) {
      filtered = filtered.filter(v => v.version !== 'Unreleased');
    }
    
    // 限制显示数量
    if (!showAll && versionsToShow > 0) {
      filtered = filtered.slice(0, versionsToShow);
    }
    
    return filtered;
  }, [versions, showUnreleased, versionsToShow, showAll]);

  // 切换版本展开/收起
  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className={`changelog-display changelog-loading ${className}`}>
        <div className="changelog-spinner" />
        <span>加载更新日志...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`changelog-display changelog-error ${className}`}>
        <span>⚠️ {error}</span>
      </div>
    );
  }

  if (displayVersions.length === 0) {
    return (
      <div className={`changelog-display changelog-empty ${className}`}>
        <span>暂无更新记录</span>
      </div>
    );
  }

  return (
    <div className={`changelog-display ${className}`}>
      {title && <h2 className="changelog-title">{title}</h2>}
      
      <div className="changelog-versions">
        {displayVersions.map((version, index) => (
          <VersionCard
            key={version.version}
            version={version}
            isLatest={index === 0 && version.version !== 'Unreleased'}
            isExpanded={showAll || index === 0 || expandedVersions.has(version.version)}
            onToggle={() => toggleVersion(version.version)}
          />
        ))}
      </div>

      {!showAll && versions.length > versionsToShow && (
        <button 
          className="changelog-show-more"
          onClick={() => setExpandedVersions(new Set(versions.map(v => v.version)))}
        >
          查看更多版本 ({versions.length - versionsToShow} 个)
        </button>
      )}
    </div>
  );
};

// 单个版本卡片组件
interface VersionCardProps {
  version: ChangelogVersion;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const VersionCard: React.FC<VersionCardProps> = ({
  version,
  isLatest,
  isExpanded,
  onToggle,
}) => {
  const categoryIcons: Record<string, string> = {
    Added: '🚀',
    Changed: '🔄',
    Deprecated: '⚠️',
    Removed: '🗑️',
    Fixed: '🐛',
    Security: '🔒',
  };

  const categoryLabels: Record<string, string> = {
    Added: '新增',
    Changed: '变更',
    Deprecated: '废弃',
    Removed: '移除',
    Fixed: '修复',
    Security: '安全',
  };

  return (
    <div className={`changelog-version ${isLatest ? 'changelog-version-latest' : ''}`}>
      <div className="changelog-version-header" onClick={onToggle}>
        <div className="changelog-version-info">
          <span className="changelog-version-number">
            {version.version === 'Unreleased' ? '开发中' : `v${version.version}`}
          </span>
          {version.date && (
            <span className="changelog-version-date">{version.date}</span>
          )}
          {isLatest && <span className="changelog-version-badge">最新</span>}
        </div>
        <span className={`changelog-toggle ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="changelog-version-content">
          {Object.entries(version.categories).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category} className="changelog-category">
                <h4 className="changelog-category-title">
                  <span className="changelog-category-icon">
                    {categoryIcons[category] || '📝'}
                  </span>
                  {categoryLabels[category] || category}
                </h4>
                <ul className="changelog-items">
                  {items.map((item, index) => (
                    <li key={index} className="changelog-item">
                      <ReactMarkdown
                        components={{
                          // 自定义链接在新标签页打开
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {item}
                      </ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChangelogDisplay;

