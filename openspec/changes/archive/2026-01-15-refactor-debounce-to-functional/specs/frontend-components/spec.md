## MODIFIED Requirements

### Requirement: Utility Module Pattern
Frontend utility code that is not a React component SHALL use plain module exports rather than class-with-static-methods or class-with-instance-methods patterns.

#### Scenario: Utility functions exported as named exports
- **GIVEN** a utility module that provides helper functions
- **WHEN** the module does not render UI or use React hooks
- **THEN** it MUST export functions as named exports
- **AND** it MUST NOT use class syntax with static methods
- **AND** it MUST NOT use class syntax with instance methods
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

#### Scenario: Debounce utility uses functional pattern
- **GIVEN** code needs to debounce function calls
- **WHEN** using the debounce utility
- **THEN** it MUST use the functional debounce utility from `utils/debounce.ts`
- **AND** it MUST NOT use class-based debounce implementations
- **AND** the debounce utility MUST properly clean up timers on unmount or subsequent calls

Example of correct pattern:
```typescript
// Utility module: Meta.tsx
export const configDialogTitle = "GitHub Target";

export const sidebarLabel = (config: { title?: string; username?: string }): string => {
  return config.title || config.username || "";
};

export const icon = (): JSX.Element => <GitHubIcon />;

// Utility module: debounce.ts
export const createDebounce = (delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounce = (fn: () => void) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return { debounce, cancel };
};
```

Example of incorrect patterns:
```typescript
// ❌ Using class with static methods
export default class Meta {
  static configDialogTitle = "GitHub Target";
  static sidebarLabel(config) { return config.title; }
  static icon() { return <GitHubIcon />; }
}

// ❌ Using class with instance methods
export class Debounce {
  timeout: any;
  duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }

  run(fn: () => void) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(fn, this.duration);
  }
}
```

## ADDED Requirements

### Requirement: Debounce Utility Testing
The debounce utility SHALL have comprehensive automated tests to ensure correct timing behavior.

#### Scenario: Basic debounce delays execution
- **GIVEN** a debounce utility is created with a 100ms delay
- **WHEN** a function is debounced
- **THEN** the function MUST NOT execute immediately
- **AND** the function MUST execute after the specified delay
- **AND** the test MUST use vitest fake timers to verify timing

#### Scenario: Rapid calls cancel previous timers
- **GIVEN** a debounce utility is created
- **WHEN** the debounce function is called multiple times rapidly
- **THEN** only the last call's function MUST execute
- **AND** all previous pending executions MUST be cancelled
- **AND** the delay timer MUST restart with each new call

#### Scenario: Cancel method clears pending execution
- **GIVEN** a debounce utility with a pending execution
- **WHEN** the cancel method is called
- **THEN** the pending function MUST NOT execute
- **AND** the timeout MUST be cleared

#### Scenario: Multiple debounce instances are independent
- **GIVEN** multiple debounce instances are created
- **WHEN** each instance debounces different functions
- **THEN** each instance MUST maintain its own timer state
- **AND** calling one instance's debounce MUST NOT affect other instances
