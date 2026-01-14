# Capability: Frontend Components

## ADDED Requirements

### Requirement: Utility Module Pattern
Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods pattern.

#### Scenario: Utility functions exported as named exports
- **GIVEN** a utility module that provides helper functions
- **WHEN** the module does not render UI or use React hooks
- **THEN** it MUST export functions as named exports
- **AND** it MUST NOT use class syntax with static methods
- **AND** it MAY use const exports for constant values

#### Scenario: Import utility modules
- **GIVEN** a component needs to use utility functions
- **WHEN** importing from a utility module
- **THEN** it SHALL use namespace imports (`import * as Util`) or destructured imports
- **AND** it MUST NOT import default-exported classes

#### Scenario: Typed utility functions
- **GIVEN** a utility function is exported from a module
- **WHEN** the function accepts parameters
- **THEN** parameters MUST have explicit TypeScript types
- **AND** return types SHOULD be explicit when not trivially inferred

Example of correct pattern:
```typescript
// Utility module: Meta.tsx
export const configDialogTitle = "GitHub Target";

export const sidebarLabel = (config: { title?: string; username?: string }): string => {
  return config.title || config.username || "";
};

export const icon = (): JSX.Element => <GitHubIcon />;
```

Example of incorrect pattern:
```typescript
// ❌ Using class with static methods
export default class Meta {
  static configDialogTitle = "GitHub Target";
  static sidebarLabel(config) { return config.title; }
  static icon() { return <GitHubIcon />; }
}
```
