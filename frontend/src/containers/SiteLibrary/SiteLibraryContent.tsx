import { useEffect, useRef, useState } from "react";
import SiteDialogsContainer from "./dialogs/SiteDialogsContainer";
import SiteGridView from "./components/SiteGridView";
import SiteListView from "./components/SiteListView";
import Spinner from "./../../components/Spinner";
import { History } from "history";
import { SiteConfig } from "./../../../types";
import { useSiteLibraryData } from "./hooks/useSiteLibraryData";
import { useSiteDialogs } from "./hooks/useSiteDialogs";
import { useSiteOperations } from "./hooks/useSiteOperations";
import { filterAndSortSites } from "./utils/siteFiltering";

interface SiteLibraryContentProps {
  source: string;
  sourceArgument?: string | null;
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
  activeLibraryView?: string;
  handleLibraryDialogCloseClick: () => void;
  historyObj: History;
}

const SiteLibraryContent = ({
  source,
  sourceArgument,
  newSite,
  importSite,
  importSiteURL,
  activeLibraryView,
  handleLibraryDialogCloseClick,
  historyObj,
}: SiteLibraryContentProps) => {
  const historyRef = useRef<History | null>(historyObj);

  // Update historyRef when historyObj changes
  useEffect(() => {
    historyRef.current = historyObj;
  }, [historyObj]);

  const { configurations, quiqrCommunityTemplates, sitesListingView, error: quiqrCommunityTemplatesError, updateLocalSites } = useSiteLibraryData();

  const { dialogState, openDialog, closeDialog } = useSiteDialogs({ newSite, importSite, importSiteURL });

  const { mountSiteByKey, mountSite } = useSiteOperations(historyRef);

  const [showSpinner] = useState(false);

  const handleSiteClick = (site: SiteConfig) => {
    if (site.template) {
      openDialog("newSlashImport", site, site.importSiteURL);
    } else {
      mountSite(site);
    }
  };

  const handleMenuAction = (action: string, site: SiteConfig) => {
    switch (action) {
      case "rename":
        openDialog("rename", site);
        break;
      case "copy":
        openDialog("copy", site);
        break;
      case "editTags":
        openDialog("editTags", site);
        break;
      case "delete":
        openDialog("delete", site);
        break;
      case "import":
        handleSiteClick(site);
        break;
    }
  };

  if (showSpinner || configurations == null) {
    return <Spinner />;
  }

  const { sites, listTitle } = filterAndSortSites(source, sourceArgument || null, configurations, quiqrCommunityTemplates, sitesListingView);

  const ViewComponent = activeLibraryView === "cards" ? SiteGridView : SiteListView;

  return (
    <>
      <ViewComponent sites={sites} listTitle={listTitle} error={quiqrCommunityTemplatesError} onSiteClick={handleSiteClick} onMenuAction={handleMenuAction} />

      <SiteDialogsContainer
        dialogState={dialogState}
        onClose={closeDialog}
        onSuccess={updateLocalSites}
        onLibraryDialogClose={handleLibraryDialogCloseClick}
        mountSiteByKey={mountSiteByKey}
      />
    </>
  );
};

export default SiteLibraryContent;
