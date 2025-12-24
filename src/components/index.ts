// Components
export { ChangelogDisplay } from './ChangelogDisplay';
export type { } from './ChangelogDisplay';

// Re-export utilities for convenience
export {
  parseChangelog,
  getLatestVersion,
  getUnreleasedVersion,
  hasChanges,
  getChangeCount,
  versionToMarkdown,
} from '../utils/changelogParser';

console.log('ChangelogDisplay', ChangelogDisplay);
export type { ChangelogVersion, ParsedChangelog } from '../utils/changelogParser';

