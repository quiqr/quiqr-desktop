import * as React        from 'react';
import { Switch, Route } from 'react-router-dom';
import  SiteConfRouteGeneral  from './SiteConfRouteGeneral';
import  SiteConfRouteModel    from './SiteConfRouteModel';
import  SiteConfRouteDanger   from './SiteConfRouteDanger';

export class SiteConfRouted extends React.Component {


  render(){
    return (
    <Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' exact render={ ({match})=> {
        return <SiteConfRouteGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/general' exact render={ ({match})=> {
        return <SiteConfRouteGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/model' exact render={ ({match})=> {
        return <SiteConfRouteModel
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/danger' exact render={ ({match})=> {
        return <SiteConfRouteDanger
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

    </Switch>

    );
  }
}
