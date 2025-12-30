import DeleteSiteDialog from './DeleteSiteDialog';
import RenameSiteDialog from './RenameSiteDialog';
import CopySiteDialog from './CopySiteDialog';
import EditSiteTagsDialogs from './EditSiteTagsDialogs';
import NewSlashImportSiteDialog from './NewSlashImportSiteDialog';
import SelectWorkspaceDialog from './SelectWorkspaceDialog';
import { DialogState } from '../hooks/useSiteDialogs';
import { Workspace } from '../../../../types';

interface SiteDialogsContainerProps {
  dialogState: DialogState;
  onClose: () => void;
  onSuccess: () => void;
  onLibraryDialogClose: () => void;
  mountSiteByKey: (siteKey: string) => void;
  selectWorkspace: (siteKey: string, workspace: Workspace) => void;
}

const SiteDialogsContainer = ({
  dialogState,
  onClose,
  onSuccess,
  onLibraryDialogClose,
  mountSiteByKey,
  selectWorkspace,
}: SiteDialogsContainerProps) => {
  return (
    <>
      <DeleteSiteDialog open={dialogState.activeDialog === "delete"} siteconf={dialogState.siteconf} onClose={onClose} onSuccess={onSuccess} />

      <RenameSiteDialog
        open={dialogState.activeDialog === "rename"}
        siteconf={dialogState.siteconf}
        onClose={onClose}
        onSuccess={onSuccess}
        key={dialogState.siteconf.key + "rename"}
      />

      <CopySiteDialog
        open={dialogState.activeDialog === "copy"}
        siteconf={dialogState.siteconf}
        onClose={onClose}
        onSuccess={onSuccess}
        key={dialogState.siteconf.key + "copy"}
      />

      <EditSiteTagsDialogs
        open={dialogState.activeDialog === "editTags"}
        siteconf={dialogState.siteconf}
        onClose={onClose}
        onSuccess={onSuccess}
        key={dialogState.siteconf.key + "editTags"}
      />

      <NewSlashImportSiteDialog
        open={dialogState.activeDialog === "newSlashImport"}
        newOrImport={dialogState.newOrImport || "new"}
        importSiteURL={dialogState.importURL}
        mountSite={mountSiteByKey}
        onSuccess={() => {
          onLibraryDialogClose();
          onSuccess();
        }}
        onClose={() => {
          onLibraryDialogClose();
          onClose();
        }}
      />

      <SelectWorkspaceDialog
        open={dialogState.activeDialog === "selectWorkspace"}
        workspaces={dialogState.workspaces || []}
        onSelect={(workspace) => {
          selectWorkspace(dialogState.siteconf.key, workspace);
          onClose();
        }}
        onClose={onClose}
      />
    </>
  );
};

export default SiteDialogsContainer;
