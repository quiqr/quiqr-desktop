import { lazy, ComponentType } from 'react';
import type { DialogPropsMap, BaseDialogProps } from './types';

/**
 * Central registry of all dialog components with lazy loading for code-splitting
 * Each dialog component is loaded only when first opened
 */
export const DialogRegistry: {
  [K in keyof DialogPropsMap]: ComponentType<DialogPropsMap[K] & BaseDialogProps>;
} = {
  // Site Library dialogs
  RenameSiteDialog: lazy(() => import('../containers/SiteLibrary/dialogs/RenameSiteDialog')),
  DeleteSiteDialog: lazy(() => import('../containers/SiteLibrary/dialogs/DeleteSiteDialog')),
  CopySiteDialog: lazy(() => import('../containers/SiteLibrary/dialogs/CopySiteDialog')),
  EditSiteTagsDialogs: lazy(() => import('../containers/SiteLibrary/dialogs/EditSiteTagsDialogs')),
  NewSlashImportSiteDialog: lazy(() => import('../containers/SiteLibrary/dialogs/NewSlashImportSiteDialog')),
  SelectWorkspaceDialog: lazy(() => import('../containers/SiteLibrary/dialogs/SelectWorkspaceDialog')),

  // Global dialogs
  SplashDialog: lazy(() => import('../dialogs/SplashDialog')),
  InfoDialog: lazy(() => import('../components/InfoDialog/InfoDialog')),
};
