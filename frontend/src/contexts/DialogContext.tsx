import { createContext } from 'react';
import type { DialogPropsMap } from '../dialogs/types';

/**
 * Represents a single active dialog in the dialog stack
 */
export interface DialogState<T = any> {
  id: string;
  component: string;
  props: T;
  priority: number; // For z-index stacking (higher = on top)
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
