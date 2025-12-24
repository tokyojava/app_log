/**
 * CHANGELOG 展示组件使用示例
 */
import React from 'react';
import { ChangelogDisplay } from '../components/ChangelogDisplay';

/**
 * 示例 1: 基础用法 - 显示最新版本
 */
export const BasicExample: React.FC = () => {
  return (
    <ChangelogDisplay 
      changelogUrl="/CHANGELOG.md"
      title="最新更新"
    />
  );
};


/**
 * 示例 2: 显示多个版本
 */
export const MultipleVersionsExample: React.FC = () => {
  return (
    <ChangelogDisplay 
      changelogUrl="/CHANGELOG.md"
      versionsToShow={3}
      title="版本历史"
    />
  );
};

/**
 * 示例 3: 显示所有版本（包括 Unreleased）
 */
export const FullChangelogExample: React.FC = () => {
  return (
    <ChangelogDisplay 
      changelogUrl="/CHANGELOG.md"
      showAll={true}
      showUnreleased={true}
      title="完整更新日志"
    />
  );
};

/**
 * 示例 4: 从 GitHub 获取 CHANGELOG
 */
export const GitHubExample: React.FC = () => {
  // 从 GitHub raw 获取
  const githubUrl = 'https://raw.githubusercontent.com/your-org/your-repo/main/CHANGELOG.md';
  
  return (
    <ChangelogDisplay 
      changelogUrl={githubUrl}
      title="项目更新"
    />
  );
};

/**
 * 示例 5: 直接传入 CHANGELOG 内容
 */
export const InlineContentExample: React.FC = () => {
  const changelogContent = `
# Changelog

## [1.2.0] - 2024-01-15

### Added
- 新增用户头像上传功能
- 支持暗黑模式

### Fixed
- 修复登录页面样式问题

## [1.1.0] - 2024-01-01

### Added
- 新增数据导出功能

### Changed
- 优化搜索性能
`;

  return (
    <ChangelogDisplay 
      changelogContent={changelogContent}
      title="更新日志"
    />
  );
};

/**
 * 示例 6: 在 Modal 中展示
 */
export const ModalExample: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          margin: '20px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <ChangelogDisplay 
          changelogUrl="/CHANGELOG.md"
          versionsToShow={2}
          title="🎉 新功能发布"
        />
      </div>
    </div>
  );
};

/**
 * 示例 7: 配合 "What's New" 按钮使用
 */
export const WhatsNewButton: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        🆕 新功能
      </button>
      <ModalExample isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

