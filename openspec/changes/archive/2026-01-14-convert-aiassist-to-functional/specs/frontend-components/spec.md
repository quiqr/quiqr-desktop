# Capability: Frontend Components

## ADDED Requirements

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
