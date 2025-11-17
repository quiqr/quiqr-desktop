import * as React                   from 'react';
import { Switch, Route }            from 'react-router-dom';
import  SiteConfRouteGeneral        from './SiteConfRouteGeneral';
import  SiteConfRouteDogFoodSingle  from './SiteConfRouteDogFoodSingle';
import  SiteConfRouteModel          from './SiteConfRouteModel';

export class SiteConfRouted extends React.Component {

  render(){
    return (
    <Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' exact render={ ({match})=> {
        return <SiteConfRouteGeneral
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/etalage' exact render={ ({match})=> {
        return <SiteConfRouteDogFoodSingle
        title="etalage"
        singleKey="dogfoodEtalageTemplateJson"
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/sitereadme' exact render={ ({match})=> {
        return <SiteConfRouteDogFoodSingle
        title="Site Readme"
        singleKey="dogfoodReadmeSiteMd"
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/previewchecksettings' exact render={ ({match})=> {
        return <SiteConfRouteDogFoodSingle
        title="Preview Check Settings"
        singleKey="dogfoodPreviewCheckSettings"
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/projectreadme' exact render={ ({match})=> {
        return <SiteConfRouteDogFoodSingle
        title="Developers Readme"
        singleKey="dogfoodReadmeProjectMd"
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

      <Route path='/sites/:site/workspaces/:workspace/siteconf/dogfoodIncludesMenu/:fileOverride' exact render={ ({match})=> {
        return <SiteConfRouteDogFoodSingle
        title="Menu Editor"
        singleKey="dogfoodIncludesMenu"
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        fileOverride={ "quiqr/model/includes/" + decodeURIComponent(match.params.fileOverride) }
        />
      }} />



    </Switch>

    );
  }
}
