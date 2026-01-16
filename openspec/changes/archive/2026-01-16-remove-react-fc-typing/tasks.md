# Implementation Tasks

## 1. Remove React.FC from Accordion.tsx

- [x] 1.1 Convert `AccordionHeader: React.FC<AccordionHeaderProps>` to explicit const with typed props
- [x] 1.2 Convert `AccordionItem: React.FC<AccordionItemProps>` to explicit const with typed props
- [x] 1.3 Convert `Accordion: React.FC<AccordionProps>` to explicit const with typed props
- [x] 1.4 Verify TypeScript compilation passes for Accordion.tsx

## 2. Remove React.FC from BundleManager.tsx

- [x] 2.1 Convert `BundleManagerHeader: React.FC<BundleManagerHeaderProps>` to explicit const with typed props
- [x] 2.2 Convert `BundleManagerItem: React.FC<BundleManagerItemProps>` to explicit const with typed props
- [x] 2.3 Convert `BundleManager: React.FC<BundleManagerProps>` to explicit const with typed props
- [x] 2.4 Verify TypeScript compilation passes for BundleManager.tsx

## 3. Remove React.FC from Collection/index.tsx

- [x] 3.1 Convert `MakePageBundleItemKeyDialog: React.FC<MakePageBundleItemKeyDialogProps>` to explicit const with typed props
- [x] 3.2 Convert `CollectionListItems: React.FC<CollectionListItemsProps>` to explicit const with typed props
- [x] 3.3 Convert `Collection: React.FC<CollectionProps>` to explicit const with typed props
- [x] 3.4 Verify TypeScript compilation passes for Collection/index.tsx

## 4. Remove Legacy HoForm Code

- [x] 4.1 Verify no imports of HoForm exist in codebase (should be 0)
- [x] 4.2 Delete `frontend/src/components/HoForm/Updatable.tsx`
- [x] 4.3 Delete `frontend/src/components/HoForm/types.ts`
- [x] 4.4 Delete `frontend/src/components/HoForm/index.ts`
- [x] 4.5 Remove `frontend/src/components/HoForm/` directory

## 5. Validation

- [x] 5.1 Run TypeScript type checking: `cd frontend && npx tsc --noEmit`
- [x] 5.2 Verify no TypeScript errors introduced
- [x] 5.3 Run test suite: `cd frontend && npm test`
- [x] 5.4 Verify all tests pass (111 tests)
- [x] 5.5 Search codebase for remaining `React.FC` usage: should return 0 results
- [x] 5.6 Verify components render correctly in development mode

## 6. Documentation

- [x] 6.1 Verify all component type declarations follow the correct pattern
- [x] 6.2 Confirm no React.FC usage remains in codebase
