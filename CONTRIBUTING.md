# Contributing to Quiqr Desktop

Thank you for your interest in contributing to Quiqr Desktop! We welcome contributions from the community and appreciate your help in making this project better.

This guide will help you understand our contribution process and ensure your contributions can be reviewed and merged efficiently.

## Getting Started

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/quiqr-desktop.git
   cd quiqr-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests locally**
   ```bash
   cd frontend && npm test
   ```

4. **Start development environment**
   ```bash
   npm run dev
   ```

For detailed development instructions, see `AGENTS.md` and `openspec/project.md`.

### Where to Ask Questions

- **Discord**: Ask questions or discuss ideas
- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or discuss ideas
- **Pull Requests**: Get feedback on your contributions

## Pull Request Requirements

All pull requests must meet these requirements:

### 1. Clear Description

Your PR description must explain:
- **What** changes you made
- **Why** the changes were necessary

For bug fixes, include:
- Steps to reproduce the bug
- How your fix addresses the issue

For features, include:
- The feature's purpose
- References to related issues or discussions

### 2. Passing CI Checks

- Run tests locally: `cd frontend && npm test`
- Check types: `cd frontend && npx tsc --noEmit`

Before a PR can be merged:
- All automated tests must pass
- All linters must pass (type checking, code formatting)

**PRs with failing tests or linters will not be merged.**

## Change Size Guidelines

We classify contributions by size to determine the appropriate process:

### Small Changes

**Definition:**
- Typo fixes in documentation
- Simple documentation updates
- Minor bug fixes affecting a single function or component
- Changes that do not alter behavior or add features

**Requirements:**
- Clear PR description
- Passing CI checks
- No OpenSpec proposal required
- Basic testing if applicable

### Large Changes

**Definition:**
- New user-facing features
- Architectural changes
- Breaking changes to APIs or behavior
- Changes affecting multiple components or systems
- Performance optimizations that change behavior

**Requirements:**
- **OpenSpec proposal required** (see below)
- **Comprehensive automated tests required**
- Clear documentation of breaking changes
- Migration guidance for breaking changes

## Testing Requirements

Testing requirements scale with the size and impact of your contribution:

| Change Type | Tests Required |
|-------------|----------------|
| Typo/doc fix | None (existing tests must pass) |
| Bug fix | Regression test recommended |
| New utility function | **Unit tests required** |
| New component | Tests for complex logic recommended |
| Large feature | **Comprehensive automated tests required** |

### Test Guidelines

- **Utility functions**: Must have comprehensive unit tests covering all code paths and edge cases
- **React components**: Should have tests for critical functionality and user interactions
- **Integration features**: Require integration tests for cross-cutting concerns

See `openspec/project.md` for detailed testing patterns and examples.

## OpenSpec Workflow

### For Vibe Coding (Exploratory/Rapid Prototyping)

Vibe coding and rapid prototyping are **encouraged** for exploration! However, before your PR can be merged:

1. Create an OpenSpec proposal documenting your change retroactively
2. Get the proposal reviewed and approved
3. Submit your PR with a reference to the approved proposal

**Why?** This ensures that even exploratory code is properly documented and aligned with project architecture.

### For Large Changes

Large changes (new features, architectural changes, breaking changes) require OpenSpec workflow **before implementation**:

1. Create an OpenSpec proposal first
2. Get the proposal reviewed and approved
3. Implement according to the approved proposal
4. Include automated tests as specified in the proposal tasks
5. Submit your PR with a reference to the approved proposal

**How to create a proposal:**

```bash
# See openspec/AGENTS.md for detailed instructions
openspec list --specs  # Check existing specifications
# Create your proposal in openspec/changes/your-change-name/
# Include proposal.md, tasks.md, and spec deltas
openspec validate your-change-name --strict
```

## Code Quality Standards

### Follow Existing Patterns

- Use TypeScript for all new frontend code
- Follow style conventions documented in `AGENTS.md`
- Match existing code patterns and architecture
- Prefer editing existing files over creating new ones
- Avoid over-engineering - keep solutions simple

### No Breaking Changes Without Discussion

If your change would break existing functionality:
1. Discuss the breaking change in an issue first
2. Create an OpenSpec proposal documenting the breaking change
3. Provide a migration plan for users

### Avoid Common Mistakes

**Don't:**
- Submit PRs with failing tests (verify locally first)
- Bypass OpenSpec for architectural changes
- Add new dependencies without discussion
- Create duplicate issues (search first)
- Force-push after code review has started

**Do:**
- Run tests locally before submitting
- Follow the OpenSpec workflow for large changes
- Discuss dependency additions before implementing
- Search for existing issues and PRs
- Respond to review feedback promptly

## Branch and Commit Conventions

- **Branch naming**: `feature/description` or `fix/description`
- **Commit messages**: Clear and descriptive

## Review Process

- Maintainers will review your PR and provide feedback
- Be responsive to review comments and questions
- Maintainers may request changes or suggest splitting large PRs
- Approved PRs will be merged by maintainers

## Special Cases

### Security Vulnerabilities

If you discover a security vulnerability:
- Report it via a GitHub Security Advisory or issue
- Do not publicly disclose until maintainers have addressed it

### Documentation-Only PRs

Documentation improvements are always welcome and typically receive fast-track review.

### Dependency Updates

When updating dependencies:
- Include changelog highlights in PR description
- Document any breaking changes
- Note testing performed to verify compatibility

## Need Help?

- Check `AGENTS.md` for detailed development guidance
- Review `openspec/project.md` for project conventions
- See `openspec/AGENTS.md` for OpenSpec workflow details
- Ask questions in GitHub Issues or Discussions

## License

By contributing to Quiqr Desktop, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Quiqr Desktop! Your efforts help make this project better for everyone.
