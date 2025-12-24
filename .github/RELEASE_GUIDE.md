# Release Guide

## PR Accumulation Mechanism

release-drafter automatically tracks and accumulates PRs, ensuring no duplicates:

```
Timeline:
────────────────────────────────────────────────────────────────────►

v1.0.0                                              v1.1.0
  │                                                    │
  ▼                                                    ▼
  ├── PR #10 (feat: user avatar)  ─┐                   │
  │                                │                   │
  ├── PR #11 (fix: login issue)   ─┼──► Draft Release ─┼──► Release v1.1.0
  │                                │    (3 PRs)        │
  ├── PR #12 (feat: dark mode)    ─┘                   │
  │                                                    │
  ├── PR #13 (fix: style issue)   ─┐                      
  │                                │                      
  ├── PR #14 (feat: export)       ─┼──► New Draft Release
  │                                │    (excludes #10-#12)   
  └── ...                         ─┘                      
```

## Release Workflow

### Step 1: Daily Development

Each time a PR is merged to the main branch:

1. release-drafter runs automatically
2. Reads the PR's labels (e.g., `changelog:added`)
3. Adds the PR to the Draft Release

### Step 2: View Draft Release

Go to GitHub → Releases page, you will see:

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 Draft                                                       │
│  v1.2.0                                                         │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ## What's Changed                                              │
│                                                                 │
│  📦 This release contains 5 changes since v1.1.0                │
│                                                                 │
│  🚀 New Features                                                │
│  - Add user avatar upload (#123) @developer1                    │
│  - Support dark mode (#125) @developer2                         │
│                                                                 │
│  🐛 Bug Fixes                                                   │
│  - Fix login failure issue (#124) @developer1                   │
│                                                                 │
│                                        [Edit] [Publish release] │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Edit (Optional)

Click Edit to:
- Polish change descriptions
- Adjust version number
- Add additional notes
- Remove unwanted entries

### Step 4: Publish

After clicking "Publish release":
1. Release is officially published
2. Automatically triggers `update-changelog.yml`
3. CHANGELOG.md is automatically updated
4. A new Draft Release starts accumulating

## FAQ

### Q: Why doesn't a PR appear in the Draft Release?

Check the following:
1. Has the PR been merged to the main branch?
2. Does the PR have a `changelog:skip` label? (If so, it will be excluded)
3. Has the PR already been included in a previous release?

### Q: How to manually trigger a Draft Release update?

Go to Actions → Release Drafter → Run workflow

### Q: Want to exclude a merged PR?

1. Delete that line directly in the Draft Release
2. Or add `changelog:skip` label to the PR (requires re-triggering)

### Q: How is the version number determined?

Automatically calculated based on PR labels:
- Has `version:major` → Major version +1 (1.0.0 → 2.0.0)
- Has `version:minor` or `changelog:added` → Minor version +1 (1.0.0 → 1.1.0)
- Otherwise → Patch version +1 (1.0.0 → 1.0.1)

## Label Reference

| PR Label | Release Category | Version Impact |
|----------|-----------------|----------------|
| `changelog:added` | 🚀 New Features | minor |
| `changelog:changed` | 🔄 Changes | - |
| `changelog:deprecated` | ⚠️ Deprecated | - |
| `changelog:removed` | 🗑️ Removed | - |
| `changelog:fixed` | 🐛 Bug Fixes | patch |
| `changelog:security` | 🔒 Security | - |
| `changelog:skip` | (not recorded) | - |
| `version:major` | - | major |
| `version:minor` | - | minor |
| `version:patch` | - | patch |
