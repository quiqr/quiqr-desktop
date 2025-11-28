import React from 'react';
import { Switch, Route } from "react-router-dom";
import SiteDialogsContainer from "./dialogs/SiteDialogsContainer";
import SiteGridView from "./components/SiteGridView";
import SiteListView from "./components/SiteListView";
import Spinner from "./../../components/Spinner";
import { History } from 'history';
import { SiteConfig } from "./../../../types";
import { useSiteLibraryData } from "./hooks/useSiteLibraryData";
import { useSiteDialogs } from "./hooks/useSiteDialogs";
import { useSiteOperations } from "./hooks/useSiteOperations";
import { filterAndSortSites } from "./utils/siteFiltering";

interface SiteLibraryRoutedProps {
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
  activeLibraryView?: string;
  handleLibraryDialogCloseClick: () => void;
}

const SiteLibraryRouted = ({ newSite, importSite, importSiteURL, activeLibraryView, handleLibraryDialogCloseClick }: SiteLibraryRoutedProps) => {
  const historyRef = React.useRef<History | null>(null);

  const { configurations, quiqrCommunityTemplates, localsites, sitesListingView, error: quiqrCommunityTemplatesError, updateLocalSites } = useSiteLibraryData();

  const { dialogState, openDialog, closeDialog } = useSiteDialogs({ newSite, importSite, importSiteURL });

  const { mountSiteByKey, mountSite } = useSiteOperations(historyRef);

  // Local state for blocking operations
  const [blockingOperation] = React.useState<string | null | React.ReactNode>(null);
  const [showSpinner] = React.useState(false);

  const handleSiteClick = React.useCallback(
    (site: SiteConfig) => {
      if (site.template) {
        openDialog("newSlashImport", site, site.importSiteURL);
      } else {
        mountSite(site);
      }
    },
    [mountSite, openDialog]
  );

  const handleMenuAction = React.useCallback(
    (action: string, site: SiteConfig) => {
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
    },
    [openDialog, handleSiteClick]
  );

  const renderCards = React.useCallback(
    (sites: SiteConfig[], listTitle: string) => {
      return (
        <SiteGridView sites={sites} listTitle={listTitle} error={quiqrCommunityTemplatesError} onSiteClick={handleSiteClick} onMenuAction={handleMenuAction} />
      );
    },
    [quiqrCommunityTemplatesError, handleSiteClick, handleMenuAction]
  );

  const renderList = React.useCallback(
    (sites: SiteConfig[], listTitle: string) => {
      return <SiteListView sites={sites} listTitle={listTitle} onSiteClick={handleSiteClick} onMenuAction={handleMenuAction} />;
    },
    [handleSiteClick, handleMenuAction]
  );

  const renderSelectSites = React.useCallback(
    (source: string, sourceArgument: string | null) => {
      if (showSpinner || configurations == null) {
        return <Spinner />;
      }

      const { sites, listTitle } = filterAndSortSites(source, sourceArgument, configurations, quiqrCommunityTemplates, sitesListingView);

      return activeLibraryView === "cards" ? renderCards(sites, listTitle) : renderList(sites, listTitle);
    },
    [showSpinner, configurations, quiqrCommunityTemplates, sitesListingView, activeLibraryView, renderCards, renderList]
  );

  const renderDialogs = React.useCallback(() => {
    return (
      <SiteDialogsContainer
        dialogState={dialogState}
        localsites={localsites}
        blockingOperation={blockingOperation}
        onClose={closeDialog}
        onSuccess={updateLocalSites}
        onLibraryDialogClose={handleLibraryDialogCloseClick}
        mountSiteByKey={mountSiteByKey}
      />
    );
  }, [dialogState, localsites, blockingOperation, closeDialog, updateLocalSites, handleLibraryDialogCloseClick, mountSiteByKey]);

  if (configurations == null) {
    return <Spinner />;
  }

  return (
    <React.Fragment>
      <Switch>
        <Route
          path='/sites/import-site-url/:url'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const url = decodeURIComponent(match.params.refresh);
            return renderSelectSites(url, null);
          }}
        />
        <Route
          path='/sites/import-site/:refresh'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const refresh = decodeURIComponent(match.params.refresh);
            return renderSelectSites(refresh, null);
          }}
        />
        <Route
          path='/sites/:source'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const source = decodeURIComponent(match.params.source);
            return renderSelectSites(source, null);
          }}
        />

        <Route
          path='/sites/:source/:args'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const source = decodeURIComponent(match.params.source);
            const sourceArgument = decodeURIComponent(match.params.args);
            return renderSelectSites(source, sourceArgument);
          }}
        />

        <Route
          path='/'
          render={({ history }) => {
            historyRef.current = history;
            return renderSelectSites("last", null);
          }}
        />
        <Route
          path='/sites'
          render={({ history }) => {
            historyRef.current = history;
            return renderSelectSites("last", null);
          }}
        />
      </Switch>

      {renderDialogs()}
    </React.Fragment>
  );
};

export default SiteLibraryRouted;
