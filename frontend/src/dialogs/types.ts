import type { SiteConfig, Workspace } from '@quiqr/types';

/**
 * Type-safe mapping of dialog component names to their required props
 * This ensures compile-time type checking when opening dialogs
 */
export interface DialogPropsMap {
  // Site Library dialogs
  'RenameSiteDialog': {
    siteconf: SiteConfig;
    onSuccess: () => void;
  };
  'DeleteSiteDialog': {
    siteconf: SiteConfig;
    onSuccess: () => void;
  };
  'CopySiteDialog': {
    siteconf: SiteConfig;
    onSuccess: () => void;
  };
  'EditSiteTagsDialogs': {
    siteconf: SiteConfig;
    onSuccess: () => void;
  };
  'NewSlashImportSiteDialog': {
    newOrImport: 'new' | 'import';
    importSiteURL?: string;
    mountSite: (siteKey: string) => void;
    onSuccess: () => void;
  };
  'SelectWorkspaceDialog': {
    workspaces: Workspace[];
    onSelect: (workspace: Workspace) => void;
  };

  // Collection dialogs
  'DeleteItemKeyDialog': {
    itemKey: string;
    collectionKey: string;
    onSuccess: () => void;
  };
  'EditItemKeyDialog': {
    itemKey: string;
    collectionKey: string;
    onSuccess: () => void;
  };
  'CopyItemKeyDialog': {
    itemKey: string;
    collectionKey: string;
    onSuccess: () => void;
  };
  'CopyItemToLanguageDialog': {
    itemKey: string;
    onSuccess: () => void;
  };

  // Sync dialogs
  'SyncConfigDialog': {
    publishConf?: SiteConfig['publish'];
    modAction: 'Add' | 'Edit';
    onSuccess: () => void;
  };
  'SyncBusyDialog': {
    publishConf: SiteConfig['publish'];
    closeText?: string;
  };

  // Global dialogs
  'SplashDialog': {
    showSplashAtStartup: boolean;
    onChangeSplashCheck: (checked: boolean) => void;
  };
  'InfoDialog': {
    title: string;
    message: string;
  };
  'ProgressDialog': {
    title: string;
    message: string;
  };
  'BlockDialog': {
    title: string;
    message: string;
  };
  'SelectImagesDialog': {
    onSelect: (images: string[]) => void;
  };
  'AIAssistDialog': {
    compositeKey: string;
  };
}

/**
 * Base props that all dialogs receive from the DialogRenderer
 */
export interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
}
