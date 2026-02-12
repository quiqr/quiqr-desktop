# User Feedback

**Status**: active  
**Capability**: user-feedback  
**Owner**: frontend

## Overview

This spec defines requirements for providing user feedback when application state changes or operations complete. Users must receive clear, timely feedback for all state-changing operations to understand what happened and whether their actions succeeded.

## Requirements

### Requirement: Snackbar Messages for State Changes

**Description**: All operations that change application state, workspace state, or site content MUST display a snackbar message indicating success or failure.

**Rationale**: Users need immediate feedback to:
- Confirm their action was executed
- Understand whether the operation succeeded or failed
- Know what to do if an error occurred

**Implementation**:
- Use the `useSnackbar()` hook from the snackbar context
- Call `addSnackMessage(message, { severity })` after operations complete
- Severity levels:
  - `success` - Operation completed successfully
  - `error` - Operation failed due to an error
  - `warning` - Operation completed but with issues
  - `info` - Informational message about operation

**Examples of state-changing operations**:
- Creating, updating, or deleting content items
- Renaming or copying files
- Converting file structures (e.g., Make Page Bundle)
- Saving form data
- Publishing or unpublishing content
- Importing or exporting data
- Changing application settings

**Scenario 1: Successful delete operation**
```
GIVEN a user has a collection item selected
WHEN they delete the item
AND the operation succeeds
THEN a success snackbar appears with message "Item deleted successfully"
AND the item disappears from the collection list
```

**Scenario 2: Failed delete operation**
```
GIVEN a user has a collection item selected
WHEN they delete the item
AND the operation fails with error "Permission denied"
THEN an error snackbar appears with message "Failed to delete item: Permission denied"
AND the item remains in the collection list
```

**Scenario 3: Rename operation**
```
GIVEN a user renames a collection item from "old-name" to "new-name"
WHEN the operation succeeds
THEN a success snackbar appears with message "Item renamed successfully"
```

**Scenario 4: Copy operation**
```
GIVEN a user copies a collection item
WHEN the operation succeeds
THEN a success snackbar appears with message "Copied {itemName} successfully"
```

### Requirement: Error Messages Must Be Actionable

**Description**: Error messages in snackbars MUST include the underlying error reason when available, helping users understand what went wrong.

**Implementation**:
```typescript
onError: (error: any) => {
  addSnackMessage(`Failed to {operation}: ${error.message}`, { severity: 'error' });
}
```

**Scenario: Include error details**
```
GIVEN an operation fails with error "File already exists"
WHEN displaying the error snackbar
THEN the message includes the specific error: "Failed to copy item: File already exists"
```

### Requirement: Read-Only Operations Do Not Require Feedback

**Description**: Operations that only read data (queries) do NOT require snackbar messages. Loading states should be shown through UI indicators (spinners, skeletons) instead.

**Examples of read-only operations** (no snackbar needed):
- Loading collection items
- Fetching workspace details
- Reading configuration
- Displaying content

**Loading state indicators**:
- Use `isLoading`, `isFetching`, `isRefetching` from TanStack Query
- Show `<LinearProgress />` for background refetching
- Show `<CircularProgress />` or skeleton UI for initial loading

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
