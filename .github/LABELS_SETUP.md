# GitHub Labels Setup Guide

## Quick Setup (Using GitHub CLI)

Make sure you have [GitHub CLI](https://cli.github.com/) installed, then run the following commands in the repository root:

```bash
# Create Changelog Category Labels
gh label create "changelog:added" --color "0E8A16" --description "New features - appears in CHANGELOG Added section"
gh label create "changelog:changed" --color "1D76DB" --description "Changes - appears in CHANGELOG Changed section"
gh label create "changelog:deprecated" --color "FEF2C0" --description "Deprecated - appears in CHANGELOG Deprecated section"
gh label create "changelog:removed" --color "B60205" --description "Removed features - appears in CHANGELOG Removed section"
gh label create "changelog:fixed" --color "FBCA04" --description "Bug fixes - appears in CHANGELOG Fixed section"
gh label create "changelog:security" --color "D93F0B" --description "Security fixes - appears in CHANGELOG Security section"
gh label create "changelog:skip" --color "EEEEEE" --description "Skip - not recorded in CHANGELOG"

# Create Version Type Labels
gh label create "version:major" --color "B60205" --description "Major version update (breaking changes)"
gh label create "version:minor" --color "0E8A16" --description "Minor version update (new features)"
gh label create "version:patch" --color "FBCA04" --description "Patch version update (bug fixes)"
```

## Manual Setup

1. Go to the GitHub repository page
2. Click **Issues** → **Labels**
3. Click the **New label** button
4. Create each label according to the configuration in `labels.yml`

## Label Usage Guidelines

| Label | When to Use | Example |
|-------|-------------|---------|
| `changelog:added` | New features, new APIs | "Add user export feature" |
| `changelog:changed` | Changes to existing functionality | "Optimize search algorithm performance" |
| `changelog:deprecated` | Features marked for removal | "Deprecate v1 API" |
| `changelog:removed` | Removed features | "Remove legacy login page" |
| `changelog:fixed` | Bug fixes | "Fix login failure issue" |
| `changelog:security` | Security-related fixes | "Fix XSS vulnerability" |
| `changelog:skip` | Changes not worth recording | Documentation updates, CI config |

## Version Number Increment Rules

- `version:major`: Use for breaking changes (1.0.0 → 2.0.0)
- `version:minor`: Use for new features (1.0.0 → 1.1.0)
- `version:patch`: Use for bug fixes (1.0.0 → 1.0.1)

If a PR has no version label, it defaults to `patch`.
