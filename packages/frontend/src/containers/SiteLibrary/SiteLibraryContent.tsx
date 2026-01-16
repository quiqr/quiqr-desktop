import { useState } from "react";
import SiteGridView from "./components/SiteGridView";
import SiteListView from "./components/SiteListView";
import Spinner from "./../../components/Spinner";
import { SiteConfig } from "./../../../types";
import { useSiteLibraryData } from "./hooks/useSiteLibraryData";
import { useSiteOperations } from "./hooks/useSiteOperations";
import { useDialog } from "../../hooks/useDialog";
import { filterAndSortSites } from "./utils/siteFiltering";

interface SiteLibraryContentProps {
  source: string;
  sourceArgument?: string | null;
  activeLibraryView?: string;
}

const SiteLibraryContent = ({
  source,
  sourceArgument,
  activeLibraryView,
}: SiteLibraryContentProps) => {
  const { configurations, quiqrCommunityTemplates, sitesListingView, error: quiqrCommunityTemplatesError, updateLocalSites } = useSiteLibraryData();
  const { openDialog } = useDialog();

  const { mountSiteByKey, mountSite } = useSiteOperations();

  const [showSpinner] = useState(false);

  const handleSiteClick = (site: SiteConfig) => {
    if (site.template) {
      // Template site - open import dialog
      openDialog('NewSlashImportSiteDialog', {
        newOrImport: 'import',
        importSiteURL: site.importSiteURL,
        mountSite: mountSiteByKey,
        onSuccess: () => updateLocalSites()
      });
    } else {
      // Regular site - mount it
      mountSite(site);
    }
  };

  const handleMenuAction = (action: string, site: SiteConfig) => {
    switch (action) {
      case "rename":
        openDialog('RenameSiteDialog', {
          siteconf: site,
          onSuccess: () => updateLocalSites()
        });
        break;
      case "copy":
        openDialog('CopySiteDialog', {
          siteconf: site,
          onSuccess: () => updateLocalSites()
        });
        break;
      case "editTags":
        openDialog('EditSiteTagsDialogs', {
          siteconf: site,
          onSuccess: () => updateLocalSites()
        });
        break;
      case "delete":
        openDialog('DeleteSiteDialog', {
          siteconf: site,
          onSuccess: () => updateLocalSites()
        });
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
    <ViewComponent
      sites={sites}
      listTitle={listTitle}
      error={quiqrCommunityTemplatesError}
      onSiteClick={handleSiteClick}
      onMenuAction={handleMenuAction}
    />
  );
};

export default SiteLibraryContent;
