import { useState, useCallback, useRef, useMemo } from 'react';
import { SiteConfig } from '../../../../types';

export type DialogType = 'rename' | 'copy' | 'editTags' | 'delete' | 'newSlashImport';

export interface DialogState {
  activeDialog: DialogType | null;
  siteconf: SiteConfig;
  newOrImport?: 'new' | 'import';
  importURL?: string;
}

interface UseSiteDialogsProps {
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
}

export function useSiteDialogs({ newSite, importSite, importSiteURL }: UseSiteDialogsProps) {
  // Track previous props to detect changes
  const prevPropsRef = useRef({ newSite, importSite, importSiteURL });

  // Track manual dialog state (overrides prop-based state)
  const [manualDialogState, setManualDialogState] = useState<DialogState | null>(null);

  // Detect prop changes during render
  const propsChanged =
    prevPropsRef.current.newSite !== newSite ||
    prevPropsRef.current.importSite !== importSite ||
    prevPropsRef.current.importSiteURL !== importSiteURL;

  // Clear manual state when props change (allows props to control dialog again)
  if (propsChanged) {
    prevPropsRef.current = { newSite, importSite, importSiteURL };
    if (manualDialogState !== null) {
      setManualDialogState(null);
    }
  }

  // Compute dialog state: use manual state if set, otherwise derive from props
  const dialogState: DialogState = useMemo(() => {
    if (manualDialogState) {
      return manualDialogState;
    }

    if (newSite) {
      return {
        activeDialog: 'newSlashImport',
        siteconf: { key: '', name: '' },
        newOrImport: 'new'
      };
    }

    if (importSite) {
      return {
        activeDialog: 'newSlashImport',
        siteconf: { key: '', name: '' },
        newOrImport: 'import',
        importURL: importSiteURL
      };
    }

    return {
      activeDialog: null,
      siteconf: { key: '', name: '' }
    };
  }, [manualDialogState, newSite, importSite, importSiteURL]);

  const openDialog = useCallback((type: DialogType, siteconf?: SiteConfig, importURL?: string) => {
    setManualDialogState({
      activeDialog: type,
      siteconf: siteconf || { key: '', name: '' },
      newOrImport: type === 'newSlashImport' ? 'import' : undefined,
      importURL
    });
  }, []);

  const closeDialog = useCallback(() => {
    setManualDialogState({
      activeDialog: null,
      siteconf: { key: '', name: '' }
    });
  }, []);

  return { dialogState, openDialog, closeDialog };
}
