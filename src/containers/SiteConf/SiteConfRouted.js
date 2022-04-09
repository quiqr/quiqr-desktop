import * as React        from 'react';
import { Switch, Route } from 'react-router-dom';
//import  {SiteConf,SiteConfDanger}         from './SiteConf';
import  SiteConfGeneral   from './SiteConfGeneral';
import  SiteConfDanger   from './SiteConfDanger';

export class SiteConfRouted extends React.Component {

  render(){
    return (
    <Switch>

      <Route path='/siteconf/:site/workspaces/:workspace' exact render={ ({match})=> {
        return <SiteConfGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/siteconf/:site/workspaces/:workspace/general' exact render={ ({match})=> {
        return <SiteConfGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/siteconf/:site/workspaces/:workspace/danger' exact render={ ({match})=> {
        return <SiteConfDanger
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

    </Switch>

    );
  }
}
