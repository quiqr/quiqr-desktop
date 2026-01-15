# Change: Add OpenSpec Workflow for Spec-Driven Development

## Why
Quiqr Desktop needed a structured approach to planning, implementing, and tracking changes across a growing codebase. Without a spec-driven workflow, architectural decisions and requirements were scattered across code, conversations, and documentation, making it difficult for AI assistants and developers to understand the intended behavior versus implemented behavior.

## What Changes
- Added OpenSpec framework for spec-driven development workflow
- Created three-stage workflow: proposal creation, implementation, and archiving
- Established directory structure for specs and changes
- Added `project.md` for project conventions and context
- Added `AGENTS.md` with detailed instructions for AI assistants
- Integrated OpenSpec instructions into `AGENTS.md` via managed block
- Set up validation and archiving tooling support

## Impact
- **Affected specs**: New capability `spec-driven-development`
- **Affected code**: `AGENTS.md` (added OpenSpec instructions)
- **Workflow changes**: All future significant changes should follow the OpenSpec workflow
- **Documentation**: Centralized project context in `openspec/project.md`
