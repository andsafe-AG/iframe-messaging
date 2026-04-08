# Contributing to @andsafe/iframe-messaging

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18.x, 20.x, or 22.x
- npm 9.x or higher
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iframe-messaging.git
   cd iframe-messaging
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/andsafe-AG/iframe-messaging.git
   ```

### Installation

```bash
npm install
```

### Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes

3. Run tests:
   ```bash
   npm test
   ```

4. Build the library:
   ```bash
   npm run build
   ```

5. Test your changes with the example server:
   ```bash
   npm run server
   ```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run build` | Build the library |
| `npm run type-check` | Check TypeScript types |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Lint and auto-fix issues |
| `npm run format` | Check code formatting |
| `npm run format:fix` | Format source files |
| `npm run check` | Run all Biome checks |
| `npm run check:fix` | Run and auto-fix all Biome checks |
| `npm run ci:check` | Run Biome checks in CI mode |
| `npm run server` | Start example server |
| `npm run server:dev` | Start server with hot reload |

## Project Structure

```
iframe-messaging/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── examples/               # Example implementations
│   ├── server.js          # Development server
│   ├── vanilla-js.html    # Vanilla JS example
│   └── ...
├── src/
│   ├── __tests__/         # Test files
│   │   ├── setup.ts       # Test configuration
│   │   ├── datalayer-push.test.ts
│   │   ├── iframe-resizing.test.ts
│   │   ├── send-command.test.ts
│   │   ├── types.test.ts
│   │   └── utils.test.ts
│   ├── datalayer-push.ts  # Data layer integration
│   ├── iframe-resizing.ts # Core resizing implementation
│   ├── index.ts           # Public API
│   ├── send-command.ts    # Command sending logic
│   ├── types.ts           # Type definitions
│   └── utils.ts           # Shared utilities
├── dist/                  # Build output (generated)
├── biome.json             # Biome linter/formatter config
└── coverage/              # Coverage reports (generated)
```

## Making Changes

### Code Style

- Follow existing code style and conventions
- Use TypeScript for all source files
- Write clear, self-documenting code
- Add JSDoc comments for public APIs
- Use [Biome](https://biomejs.dev/) for linting and formatting — run `npm run check:fix` before committing

### Testing Requirements

All contributions must include tests:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test interactions between components
3. **Edge Cases**: Test boundary conditions and error scenarios

**Coverage Requirements:**
- Statements: ≥95%
- Branches: ≥90%
- Functions: 100%
- Lines: ≥95%

### Writing Tests

Example test structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { initIFrameResizing } from '../iframe-resizing';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Type Safety

- All public APIs must have proper TypeScript types
- Avoid `any` types unless absolutely necessary
- Export types that consumers might need

### Documentation

Update documentation for:

- New features: Add examples and API docs
- Breaking changes: Update migration guide
- Bug fixes: Explain the fix in PR description

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes (dependencies, etc.)
- `revert`: Revert previous commit

### Examples

```bash
# Good commits
git commit -m "feat: add throttle option to resize observer"
git commit -m "fix: resolve memory leak in cleanup function"
git commit -m "docs: update API reference with new options"

# Bad commits
git commit -m "update code"
git commit -m "fix bug"
git commit -m "WIP"
```

### Scope (Optional)

Specify the area of change:

```bash
git commit -m "feat(api): add new configuration option"
git commit -m "fix(types): correct Command interface"
git commit -m "test(integration): add parent-child tests"
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**:
   ```bash
   npm run type-check
   npm run ci:check
   npm run test:run
   npm run build
   ```

3. **Ensure coverage is maintained**:
   ```bash
   npm run test:coverage
   ```

### PR Title

Use conventional commit format:

```
feat: add new resize throttling option
fix: resolve memory leak in cleanup
docs: update getting started guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] Coverage maintained/improved
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for notable changes)
```

### Review Process

1. Automated checks must pass:
   - CI tests on all platforms
   - Coverage thresholds met
   - Build succeeds
   - PR title format valid

2. Code review by maintainer(s)

3. Address review feedback

4. Approval and merge

## Reporting Issues

### Bug Reports

Use the bug report template and include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Minimal reproduction steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Node.js version
   - npm version
   - Operating system
   - Browser (if applicable)
6. **Code Sample**: Minimal reproducible example

### Feature Requests

Include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: What alternatives have you considered?
4. **Additional Context**: Any other relevant information

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`:
   ```bash
   npm version patch  # or minor, major
   ```

2. Update `CHANGELOG.md`

3. Commit and push with tags:
   ```bash
   git push --follow-tags
   ```

4. GitHub Actions will:
   - Run all tests
   - Build the library
   - Publish to npm
   - Create GitHub release

## Development Tips

### Running Specific Tests

```bash
# Run specific test file
npx vitest run src/__tests__/iframe-resizing.test.ts

# Run tests matching pattern
npx vitest run -t "should initialize"

# Watch specific file
npx vitest watch iframe-resizing
```

### Debugging Tests

```bash
# Use Vitest UI for debugging
npm run test:ui

# Use Node.js debugger
node --inspect-brk node_modules/.bin/vitest run
```

### Testing Examples Locally

```bash
# Start the example server
npm run server

# Open in browser
open http://localhost:3000
```

### Type Checking

```bash
# Check types without emitting
npm run type-check

# Watch for type errors
npx tsc --noEmit --watch
```

## Getting Help

- 📖 Read the [documentation](./README.md)
- 🐛 Check [existing issues](https://github.com/andsafe-AG/iframe-messaging/issues)
- 💬 Ask questions in issue discussions
- 📧 Contact maintainers: [GitHub Issues](https://github.com/andsafe-AG/iframe-messaging/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Project documentation (for major features)

## Questions?

Don't hesitate to ask questions! Open an issue with the "question" label, and we'll help you out.

---

Thank you for contributing to @andsafe/iframe-messaging! 🎉
