import React from 'react';
import DeleteSiteDialog from './DeleteSiteDialog';
import RenameSiteDialog from './RenameSiteDialog';
import CopySiteDialog from './CopySiteDialog';
import EditSiteTagsDialogs from './EditSiteTagsDialogs';
import NewSlashImportSiteDialog from './NewSlashImportSiteDialog';
import BlockDialog from '../../../components/BlockDialog';
import service from '../../../services/service';
import { DialogState } from '../hooks/useSiteDialogs';

interface SiteDialogsContainerProps {
  dialogState: DialogState;
  localsites: string[];
  blockingOperation: string | null | React.ReactNode;
  onClose: () => void;
  onSuccess: () => void;
  onLibraryDialogClose: () => void;
  mountSiteByKey: (siteKey: string) => void;
}

const SiteDialogsContainer = ({
  dialogState,
  localsites,
  blockingOperation,
  onClose,
  onSuccess,
  onLibraryDialogClose,
  mountSiteByKey,
} : SiteDialogsContainerProps) => {
  return (
    <div>
      <DeleteSiteDialog
        open={dialogState.activeDialog === "delete"}
        siteconf={dialogState.siteconf}
        onCancelClick={onClose}
        onDelete={(siteKey) => {
          service.api.deleteSite(siteKey);
          onSuccess();
          onClose();
        }}
      />

      <RenameSiteDialog
        open={dialogState.activeDialog === "rename"}
        localsites={localsites}
        siteconf={dialogState.siteconf}
        onCancelClick={onClose}
        onSavedClick={() => {
          onSuccess();
          onClose();
        }}
      />

      <CopySiteDialog
        open={dialogState.activeDialog === "copy"}
        localsites={localsites}
        siteconf={dialogState.siteconf}
        onCancelClick={onClose}
        onSavedClick={() => {
          onSuccess();
          onClose();
        }}
      />

      <EditSiteTagsDialogs
        open={dialogState.activeDialog === "editTags"}
        siteconf={dialogState.siteconf}
        onCancelClick={onClose}
        onSavedClick={() => {
          service.api.redirectTo("/sites/last", true);
          onClose();
        }}
      />

      <NewSlashImportSiteDialog
        open={dialogState.activeDialog === "newSlashImport"}
        onClose={() => {
          onLibraryDialogClose();
          onSuccess();
          onClose();
        }}
        newOrImport={dialogState.newOrImport || "new"}
        importSiteURL={dialogState.importURL}
        mountSite={(siteKey) => {
          mountSiteByKey(siteKey);
        }}
      />

      <BlockDialog open={blockingOperation != null}>{blockingOperation}</BlockDialog>
    </div>
  );
};

export default SiteDialogsContainer;
