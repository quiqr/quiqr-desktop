# Change: Stabilize Collection Listing

## Why

The Collection listing component (`/packages/frontend/src/containers/WorkspaceMounted/Collection/index.tsx`) has multiple stability and correctness issues that cause poor user experience:

## Problem statement

- PROBLEM-1 renaming a markdown file, or pageBundle does not refresh the listing
- PROBLEM-2 renaming a markdown file, or pageBundle sometime doesn't work at all
- PROBLEM-3 converting a markdown file to a pageBundle is not working
- PROBLEM-4 when an item is already a pageBundle the menu item should be disabled
- PROBLEM-5 copy page to another language ends-up in a app crash and a white screen (in the electron version)
- PROBLEM-6 copy doesn't refresh
- PROBLEM-7 it's not clear when it is refreshed. switching to another menu item and back again doesn't refresh too.
- PROBLEM-8 listing yaml-files causes error messages

### Testing above problems except for the PROBLEM-8

Most of above problems can be tested in:

@/home/pim/Quiqr/sites/technative-rebuild can used to test all above problems.

### Testing the yaml-files

PROBLEM-8, the Yaml-files listing problem can be found in: @/home/pim/Quiqr/sites/msa-packaging:

In the collection `Package Sets` it should list yaml-files. This causes several error message in the frontend console.

including the first error:

```
main-process-bridge.ts:31 [API Validation] Schema validation failed for listCollectionItems: 
(3) [{…}, {…}, {…}]
validateApiResponse	@	main-process-bridge.ts:31
(anonymous)	@	main-process-bridge.ts:89
Promise.then		
(anonymous)	@	main-process-bridge.ts:86
request	@	main-process-bridge.ts:79
listCollectionItems	@	api.ts:252
queryFn	@	options.ts:80
<Collection>		
CollectionRoute	@	CollectionRoute.tsx:11
<CollectionRoute>		
AppContent	@	App.tsx:146
```

and:

```
index.tsx:309 Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## Proposed Solution

Iterate through all problems, and when a problem is fixed document the root cause and solution in this openspec change. When the user has confirmed the fix, create specs to describe the correct functionality and create unit and/or integration tests to prevent future problems.
