import { createContext } from 'react';
import type { DialogPropsMap } from '../dialogs/types';

/**
 * Represents a single active dialog in the dialog stack
 *
 * Uses `any` for props because:
 * 1. Type safety is enforced at the call site via openDialog<K>(component: K, props: DialogPropsMap[K])
 * 2. A heterogeneous array (DialogState[]) cannot maintain the correlation between
 *    component names and prop types without type casts
 * 3. Runtime safety is guaranteed by the DialogProvider implementation
 * 4. This is a bounded `any` - props must be one of the types in DialogPropsMap
 *
 * Alternative would be Zod validation at render time, but that adds runtime overhead
 * for safety that's already guaranteed by the type-safe openDialog API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DialogState<T = any> {
  id: string;
  component: string;
  props: T;
  priority: number;
}

/**
 * The context value provided by DialogProvider
 * Enables type-safe dialog management throughout the app
 */
export interface DialogContextValue {
  /**
   * Open a dialog by component name with type-safe props
   * @returns Dialog instance ID for programmatic closing
   */
  openDialog: <K extends keyof DialogPropsMap>(
    component: K,
    props: DialogPropsMap[K]
  ) => string;

  /**
   * Close a specific dialog by ID, or all dialogs if no ID provided
   */
  closeDialog: (id?: string) => void;

  /**
   * Array of currently active dialogs
   */
  activeDialogs: DialogState[];

  /**
   * Check if a specific dialog component is currently open
   */
  isDialogOpen: (component: string) => boolean;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
