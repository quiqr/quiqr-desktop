import * as React        from 'react';
import { Switch, Route } from 'react-router-dom';
import  SyncRouteGeneral  from './SyncRouteGeneral';
import  SyncRouteModel    from './SyncRouteModel';

export class SyncRouted extends React.Component {


  render(){
    return (
    <Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' exact render={ ({match})=> {
        return <SyncRouteGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/general' exact render={ ({match})=> {
        return <SyncRouteGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/model' exact render={ ({match})=> {
        return <SyncRouteModel
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

    </Switch>

    );
  }
}
