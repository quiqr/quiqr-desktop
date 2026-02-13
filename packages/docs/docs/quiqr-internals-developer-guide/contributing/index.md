---
sidebar_position: 5
---

# Contributing to Quiqr

Thank you for your interest in contributing to Quiqr! We welcome contributions from the community.

## Ways to Contribute

There are many ways to contribute to Quiqr:

- **Report Bugs**: File issues on [GitHub](https://github.com/quiqr/quiqr-desktop/issues)
- **Suggest Features**: Share ideas for new features
- **Improve Documentation**: Help make our docs better
- **Write Code**: Fix bugs or implement features
- **Help Others**: Answer questions on Discord

## Getting Started

### Prerequisites

- Node.js 20+
- Git
- Familiarity with TypeScript, React, and Node.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/quiqr-desktop.git
cd quiqr-desktop
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/quiqr/quiqr-desktop.git
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-bugfix
```

### 2. Make Your Changes

Follow our coding standards (see below).

### 3. Test Your Changes

```bash
# Run type checking
cd packages/frontend && npx tsc --noEmit

# Test the application
npm run dev
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new field type for ratings"
# or
git commit -m "fix: resolve issue with Hugo preview server"
```

**Commit Message Format:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new frontend code
- Define types using Zod schemas in `types.ts`
- Prefer type inference over explicit typing

### React Components

- Use functional components with hooks
- Don't use `React.FC`
- Destructure props in function parameters
- Use Material-UI (MUI) v7 components

**Good Example:**

```typescript
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

function MyComponent({ title, onSave }: MyComponentProps) {
  return <Button onClick={onSave}>{title}</Button>;
}
```

**Bad Example:**

```typescript
const MyComponent: React.FC<Props> = (props) => {
  return <Button onClick={props.onSave}>{props.title}</Button>;
};
```

### File Organization

- Place components in `/packages/frontend/src/components/`
- Place containers (pages) in `/packages/frontend/src/containers/`
- Place services in `/packages/frontend/src/services/`
- Place backend code in `/packages/backend/src-main/`

### API Methods

When adding a new API method:

1. Define it in `/packages/backend/src-main/bridge/api-main.js`
2. Add response schema to `/packages/frontend/types.ts` under `apiSchemas`
3. Add method to `/packages/frontend/src/api.ts` with proper typing
4. Use generic typing for methods returning different types

### Form Fields

When creating new form fields:

1. Define Zod schema in `packages/types/src/schemas/fields.ts`
2. Add to `CoreFields` and rebuild types
3. Create component in `/packages/frontend/src/components/SukohForm/fields/`
4. Register in `FieldRegistry.ts`

See [Field Development Guide](../field-system.md) for details.

## Documentation

When adding features:

- Update relevant documentation in `/packages/docs/docs/`
- Add JSDoc comments to public APIs
- Include examples for complex features

## Testing

- Test your changes manually in the dev environment
- Verify both desktop and server modes if applicable
- Test on your target platform (Windows, macOS, or Linux)

## Pull Request Guidelines

### PR Title

Use the same format as commit messages:

```
feat: add rating field component
fix: resolve Hugo server port conflict
docs: update installation guide
```

### PR Description

Include:

- **What**: Brief description of changes
- **Why**: Motivation for the change
- **How**: Technical approach (if complex)
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Types are properly defined
- [ ] Documentation is updated
- [ ] Changes have been tested
- [ ] Commit messages are clear

## OpenSpec Change Proposals

For significant changes, we use OpenSpec:

1. Create a change proposal in `openspec/changes/`
2. Get feedback from maintainers
3. Implement according to the approved design

See `openspec/AGENTS.md` for details.

## Code Review

All submissions require review. Be patient and address feedback constructively.

Reviewers will check:

- Code quality and style
- Test coverage
- Documentation
- Breaking changes
- Performance implications

## Community

- **Discord**: [Join our server](https://discord.gg/nJ2JH7jvmV)
- **GitHub**: [Issues and PRs](https://github.com/quiqr/quiqr-desktop)
- **Discussions**: GitHub Discussions for Q&A

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

If you have questions:

1. Check the [Quiqr Internals Developer Guide](../index.md)
2. Search existing issues
3. Ask on Discord
4. Open a discussion on GitHub

Thank you for contributing to Quiqr! 🎉
