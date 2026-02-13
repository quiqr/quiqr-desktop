# User Feedback

**Status**: active  
**Capability**: user-feedback  
**Owner**: frontend

## Purpose

This spec defines requirements for providing user feedback when application state changes or operations complete. Users must receive clear, timely feedback for all state-changing operations to understand what happened and whether their actions succeeded.
## Requirements
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

## Migration Notes

When adding snackbar messages to existing code:

1. Identify all mutation operations in the component
2. Check if they have `onSuccess` and `onError` callbacks
3. Add `addSnackMessage()` calls with appropriate messages
4. Test both success and error paths

## Related Specs

- **Frontend State Management**: Defines mutation patterns using TanStack Query
- **Frontend Components**: Snackbar context implementation
- **Collection Management**: Examples of applying user feedback to collection operations
