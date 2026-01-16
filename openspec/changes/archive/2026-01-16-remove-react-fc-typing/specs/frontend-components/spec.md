# Frontend Components Spec Delta

## MODIFIED Requirements

### Requirement: Component Type Safety
All functional components SHALL have properly typed props without using React.FC.

#### Scenario: Props are explicitly typed
- **GIVEN** a functional component with props
- **WHEN** defining the component
- **THEN** it MUST declare an interface for props
- **AND** it MUST type the props parameter with that interface
- **AND** it MUST NOT use React.FC or React.FunctionComponent types
- **AND** children prop MUST be explicitly declared if needed

#### Scenario: Props are destructured
- **GIVEN** a functional component receives props
- **WHEN** accessing prop values
- **THEN** it MUST destructure props in the function parameters
- **AND** it MUST NOT use props.propertyName syntax

#### Scenario: No React.FC usage in codebase
- **GIVEN** the frontend codebase
- **WHEN** searching for React.FC usage with `grep -r "React.FC" frontend/src`
- **THEN** no matches MUST be found
- **AND** all components MUST use explicit const declarations with typed props

Example of correct pattern:
```typescript
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;  // Explicitly declare if needed
}

const MyComponent = ({ value, onChange, children }: MyComponentProps) => {
  // Component implementation
  return <div>{value}</div>;
};

// With React.memo
const MyMemoComponent = React.memo(({ value }: MyComponentProps) => {
  return <div>{value}</div>;
});
```

Example of incorrect patterns:
```typescript
// ❌ Using React.FC
const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => {
  return <div>{value}</div>;
};

// ❌ Using props object
const MyComponent = (props: MyComponentProps) => {
  return <div>{props.value}</div>;
};

// ❌ Using React.FunctionComponent
const MyComponent: React.FunctionComponent<MyComponentProps> = (props) => {
  return <div>{props.value}</div>;
};
```

## ADDED Requirements

### Requirement: Legacy Code Removal
Dead code and unused legacy patterns SHALL be removed from the codebase to maintain code quality and reduce maintenance burden.

#### Scenario: Unused code directories are removed
- **GIVEN** a directory or module in the codebase
- **WHEN** the code has zero active imports or usages
- **AND** the functionality has been superseded by a newer implementation
- **THEN** the directory MUST be removed from the codebase
- **AND** any references in documentation SHOULD note the replacement

#### Scenario: HoForm legacy system removed
- **GIVEN** the HoForm legacy form system
- **WHEN** searching for imports with `grep -r "from.*HoForm" frontend/src`
- **THEN** no matches MUST be found
- **AND** the `frontend/src/components/HoForm/` directory MUST NOT exist
- **AND** SukohForm is the active form system
