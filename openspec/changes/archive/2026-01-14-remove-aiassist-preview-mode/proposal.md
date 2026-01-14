# Proposal: Remove AI Assistant Preview Page Mode

## Summary
Remove the non-functional "from preview page" mode from the AI Assistant component, simplifying the interface to support only "from input field" and "command prompt only" modes.

## Why
The preview page feature is disabled because the page preview button was removed in an earlier iteration. The "from preview page" option is now non-functional and confusing for users.

## What Changes
- Remove "previewpage" mode option from AI Assistant dropdown
- Remove `webpage` state variable and related fetch logic
- Remove `pageUrl` prop (no longer needed)
- Simplify readiness checking logic (no longer needs webpage dependency)
- Update `genPrompt` to handle only two modes: "infield" and "none"
- Simplify `handleRunOnChange` to remove fetch logic

## Scope
**In scope:**
- Remove preview page mode UI option
- Remove webpage fetching logic
- Remove unused state and props
- Simplify validation logic

**Out of scope:**
- Adding new AI assistant modes
- Restoring preview functionality
- Changes to OpenAI integration
- UI/UX redesign beyond removing the option

## Impact Analysis
**Parent components using AiAssist** (4 locations):
- `frontend/src/components/SukohForm/fields/StringField.tsx` (line 63)
- `frontend/src/components/SukohForm/fields/MarkdownField.tsx` (line 68)
- `frontend/src/containers/WorkspaceMounted/Single.tsx` (line 173)
- `frontend/src/containers/WorkspaceMounted/Collection/CollectionItem.tsx` (line 157)

All these components pass `pageUrl` prop and will need to be updated.

## Implementation Approach
1. Remove `pageUrl` prop from `AiAssistProps` interface
2. Remove `webpage` state variable
3. Simplify `useEffect` for assistant readiness (remove webpage dependency)
4. Update `genPrompt` to remove "previewpage" case
5. Remove fetch logic from `handleRunOnChange`
6. Remove "from preview page" MenuItem from Select dropdown
7. Update 4 parent components to remove `pageUrl` prop
8. Verify TypeScript compilation and build

## Success Criteria
- [x] "from preview page" option removed from dropdown
- [x] Only two modes available: "from input field" and "command prompt only"
- [x] `pageUrl` prop removed from component interface
- [x] `webpage` state removed
- [x] No webpage fetching logic remains
- [x] TypeScript compiles with no errors
- [x] Component builds successfully
- [x] All 4 parent components updated (StringField, MarkdownField, Single, CollectionItem)
- [x] Existing modes still work correctly (user confirmed)
