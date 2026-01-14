# frontend-components Specification

## Purpose
TBD - created by archiving change convert-aiassist-to-functional. Update Purpose after archive.
## Requirements
### Requirement: Functional Component Pattern
All React components in the frontend SHALL use the functional component pattern with hooks rather than class-based components.

#### Scenario: New components are functional
- **GIVEN** a developer is creating a new React component
- **WHEN** they write the component code
- **THEN** they MUST use a functional component with const declaration and typed props
- **AND** they MUST NOT use React.Component class syntax
- **AND** they MUST destructure props in function parameters

#### Scenario: Existing class components are converted
- **GIVEN** an existing class-based React component exists in the codebase
- **WHEN** it is identified during refactoring or maintenance
- **THEN** it SHOULD be converted to a functional component
- **AND** the conversion MUST preserve all existing functionality
- **AND** the conversion MUST maintain the same props interface

#### Scenario: State management uses hooks
- **GIVEN** a functional component needs local state
- **WHEN** implementing state management
- **THEN** it MUST use useState hook for state variables
- **AND** it SHOULD use useCallback for stable function references
- **AND** it SHOULD use useEffect for side effects and lifecycle needs
- **AND** it MAY use useMemo for expensive computations

#### Scenario: No class component remains in components directory
- **GIVEN** the frontend codebase
- **WHEN** searching for class components with `grep -r "extends React.Component" frontend/src/components`
- **THEN** no matches SHOULD be found
- **AND** the AiAssist component MUST be the last class component converted

### Requirement: Component Type Safety
All functional components SHALL have properly typed props without using React.FC.

#### Scenario: Props are explicitly typed
- **GIVEN** a functional component with props
- **WHEN** defining the component
- **THEN** it MUST declare an interface for props
- **AND** it MUST type the props parameter with that interface
- **AND** it MUST NOT use React.FC or React.FunctionComponent types

#### Scenario: Props are destructured
- **GIVEN** a functional component receives props
- **WHEN** accessing prop values
- **THEN** it MUST destructure props in the function parameters
- **AND** it MUST NOT use props.propertyName syntax

Example of correct pattern:
```typescript
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

const MyComponent = ({ value, onChange }: MyComponentProps) => {
  // Component implementation
};
```

Example of incorrect patterns:
```typescript
// ❌ Using React.FC
const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => { };

// ❌ Using props object
const MyComponent = (props: MyComponentProps) => {
  return <div>{props.value}</div>;
};

// ❌ Using class component
class MyComponent extends React.Component<MyComponentProps> { }
```

### Requirement: AI Assistant Component Modes
The AI Assistant component SHALL support only modes that are functional and accessible to users.

#### Scenario: Preview page mode removed
- **GIVEN** the AI Assistant dialog is open
- **WHEN** the user views the "Run AI Assist with text" dropdown
- **THEN** only "from input field" and "command prompt only" options SHALL be available
- **AND** the "from preview page" option SHALL NOT be present

#### Scenario: Two operational modes
- **GIVEN** the AI Assistant is being used
- **WHEN** selecting a run mode
- **THEN** "from input field" mode SHALL apply prompts to the current field content
- **AND** "command prompt only" mode SHALL send only the prompt without field content
- **AND** no preview page fetching SHALL occur

#### Scenario: Simplified component interface
- **GIVEN** a parent component uses AiAssist
- **WHEN** rendering the component
- **THEN** it SHALL NOT require a pageUrl prop
- **AND** it SHALL only require inValue, inField, and handleSetAiText props

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

