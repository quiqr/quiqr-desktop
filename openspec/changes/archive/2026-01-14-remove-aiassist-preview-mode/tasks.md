# Tasks: Remove AI Assistant Preview Page Mode

## Task List

### 1. Remove pageUrl prop from interface
- [x] Remove `pageUrl: string;` from `AiAssistProps` interface
- [x] Remove `pageUrl` from destructured props in component signature

**Verification**: TypeScript compiles without errors
**Estimated effort**: 2 minutes
**Status**: ✅ Completed

---

### 2. Remove webpage state variable
- [x] Remove `const [webpage, setWebpage] = useState("");` line

**Verification**: No unused variable warnings
**Estimated effort**: 1 minute
**Status**: ✅ Completed

---

### 3. Simplify assistant readiness useEffect
- [x] Update useEffect dependencies to remove `webpage`
- [x] Remove conditional logic checking `runOn === "previewpage" && webpage !== ""`
- [x] Simplify to check only if `commandPrompt !== ""`

**Verification**: Assistant ready/not ready state logic is simplified
**Estimated effort**: 5 minutes
**Status**: ✅ Completed - Now checks only commandPrompt

---

### 4. Update genPrompt callback
- [x] Remove `runOn === "previewpage"` case from genPrompt
- [x] Update dependencies array if needed (remove inValue if only used for previewpage)
- [x] Keep only "none" and "infield" cases

**Verification**: Prompt generation works for remaining modes
**Estimated effort**: 3 minutes
**Status**: ✅ Completed - Only "none" and "infield" cases remain

---

### 5. Simplify handleRunOnChange callback
- [x] Remove fetch logic for previewpage
- [x] Simplify to just `setRunOn(value)`
- [x] Remove or simplify the useCallback (might just inline it)
- [x] Remove `pageUrl` from dependencies array

**Verification**: Mode switching still works for remaining modes
**Estimated effort**: 5 minutes
**Status**: ✅ Completed - Removed entire callback, inlined as setRunOn

---

### 6. Remove preview page MenuItem from UI
- [x] Remove `<MenuItem value="previewpage">from preview page</MenuItem>` line from Select

**Verification**: Only two options visible in dropdown
**Estimated effort**: 1 minute
**Status**: ✅ Completed

---

### 7. Update parent components (if needed)
- [x] Search for AiAssist usage: `rg "AiAssist" frontend/src`
- [x] Remove `pageUrl` prop from any parent component calls
- [x] Update imports if needed

**Verification**: No TypeScript errors from parent components
**Estimated effort**: 5 minutes
**Status**: ✅ Completed - Updated 4 components:
  - StringField.tsx
  - MarkdownField.tsx
  - Single.tsx
  - CollectionItem.tsx

---

### 8. TypeScript validation
- [x] Run `cd frontend && npx tsc --noEmit`
- [x] Fix any type errors

**Verification**: TypeScript compiles successfully
**Estimated effort**: 3 minutes
**Status**: ✅ Completed - No AiAssist or pageUrl errors

---

### 9. Build verification
- [x] Run `npm run build`
- [x] Verify AiAssist compiles successfully

**Verification**: Build succeeds without errors
**Estimated effort**: 2 minutes
**Status**: ✅ Completed - Build successful, AiAssist bundle: 105.49 kB (reduced from 105.92 kB)

---

### 10. Manual testing
- [x] Start dev server
- [x] Open AI Assistant dialog
- [x] Verify only two modes in dropdown: "from input field" and "command prompt only"
- [x] Test "from input field" mode works
- [x] Test "command prompt only" mode works

**Verification**: Both remaining modes function correctly
**Estimated effort**: 5 minutes
**Status**: ✅ Completed - User confirmed both modes work correctly

---

## Total Estimated Time
Approximately 30-35 minutes

## Dependencies
Tasks 1-6 can be done in parallel, but task 7 depends on completing 1-6 first.

## Rollback Plan
Simple revert via git if issues arise.
