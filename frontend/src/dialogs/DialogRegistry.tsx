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

  // TODO: Migrate these dialogs to the new system
  // Collection dialogs
  // DeleteItemKeyDialog: lazy(() => import('../containers/WorkspaceMounted/Collection/DeleteItemKeyDialog')),
  // EditItemKeyDialog: lazy(() => import('../containers/WorkspaceMounted/Collection/EditItemKeyDialog')),
  // CopyItemKeyDialog: lazy(() => import('../containers/WorkspaceMounted/Collection/CopyItemKeyDialog')),
  // CopyItemToLanguageDialog: lazy(() => import('../containers/WorkspaceMounted/Collection/CopyItemToLanguageDialog')),

  // Sync dialogs
  // SyncConfigDialog: lazy(() => import('../containers/WorkspaceMounted/Sync/components/SyncConfigDialog')),
  // SyncBusyDialog: lazy(() => import('../containers/WorkspaceMounted/Sync/components/SyncBusyDialog')),

  // Utility dialogs
  // ProgressDialog: lazy(() => import('../components/ProgressDialog')),
  // BlockDialog: lazy(() => import('../components/BlockDialog')),
  // SelectImagesDialog: lazy(() => import('../components/SelectImagesDialog')),
  // AIAssistDialog: lazy(() => import('../components/SukohForm/AIAssistDialog')),
};
