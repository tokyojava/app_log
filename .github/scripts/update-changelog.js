/**
 * Update CHANGELOG.md script
 * Extracts CodeRabbit summaries from release body and updates CHANGELOG.md
 * 
 * Environment variables:
 *   RELEASE_TAG_NAME - Release tag name (e.g., v1.0.0)
 *   RELEASE_BODY - Release body content (contains multiple PRs with CodeRabbit summaries)
 * 
 * How it works:
 *   1. Parse release body to find each PR section
 *   2. Extract CodeRabbit summary from each PR (between "## Summary by CodeRabbit" and "<sub>")
 *   3. Merge categories (Bug Fixes, New Features, etc.) from all PRs
 *   4. Update CHANGELOG.md with the merged content
 */

const fs = require('fs');

// Get release info from environment variables
const tagName = process.env.RELEASE_TAG_NAME || '';
const releaseBody = process.env.RELEASE_BODY || '';

if (!tagName) {
  console.error('❌ Error: RELEASE_TAG_NAME environment variable is required');
  process.exit(1);
}

const version = tagName.replace(/^v/, '');
const date = new Date().toISOString().split('T')[0];

// Category keywords to look for in CodeRabbit summary
const CATEGORY_KEYWORDS = [
  'Bug Fixes',
  'New Features',
  'Features',
  'Style',
  'Refactor',
  'Documentation',
  'Tests',
  'Chores',
  'Performance',
  'Security',
  'Breaking Changes',
  'Deprecated'
];

/**
 * Extract CodeRabbit summary from PR body
 * @param {string} prBody - PR body content
 * @returns {string} Extracted summary or empty string
 */
function extractCodeRabbitSummary(prBody) {
  if (!prBody) return '';
  
  // Find content between "## Summary by CodeRabbit" and "<sub>" or end
  const startMarker = '## Summary by CodeRabbit';
  const endMarker = '<sub>';
  
  const startIndex = prBody.indexOf(startMarker);
  if (startIndex === -1) return '';
  
  const contentStart = startIndex + startMarker.length;
  let endIndex = prBody.indexOf(endMarker, contentStart);
  
  if (endIndex === -1) {
    endIndex = prBody.length;
  }
  
  return prBody.slice(contentStart, endIndex).trim();
}

/**
 * Parse CodeRabbit summary into categories
 * @param {string} summary - CodeRabbit summary content
 * @returns {Record<string, string[]>} Categories with their items
 */
function parseSummaryCategories(summary) {
  const categories = {};
  
  if (!summary) return categories;
  
  let currentCategory = null;
  const lines = summary.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this line is a category header (e.g., "* **Bug Fixes**" or "### Bug Fixes")
    for (const keyword of CATEGORY_KEYWORDS) {
      // Match patterns like: * **Bug Fixes**, ### Bug Fixes, **Bug Fixes**
      const patterns = [
        new RegExp(`^\\*\\s*\\*\\*${keyword}\\*\\*`, 'i'),
        new RegExp(`^###?\\s*${keyword}`, 'i'),
        new RegExp(`^\\*\\*${keyword}\\*\\*`, 'i'),
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(trimmedLine)) {
          currentCategory = keyword;
          if (!categories[currentCategory]) {
            categories[currentCategory] = [];
          }
          break;
        }
      }
    }
    
    // If we're in a category and this is a content line (not empty, not a header)
    if (currentCategory && trimmedLine && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('#')) {
      // Clean up the line and add it
      const cleanedLine = trimmedLine
        .replace(/^[-•]\s*/, '')  // Remove bullet points
        .trim();
      
      if (cleanedLine) {
        categories[currentCategory].push(cleanedLine);
      }
    }
  }
  
  return categories;
}

/**
 * Parse release body and extract all CodeRabbit summaries
 * @param {string} body - Release body content
 * @returns {Record<string, string[]>} Merged categories from all PRs
 */
function parseReleaseBody(body) {
  const mergedCategories = {};
  
  if (!body || !body.trim()) {
    return mergedCategories;
  }
  
  // Split by PR sections (marked by ---)
  const prSections = body.split(/^---$/m).filter(s => s.trim());
  
  console.log(`Found ${prSections.length} PR section(s)`);
  
  for (const section of prSections) {
    // Extract PR title for logging
    const titleMatch = section.match(/###\s*PR:\s*(.+?)(?:\n|$)/);
    const prTitle = titleMatch ? titleMatch[1].trim() : 'Unknown PR';
    
    // Extract CodeRabbit summary
    const summary = extractCodeRabbitSummary(section);
    
    if (summary) {
      console.log(`  - ${prTitle}: Found CodeRabbit summary`);
      
      // Parse categories from this summary
      const categories = parseSummaryCategories(summary);
      
      // Merge into overall categories
      for (const [category, items] of Object.entries(categories)) {
        if (!mergedCategories[category]) {
          mergedCategories[category] = [];
        }
        mergedCategories[category].push(...items);
      }
    } else {
      console.log(`  - ${prTitle}: No CodeRabbit summary found`);
    }
  }
  
  return mergedCategories;
}

/**
 * Convert merged categories to changelog format
 * @param {Record<string, string[]>} categories - Merged categories
 * @returns {string} Formatted changelog content
 */
function formatChangelog(categories) {
  if (Object.keys(categories).length === 0) {
    return `\n### Changes\n\n- Release ${version}\n`;
  }
  
  let changelog = '';
  
  // Define preferred order
  const categoryOrder = [
    'Breaking Changes',
    'New Features',
    'Features',
    'Bug Fixes',
    'Performance',
    'Security',
    'Refactor',
    'Style',
    'Documentation',
    'Tests',
    'Chores',
    'Deprecated'
  ];
  
  // Output categories in order
  for (const category of categoryOrder) {
    const items = categories[category];
    if (items && items.length > 0) {
      changelog += `\n### ${category}\n\n`;
      for (const item of items) {
        changelog += `- ${item}\n`;
      }
    }
  }
  
  // Output any remaining categories not in the order list
  for (const [category, items] of Object.entries(categories)) {
    if (!categoryOrder.includes(category) && items.length > 0) {
      changelog += `\n### ${category}\n\n`;
      for (const item of items) {
        changelog += `- ${item}\n`;
      }
    }
  }
  
  return changelog;
}

/**
 * Update CHANGELOG.md file
 */
function updateChangelog() {
  const changelogPath = 'CHANGELOG.md';

  // Check if file exists
  if (!fs.existsSync(changelogPath)) {
    console.error(`❌ Error: ${changelogPath} not found`);
    process.exit(1);
  }

  let changelog = fs.readFileSync(changelogPath, 'utf8');

  // Parse release body and extract CodeRabbit summaries
  console.log('Parsing release body...');
  const categories = parseReleaseBody(releaseBody);
  
  // Format changelog content
  const changelogContent = formatChangelog(categories);

  // Generate new version content
  const newVersionContent = `## [${version}] - ${date}\n${changelogContent}`;

  // Empty Unreleased section
  const emptyUnreleased = `## [Unreleased]\n\n`;

  // Try to match and replace Unreleased section
  let updated = false;

  // Pattern 1: Standard format - Unreleased followed by another version
  const pattern1 = /(## \[Unreleased\][\s\S]*?)(## \[\d)/;
  if (changelog.match(pattern1)) {
    changelog = changelog.replace(
      pattern1,
      `${emptyUnreleased}${newVersionContent}\n\n$2`
    );
    updated = true;
  }

  // Pattern 2: Unreleased is the last section (first release)
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

  // Pattern 3: No Unreleased section, append to end
  if (!updated) {
    changelog += `\n\n${newVersionContent}`;
    updated = true;
  }

  // Write updated changelog
  fs.writeFileSync(changelogPath, changelog);

  // Output stats
  const totalItems = Object.values(categories).reduce((sum, items) => sum + items.length, 0);
  console.log(`\n✅ CHANGELOG.md updated`);
  console.log(`   Version: ${version}`);
  console.log(`   Date: ${date}`);
  console.log(`   Total items: ${totalItems}`);
  
  if (Object.keys(categories).length > 0) {
    console.log(`   Categories:`);
    for (const [category, items] of Object.entries(categories)) {
      console.log(`     - ${category}: ${items.length} item(s)`);
    }
  }
}

// Execute
updateChangelog();
