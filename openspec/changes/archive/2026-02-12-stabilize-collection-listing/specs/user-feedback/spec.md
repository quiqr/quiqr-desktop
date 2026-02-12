# User Feedback (NEW)

**Status**: active  
**Capability**: user-feedback  
**Owner**: frontend

## Delta Summary

This is a NEW spec that defines requirements for user feedback on state-changing operations.

## MODIFIED Requirements

### Requirement: Snackbar Messages for State Changes

All operations that change application state, workspace state, or site content MUST display a snackbar message indicating success or failure.

**Severity levels**:
- `success` - Operation completed successfully
- `error` - Operation failed due to an error
- `warning` - Operation completed but with issues
- `info` - Informational message

**Examples of state-changing operations**:
- Creating, updating, or deleting content items
- Renaming or copying files
- Converting file structures
- Saving form data
- Publishing content
- Changing settings

#### Scenario: Delete item shows success message

WHEN a user deletes a collection item and the operation succeeds  
THEN a success snackbar SHALL display "Item deleted successfully"

#### Scenario: Create item shows error on failure

WHEN a user creates a collection item and the operation fails  
THEN an error snackbar SHALL display "Failed to create item: {error reason}"

### Requirement: Error Messages Must Be Actionable

Error messages MUST include the underlying error reason when available to help users understand and resolve issues.

**Pattern**:
```typescript
onError: (error: any) => {
  addSnackMessage(`Failed to {operation}: ${error.message}`, { severity: 'error' });
}
```

#### Scenario: Error includes specific reason

WHEN a mutation fails with an error  
THEN the error snackbar SHALL include the error message text from the exception

### Requirement: Read-Only Operations Do Not Require Feedback

Operations that only read data (queries) SHALL NOT display snackbar messages. Instead, they MUST use loading indicators:
- `<LinearProgress />` for background refetching
- `<CircularProgress />` or skeleton UI for initial loading

#### Scenario: Query shows loading indicator instead of snackbar

WHEN a collection items query is fetching or refetching data  
THEN a LinearProgress indicator SHALL be displayed at the top of the collection list  
AND no snackbar messages SHALL be shown for the query

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
