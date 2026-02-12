# User Feedback (NEW)

**Status**: active  
**Capability**: user-feedback  
**Owner**: frontend

## Delta Summary

This is a NEW spec that defines requirements for user feedback on state-changing operations.

## Added Requirements

### Requirement: Snackbar Messages for State Changes

All operations that change application state, workspace state, or site content MUST display a snackbar message indicating success or failure.

**Severity levels**:
- `success` - Operation completed successfully
- `error` - Operation failed due to an error
- `warning` - Operation completed but with issues
- `info` - Informational message

**Examples of state-changing operations**:
- Creating, updating, or deleting content items (✅ Applied to Collection)
- Renaming or copying files (✅ Applied to Collection)
- Converting file structures (✅ Applied to Collection)
- Saving form data
- Publishing content
- Changing settings

**Scenario: Delete item shows success message**
```
GIVEN a user deletes a collection item
WHEN the operation succeeds
THEN a success snackbar shows "Item deleted successfully"
```

### Requirement: Error Messages Must Be Actionable

Error messages MUST include the underlying error reason when available.

**Pattern**:
```typescript
onError: (error: any) => {
  addSnackMessage(`Failed to {operation}: ${error.message}`, { severity: 'error' });
}
```

### Requirement: Read-Only Operations Do Not Require Feedback

Operations that only read data (queries) do NOT require snackbar messages. Use loading indicators instead:
- `<LinearProgress />` for background refetching
- `<CircularProgress />` or skeleton UI for initial loading

## Implementation in Collection Component

Applied user feedback requirements to all collection mutations:

- ✅ `deleteCollectionItem` - Added success/error snackbars
- ✅ `renameCollectionItem` - Already had success/error snackbars
- ✅ `copyCollectionItem` - Already had success/error snackbars
- ✅ `makePageBundleCollectionItem` - Already had success/error snackbars
- ✅ `copyCollectionItemToLang` - Already had success snackbar

## Related Changes

- Collection component now provides feedback for ALL mutations
- Users always know whether their actions succeeded or failed
- Error messages include details to help troubleshoot issues
