import { useContext } from 'react';
import { DialogContext } from '../contexts/DialogContext';

/**
 * Hook to access dialog management functions
 * Must be used within a DialogProvider
 *
 * @example
 * const { openDialog, closeDialog } = useDialog();
 *
 * // Type-safe dialog opening
 * openDialog('RenameSiteDialog', {
 *   siteconf: site,
 *   onSuccess: () => refreshSites()
 * });
 */
export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}
