# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Test Job
- **Matrix Strategy**: Tests across multiple environments
  - OS: Ubuntu, Windows, macOS
  - Node.js: 20.x, 22.x
- **Steps:**
  1. Checkout code
  2. Setup Node.js with caching
  3. Install dependencies
  4. Run type checking
  5. Run unit tests
  6. Generate coverage report
  7. Upload coverage to Codecov (Ubuntu + Node 20.x only)

#### Build Job
- Runs after tests pass
- Builds the library
- Verifies build artifacts exist
- Uploads artifacts for 7 days

#### Lint Job
- Runs TypeScript compiler checks
- Validates code quality

#### Size Check Job
- Analyzes bundle sizes
- Reports sizes in GitHub summary
- Shows both raw and gzipped sizes

**Status Badge:**
```markdown
![CI](https://github.com/andsafe-AG/iframe-messaging/actions/workflows/ci.yml/badge.svg)
```

### 2. Release Workflow (`release.yml`)

**Triggers:**
- Git tags matching `v*.*.*` pattern (e.g., v1.0.0)

**Jobs:**

#### Test Before Release
- Runs full test suite
- Generates coverage report
- Must pass before release

#### Build Release
- Creates production build
- Uploads build artifacts

#### Publish to NPM
- Publishes package to npm registry
- Uses `NPM_TOKEN` secret
- Sets package to public access

#### Create GitHub Release
- Downloads build artifacts
- Creates tarball
- Extracts changelog for version
- Creates GitHub release with:
  - Release notes from CHANGELOG.md
  - Tarball attachment
  - Build artifacts
- Marks as prerelease if tag contains alpha/beta/rc

**Required Secrets:**
- `NPM_TOKEN`: npm authentication token
- `GITHUB_TOKEN`: Automatically provided

**Usage:**
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Or use npm version
npm version patch  # or minor, major
git push --follow-tags
```

### 3. CodeQL Analysis (`codeql.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Scheduled: Every Monday at 2:00 AM UTC

**Features:**
- Security vulnerability scanning
- Code quality analysis
- Automatic security alerts
- Supports JavaScript/TypeScript

**Reports:**
- Security tab in GitHub repository
- Automated security advisories

### 4. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### PR Title Check
- Validates conventional commit format
- Allowed types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes
  - `refactor`: Code refactoring
  - `perf`: Performance improvements
  - `test`: Test additions/changes
  - `build`: Build system changes
  - `ci`: CI configuration changes
  - `chore`: Maintenance tasks
  - `revert`: Revert previous commit

**Examples:**
```
✅ feat: add new resize throttling option
✅ fix: resolve memory leak in cleanup
✅ docs: update API reference
❌ Add feature (missing type)
❌ FEAT: add feature (incorrect case)
```

#### PR Size Check
- Counts changed lines
- Warns if PR exceeds 1000 lines
- Suggests splitting large PRs

#### Test Coverage Check
- Generates coverage report
- Posts coverage comment on PR
- Shows pass/fail status for thresholds
- Includes detailed metrics table

#### Build Check
- Verifies build completes successfully
- Checks all required files exist
- Reports build outputs in summary

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are automatically enabled for public repositories. For private repositories:

1. Go to repository Settings
2. Navigate to Actions → General
3. Enable "Allow all actions and reusable workflows"

### 2. Configure Secrets

#### Required Secrets:

**For NPM Publishing:**
1. Create npm access token:
   ```bash
   npm login
   npm token create --read-only=false
   ```
2. Add to GitHub:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

**For Codecov (Optional):**
1. Sign up at [codecov.io](https://codecov.io)
2. Get repository token
3. Add to GitHub:
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

### 3. Configure Branch Protection

Recommended settings for `main` branch:

1. Go to Settings → Branches
2. Add rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1+)
   - ✅ Require status checks to pass:
     - `Test`
     - `Build`
     - `Lint`
     - `Check Test Coverage`
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ✅ Include administrators

## Workflow Triggers Summary

| Workflow | Push (main) | Push (develop) | PR | Tag | Schedule |
|----------|-------------|----------------|-----|-----|----------|
| CI | ✅ | ✅ | ✅ | ❌ | ❌ |
| Release | ❌ | ❌ | ❌ | ✅ | ❌ |
| CodeQL | ✅ | ✅ | ✅ | ❌ | ✅ (Weekly) |
| PR Checks | ❌ | ❌ | ✅ | ❌ | ❌ |

## Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/andsafe-AG/iframe-messaging/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/andsafe-AG/iframe-messaging/actions/workflows/release.yml/badge.svg)
![CodeQL](https://github.com/andsafe-AG/iframe-messaging/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/andsafe-AG/iframe-messaging/branch/main/graph/badge.svg)](https://codecov.io/gh/andsafe-AG/iframe-messaging)
```

## Troubleshooting

### Tests Failing in CI

1. **Different Node.js versions**: Test locally with all supported versions:
   ```bash
   nvm use 20 && npm test
   nvm use 22 && npm test
   ```

2. **Environment differences**: Check OS-specific issues
   ```bash
   # Test on different platforms using Docker
   docker run -it node:20-alpine sh
   ```

### NPM Publish Fails

1. **Check token**: Verify NPM_TOKEN secret is valid
2. **Version conflict**: Ensure version in package.json is unique
3. **Permissions**: Verify you have publish rights to the package

### Build Artifacts Missing

1. Check build script runs successfully locally
2. Verify dist directory is created
3. Check .gitignore doesn't exclude required files

### Coverage Upload Fails

1. Verify CODECOV_TOKEN is set correctly
2. Check coverage/lcov.info file exists
3. Review Codecov documentation for latest requirements

## Performance Tips

### Caching

All workflows use npm caching to speed up installations:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### Matrix Strategy

CI workflow uses matrix strategy to run tests in parallel:
- 3 operating systems × 3 Node.js versions = 9 parallel jobs
- Reduces total run time significantly

### Conditional Jobs

Some jobs only run when needed:
- Codecov upload: Only on Ubuntu + Node 20.x
- Dependency review: Only on pull requests
- NPM publish: Only on tags

## Cost Optimization

For private repositories:

1. **Reduce matrix size**: Test fewer OS/Node combinations
2. **Use self-hosted runners**: For high-volume repositories
3. **Limit workflow triggers**: Use path filters to skip unnecessary runs

Example path filter:
```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
```

## Monitoring

### View Workflow Runs

1. Go to repository's Actions tab
2. Select workflow from left sidebar
3. View run history and details

### Set Up Notifications

1. Go to Settings → Notifications
2. Enable "Actions" notifications
3. Configure email/Slack/etc. alerts

### Review Logs

Each job provides detailed logs:
- Expand job in workflow run
- View individual step outputs
- Download logs for offline analysis

## Security

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Use least-privilege access

### Dependency Security

- Dependency review runs on all PRs
- CodeQL scans for vulnerabilities
- Enable Dependabot for automatic updates

### Permissions

Workflows use minimal required permissions:
```yaml
permissions:
  contents: read  # Read repository content
  actions: read   # Read workflow information
```

## Future Enhancements

Potential additions:

- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Automatic changelog generation
- [ ] Semantic release automation
- [ ] Container image publishing
- [ ] Documentation deployment

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js Actions](https://github.com/actions/setup-node)
- [Codecov Documentation](https://docs.codecov.com/)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

**Last Updated**: 2025-10-23
**Maintainer**: andsafe AG
