# Change: Add Contribution Guidelines

## Why

The project currently lacks formal contribution guidelines, making it unclear for contributors how to submit changes appropriately. Without clear guidelines:
- Contributors may submit PRs that don't meet quality standards
- Maintainers spend time explaining the same requirements repeatedly
- The balance between welcoming new contributors and maintaining code quality is not documented
- The OpenSpec workflow integration for vibe-coded changes is not explained

## What Changes

- Add CONTRIBUTING.md file to repository root with comprehensive but approachable guidelines
- Define clear requirements for different types of contributions (small fixes vs large features)
- Establish testing requirements based on change scope
- Document when OpenSpec workflow is required (vibe coding and large changes)
- Specify PR quality standards (description, passing tests, passing linters)
- Provide guidance without creating barriers for simple contributions

## Impact

- **Affected specs**: Creates new `contribution-guidelines` capability
- **Affected code**: No code changes, adds CONTRIBUTING.md documentation file
- **Users**: Contributors will have clear expectations for submitting PRs
- **Maintainers**: Can reference official guidelines instead of repeating instructions
