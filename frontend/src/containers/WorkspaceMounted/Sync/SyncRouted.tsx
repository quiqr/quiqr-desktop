import * as React from "react";
import { Switch, Route } from "react-router-dom";
import SyncRouteGeneral from "./SyncRouteGeneral";
import { SiteConfig } from "../../../../types";

interface WorkspaceConfig {
  [key: string]: unknown;
}

interface SyncRoutedProps {
  site: SiteConfig | null;
  workspace: WorkspaceConfig | null;
  siteKey: string;
  workspaceKey: string;
}

interface SyncRoutedState {}

export class SyncRouted extends React.Component<SyncRoutedProps, SyncRoutedState> {
  render() {
    return (
      <Switch>
        <Route
          path='/sites/:site/workspaces/:workspace/sync/add/:refresh'
          exact
          render={({ match }) => {
            return <SyncRouteGeneral {...this.props} addRefresh={decodeURIComponent(match.params.refresh)} />;
          }}
        />

        <Route
          path='/sites/:site/workspaces/:workspace/sync/list/:syncConfKey'
          exact
          render={({ match }) => {
            return <SyncRouteGeneral {...this.props} syncConfKey={decodeURIComponent(match.params.syncConfKey)} />;
          }}
        />

        <Route
          path='/sites/:site/workspaces/:workspace/sync/'
          exact
          render={({ match }) => {
            return <SyncRouteGeneral {...this.props} />;
          }}
        />
      </Switch>
    );
  }
}
