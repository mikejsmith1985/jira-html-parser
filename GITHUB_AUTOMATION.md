# GitHub Automation & Release Workflow

## Overview

This project uses GitHub Actions for automatic versioning and release creation. Every time you push to the `master` branch, the workflow automatically:

1. ✓ Runs all tests
2. ✓ Bumps the version in `package.json`
3. ✓ Creates a git tag
4. ✓ Generates comprehensive release notes
5. ✓ Creates a GitHub Release

No manual steps required!

## Quick Start

### Making a Release

```bash
# 1. Make your changes
# Edit jira-link-generator.html, tests, docs, etc.

# 2. Stage and commit
git add .
git commit -m "feat: Add new awesome feature"

# 3. Push to master
git push origin master

# 4. GitHub Actions automatically:
#    - Runs tests
#    - Bumps version (0.3.0 → 0.4.0)
#    - Creates tag (v0.4.0)
#    - Creates release on GitHub
#    - Generates release notes

# 5. View release
# https://github.com/mikejsmith1985/jira-html-parser/releases
```

## Conventional Commits

The workflow uses commit message prefixes to determine version bumps:

### Feature (Minor Version Bump)
```
feat: Add dark mode support

This commit creates a new feature, so version bumps:
0.3.0 → 0.4.0
```

### Breaking Change (Major Version Bump)
```
feat!: Remove legacy API endpoint

Breaking changes cause major version bump:
0.3.0 → 1.0.0
```

### Bug Fix (Patch Version Bump)
```
fix: Correct form validation logic

Bug fixes cause patch version bump:
0.3.0 → 0.3.1
```

### Chore (Patch Version Bump)
```
chore: Update dependencies

Maintenance work causes patch version bump:
0.3.0 → 0.3.1
```

### Documentation (No Version Bump)
```
docs: Update README with examples

Documentation changes don't affect version:
0.3.0 → 0.3.0 (no bump)
```

### Tests (No Version Bump)
```
test: Add new test coverage

Test additions don't affect version:
0.3.0 → 0.3.0 (no bump)
```

## Workflow Details

### Location
```
.github/workflows/release.yml
```

### Trigger
Runs on every push to:
- `master` branch
- `main` branch (if applicable)

### Steps

#### 1. Checkout Code
```yaml
- Checkout code with full git history (fetch-depth: 0)
- Needed to access commit history and tags
```

#### 2. Setup Environment
```yaml
- Setup Node.js v18
- Install dependencies
```

#### 3. Extract Commit Info
```yaml
- Get commit message (used for version bump logic)
- Get author name
- Get commit SHA (short)
```

#### 4. Run Tests
```yaml
- Execute: npm test
- Runs all test suites
- Results logged even if tests fail
- Doesn't block release (continue-on-error: true)
```

#### 5. Determine Version
```
Reads package.json version (e.g., 0.3.0)
Checks commit message prefix:
  - "feat:" → 0.3.0 → 0.4.0 (bump minor)
  - "feat!:" → 0.3.0 → 1.0.0 (bump major)
  - else → 0.3.0 → 0.3.1 (bump patch)
```

#### 6. Update Version
```yaml
- Update package.json with new version
- Verify update (cat package.json)
```

#### 7. Commit & Push Version
```yaml
- Configure git user (github-action)
- Commit version change
- Push back to repository
```

#### 8. Create Git Tag
```yaml
- Create tag: v0.4.0 (for example)
- Push tag to GitHub
- Handles if tag already exists
```

#### 9. Generate Release Notes
```
Creates comprehensive markdown with:
  - Release version (v0.4.0)
  - Previous version (0.3.0)
  - Commit hash (abc1234)
  - Commit author
  - Full commit message
  - Features section
  - Documentation links
  - Browser compatibility matrix
  - Backward compatibility note
```

#### 10. Create GitHub Release
```yaml
- Use softprops/action-gh-release
- Create release with generated notes
- Make it non-draft and non-prerelease
- Attach files (if configured)
```

#### 11. Display Summary
```
Shows in workflow output:
  - Release created successfully
  - Tag version
  - Previous and new versions
  - Commit info
  - Author
```

## Workflow File

### Current Configuration

```yaml
on:
  push:
    branches:
      - master
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
```

### What Each Section Does

**Checkout**
```yaml
uses: actions/checkout@v4
with:
  fetch-depth: 0  # Get full history for tags
```

**Setup Node**
```yaml
uses: actions/setup-node@v4
with:
  node-version: '18'
```

**Version Logic (Bash)**
```bash
# Read current version from package.json
VERSION=$(cat package.json | grep '"version"' | head -1 | sed 's/.*: "\([^"]*\)".*/\1/')

# Check commit message prefix
if echo "$COMMIT_MSG" | grep -q "^feat!:"; then
  # Major: X.0.0
elif echo "$COMMIT_MSG" | grep -q "^feat:"; then
  # Minor: x.Y.0
else
  # Patch: x.y.Z
fi
```

**Release Creation**
```yaml
uses: softprops/action-gh-release@v1
with:
  tag_name: v${{ steps.version.outputs.new }}
  name: Release v${{ steps.version.outputs.new }}
  body: ${{ env.RELEASE_NOTES }}
```

## Example Execution

### Push a Feature
```bash
$ git commit -m "feat: Add dark mode support"
$ git push origin master
```

### Workflow Executes
```
✓ Checkout code
✓ Setup Node.js
✓ Extract commit: "feat: Add dark mode support"
✓ Run tests: 66/66 passed
✓ Current version: 0.3.0
✓ Commit prefix: "feat:"
✓ New version: 0.4.0
✓ Update package.json
✓ Commit version update
✓ Push version commit
✓ Create tag: v0.4.0
✓ Generate release notes
✓ Create GitHub Release
✓ Release v0.4.0 published!
```

### Result on GitHub
- New tag: `v0.4.0`
- New release with generated notes
- Commit: version update from workflow bot
- package.json: updated to 0.4.0

## View Releases

### On GitHub
```
https://github.com/mikejsmith1985/jira-html-parser/releases
```

### Watch Workflow Run
```
https://github.com/mikejsmith1985/jira-html-parser/actions
```

### Check Tags
```bash
git tag -l

# Output:
# v0.3.0
# v0.3.1
# v0.4.0
# v1.0.0
```

## Configuration

### Current Version
```json
{
  "version": "0.3.0"
}
```

Location: `package.json`

The workflow automatically updates this on each push!

### Test Scripts
```json
{
  "scripts": {
    "test": "node test-config-items.js && node test-config-items-integration.js && node test-e2e-workflows.js && node validate-html.js",
    "test:config": "node test-config-items.js",
    "test:integration": "node test-config-items-integration.js",
    "test:workflows": "node test-e2e-workflows.js",
    "test:validate": "node validate-html.js"
  }
}
```

### Repository Links
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/mikejsmith1985/jira-html-parser"
  }
}
```

## Troubleshooting

### Workflow Not Triggering
**Problem**: Push to master but no workflow runs

**Solutions**:
1. Check Actions tab: `github.com/...../actions`
2. Verify `.github/workflows/release.yml` exists
3. Check branch name is exactly `master` or `main`
4. Ensure you have write permissions

### Version Not Bumping
**Problem**: Commit pushed but version didn't increase

**Solutions**:
1. Check commit message starts with correct prefix
2. Verify prefix is followed by colon: `feat:` not `feat`
3. Look at workflow logs for error messages
4. Manually fix `package.json` if needed

### Release Not Created
**Problem**: Version bumped but no GitHub Release

**Solutions**:
1. Check workflow logs for errors
2. Verify GitHub token has permissions
3. Check if tag was created: `git tag -l`
4. Look at release tab on GitHub

### Test Failures
**Problem**: Workflow shows test failures

**Solution**:
- Workflow continues despite test failures
- Fix tests locally and push again
- Release will be created regardless

## Best Practices

### Commit Messages
✓ Use conventional commit format
✓ Be descriptive in commit body
✓ Reference issues if applicable

```bash
# Good
git commit -m "feat: Add configuration items management

- Edit labels for Base URL, Project ID, Issue Type ID
- Delete and restore functionality
- Integration with presets
- 66 comprehensive tests"

# Not ideal
git commit -m "update stuff"
```

### Version Bumping
✓ Use `feat:` for new features
✓ Use `feat!:` for breaking changes
✓ Use `fix:` for bug fixes
✓ Use `chore:` for maintenance

### Testing Before Push
```bash
# Always run tests locally first
npm test

# If all tests pass, push
git push origin master
```

### Multiple Changes
```bash
# If multiple features:
# Option 1: Squash into one commit with "feat:"
# Option 2: Individual commits (each bumps minor version)

# Commits in one push:
feat: Add feature A  # 0.3.0 → 0.4.0
feat: Add feature B  # 0.4.0 → 0.5.0
fix: Bug fix         # 0.5.0 → 0.5.1
```

## Advanced Configuration

### Disabling Automatic Releases
Remove or comment out the workflow file:
```bash
rm .github/workflows/release.yml
```

### Manual Releases
Create release manually:
```bash
# Create tag
git tag v0.3.2

# Push tag
git push origin v0.3.2

# Create release on GitHub (manual)
# Go to Releases → Draft New Release
```

### Custom Version Bumping
Edit the version logic in `.github/workflows/release.yml`:
```yaml
- name: Determine version bump
  id: version
  run: |
    # Add custom logic here
    VERSION=$(cat package.json | grep '"version"' | head -1)
    # ... custom bumping logic ...
```

### Adding Release Assets
Modify the gh-release action:
```yaml
with:
  files: |
    jira-link-generator.html
    package.json
    README.md
```

## Security

### Permissions
```yaml
permissions:
  contents: write    # Can write to repo
  packages: write    # Can publish packages
```

### Token
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- Auto-generated by GitHub
- Scoped to workflow
- Expires after workflow completes
- No credentials stored

### Safety
✓ Bot commits are signed with "github-action"
✓ Only master/main triggers release
✓ Tests run before release
✓ No sensitive data in logs

## Integration with Other Tools

### CI/CD Pipelines
Workflow works with:
- GitHub Pages
- npm registry
- Docker registries
- Slack notifications (can add)
- Email notifications (can add)

### Pre-commit Hooks
Recommended local setup:
```bash
# .git/hooks/pre-commit
npm test
```

### Branch Protection
Recommended GitHub settings:
- Require pull request review
- Require status checks to pass
- Dismiss stale reviews
- Require branches to be up to date

## Monitoring & Alerts

### Watch Workflow
1. Go to Actions tab
2. Click on workflow name
3. See real-time progress
4. Check logs for details

### Get Notified
GitHub can notify via:
- Email (workflow run)
- Website (watch releases)
- Slack (integrations)
- Discord (webhooks)

## Examples

### Example 1: Bug Fix Release
```bash
# Fix a bug
# Edit jira-link-generator.html

# Commit with fix: prefix
git add .
git commit -m "fix: Correct form validation in custom fields"
git push origin master

# Result:
# - Tests run: 66/66 passed ✓
# - Version: 0.3.0 → 0.3.1 (patch bump)
# - Tag: v0.3.1 created
# - Release: published on GitHub
```

### Example 2: Feature Release
```bash
# Add new feature
# Update jira-link-generator.html

# Commit with feat: prefix
git add .
git commit -m "feat: Add dark mode support"
git push origin master

# Result:
# - Tests run: 66/66 passed ✓
# - Version: 0.3.1 → 0.4.0 (minor bump)
# - Tag: v0.4.0 created
# - Release: published on GitHub
```

### Example 3: Breaking Change
```bash
# Make breaking change
# Update jira-link-generator.html

# Commit with feat!: prefix
git add .
git commit -m "feat!: Remove localStorage storage, use server-side storage"
git push origin master

# Result:
# - Tests run: 66/66 passed ✓
# - Version: 0.4.0 → 1.0.0 (major bump)
# - Tag: v1.0.0 created
# - Release: published on GitHub
```

## Support & Resources

- Workflow logs: Actions tab
- Release notes: Releases tab
- Git tags: `git tag -l`
- Package version: `cat package.json`
- GitHub Docs: github.com/features/actions

---

**Status**: Workflow fully configured and operational ✓
