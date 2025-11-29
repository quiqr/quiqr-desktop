import DeleteSiteDialog from './DeleteSiteDialog';
import RenameSiteDialog from './RenameSiteDialog';
import CopySiteDialog from './CopySiteDialog';
import EditSiteTagsDialogs from './EditSiteTagsDialogs';
import NewSlashImportSiteDialog from './NewSlashImportSiteDialog';
import { DialogState } from '../hooks/useSiteDialogs';

interface SiteDialogsContainerProps {
  dialogState: DialogState;
  onClose: () => void;
  onSuccess: () => void;
  onLibraryDialogClose: () => void;
  mountSiteByKey: (siteKey: string) => void;
}

const SiteDialogsContainer = ({
  dialogState,
  onClose,
  onSuccess,
  onLibraryDialogClose,
  mountSiteByKey,
}: SiteDialogsContainerProps) => {
  return (
    <>
      <DeleteSiteDialog open={dialogState.activeDialog === "delete"} siteconf={dialogState.siteconf} onClose={onClose} onSuccess={onSuccess} />

      <RenameSiteDialog open={dialogState.activeDialog === "rename"} siteconf={dialogState.siteconf} onClose={onClose} onSuccess={onSuccess} />

      <CopySiteDialog
        open={dialogState.activeDialog === "copy"}
        siteconf={dialogState.siteconf}
        onClose={onClose}
        onSuccess={onSuccess}
        key={dialogState.siteconf.key}
      />

      <EditSiteTagsDialogs open={dialogState.activeDialog === "editTags"} siteconf={dialogState.siteconf} onClose={onClose} onSuccess={onSuccess} />

      <NewSlashImportSiteDialog
        open={dialogState.activeDialog === "newSlashImport"}
        newOrImport={dialogState.newOrImport || "new"}
        importSiteURL={dialogState.importURL}
        mountSite={mountSiteByKey}
        onSuccess={() => {
          onLibraryDialogClose();
          onSuccess();
        }}
        onClose={onClose}
      />
    </>
  );
};

export default SiteDialogsContainer;
