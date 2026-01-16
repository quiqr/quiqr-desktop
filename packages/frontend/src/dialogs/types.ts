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

  // Global dialogs
  'SplashDialog': {
    showSplashAtStartup: boolean;
    onChangeSplashCheck: (checked: boolean) => void;
  };
  'InfoDialog': {
    title: string;
    message: string;
  };
}

/**
 * Base props that all dialogs receive from the DialogRenderer
 */
export interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
}
