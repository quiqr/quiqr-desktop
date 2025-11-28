import { Switch, Route } from "react-router-dom";
import SiteLibraryContent from "./SiteLibraryContent";

interface SiteLibraryRoutedProps {
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
  activeLibraryView?: string;
  handleLibraryDialogCloseClick: () => void;
}

const SiteLibraryRouted = ({ newSite, importSite, importSiteURL, activeLibraryView, handleLibraryDialogCloseClick }: SiteLibraryRoutedProps) => {
  return (
    <Switch>
      <Route
        path='/sites/import-site-url/:url'
        exact
        render={({ match, history }) => {
          const url = decodeURIComponent(match.params.url);
          return (
            <SiteLibraryContent
              source={url}
              sourceArgument={null}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />
      <Route
        path='/sites/import-site/:refresh'
        exact
        render={({ match, history }) => {
          const refresh = decodeURIComponent(match.params.refresh);
          return (
            <SiteLibraryContent
              source={refresh}
              sourceArgument={null}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />
      <Route
        path='/sites/:source'
        exact
        render={({ match, history }) => {
          const source = decodeURIComponent(match.params.source);
          return (
            <SiteLibraryContent
              source={source}
              sourceArgument={null}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />

      <Route
        path='/sites/:source/:args'
        exact
        render={({ match, history }) => {
          const source = decodeURIComponent(match.params.source);
          const sourceArgument = decodeURIComponent(match.params.args);
          return (
            <SiteLibraryContent
              source={source}
              sourceArgument={sourceArgument}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />

      <Route
        path='/'
        render={({ history }) => {
          return (
            <SiteLibraryContent
              source="last"
              sourceArgument={null}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />
      <Route
        path='/sites'
        render={({ history }) => {
          return (
            <SiteLibraryContent
              source="last"
              sourceArgument={null}
              newSite={newSite}
              importSite={importSite}
              importSiteURL={importSiteURL}
              activeLibraryView={activeLibraryView}
              handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
              historyObj={history}
            />
          );
        }}
      />
    </Switch>
  );
};

export default SiteLibraryRouted;
