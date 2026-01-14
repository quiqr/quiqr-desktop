# Proposal: Convert AiAssist Component to Functional

## Summary
Convert the `AiAssist` component from a class-based React component to a functional component using React hooks. This is the last remaining class component in the frontend codebase.

## Motivation
- **Code consistency**: AiAssist is the only class component remaining in `frontend/src/components/`
- **Modern patterns**: Functional components with hooks are the project standard per `project.md`
- **Maintainability**: Hooks provide cleaner state management and better testability
- **Alignment with legacy docs**: The `unified-layout-system-plan.md` mentions converting 35 class components; this completes that effort

## Current State
The `AiAssist` component (`frontend/src/components/AiAssist.tsx`) is a 280-line class component that:
- Manages AI assistant dialog state (open/closed, busy, form readiness)
- Integrates with OpenAI API for text generation
- Provides a dialog UI for running AI prompts on field content
- Supports three modes: input field text, preview page text, or prompt-only
- Has 8 state properties and 4 methods

## Proposed Changes

### Component Conversion
Convert `AiAssist.tsx` from class-based to functional:
- Replace class state with `useState` hooks
- Convert methods to `useCallback` hooks for optimization
- Maintain identical props interface and external API
- Preserve all existing functionality

### State Management
Transform state properties:
```typescript
// Current: this.state with 8 properties
// Proposed: Individual useState hooks or combined state object
```

State properties to convert:
- `dialogOpen` → `useState<boolean>(false)`
- `result` → `useState<string>("")`
- `runOn` → `useState<string>("")`
- `commandPrompt` → `useState<string>("")`
- `webpage` → `useState<string>("")`
- `assistendNotReady` → `useState<boolean>(true)`
- `aiBusy` → `useState<boolean>(false)`
- `formNotReady` → `useState<boolean>(true)` (note: appears unused)

### Method Conversion
Convert class methods to hooks:
- `checkAssistentReady()` → `useCallback` or `useEffect`
- `genPrompt()` → `useCallback`
- `sendToAssistent()` → `useCallback` (async function)
- `renderDialog()` → Inline JSX or extracted component
- `handleClick()` → Inline handler or `useCallback`

### No Breaking Changes
- Props interface (`AiAssistProps`) remains unchanged
- Parent components require no modifications
- Visual appearance and behavior identical
- AI integration logic unchanged

## Scope
**In scope:**
- Convert AiAssist class component to functional component
- Refactor state management to use hooks
- Refactor methods to use useCallback where appropriate
- Maintain existing props interface and functionality

**Out of scope:**
- UI/UX changes or redesign
- Changes to OpenAI integration logic
- Performance optimizations beyond standard hooks
- Adding new features
- Changes to other components

## Implementation Approach

### Step 1: Analyze Dependencies
- Review all state properties and their usage
- Identify state dependencies between methods
- Determine which methods need useCallback vs inline

### Step 2: Convert State
- Replace `this.state` with individual `useState` hooks
- Remove constructor
- Update all `this.setState` calls to setter functions

### Step 3: Convert Methods
- Convert `checkAssistentReady()` to useEffect with dependencies
- Convert `genPrompt()`, `sendToAssistent()`, `handleClick()` to useCallback
- Inline `renderDialog()` or extract if warranted

### Step 4: Update References
- Replace all `this.state.xxx` with state variables
- Replace all `this.props.xxx` with destructured props
- Remove all `this.` references

### Step 5: Verify Functionality
- Test dialog open/close
- Test AI assistant integration
- Test all three run modes (infield, previewpage, none)
- Verify state transitions and form validation

## Risks and Mitigation

### Risk: State Update Timing
**Risk**: `setState` calls were synchronous in class; hooks may introduce async issues
**Mitigation**: Review all state updates for dependencies; use functional updates where needed

### Risk: Missing Dependencies
**Risk**: useCallback/useEffect dependencies may be incomplete
**Mitigation**: Enable ESLint exhaustive-deps rule warnings; test thoroughly

### Risk: Re-render Performance
**Risk**: Hooks may cause unnecessary re-renders
**Mitigation**: Use useCallback for stable function references; memoize if needed

### Risk: Behavior Changes
**Risk**: Subtle behavior differences between class and functional patterns
**Mitigation**: Manual testing of all AI assistant features; maintain existing logic flow

## Success Criteria
- [x] AiAssist component is fully functional
- [x] All state management converted to hooks
- [x] No class component syntax remains
- [x] Props interface unchanged
- [x] Component renders correctly
- [x] Dialog opens and closes properly
- [ ] AI integration works (text generation) - Requires manual testing with OpenAI API key
- [ ] All three run modes work (infield, previewpage, none) - Requires manual testing
- [x] Form validation logic preserved
- [x] No TypeScript errors
- [x] No console errors or warnings

## Related Work
- Legacy docs reference component conversions in `unified-layout-system-plan.md`
- Project conventions in `project.md` specify functional component patterns
- This completes the frontend class component migration

## Open Questions
None - this is a straightforward refactor with clear requirements.
