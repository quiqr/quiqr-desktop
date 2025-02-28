import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import  PrefsGeneral  from './PrefsGeneral';
import  PrefsVars  from './PrefsVars';
import  PrefsAdvanced  from './PrefsAdvanced';

export class PrefsRouted extends React.Component {

  render(){
    return (
      <Switch>
        <Route
          path={'/prefs/general'}
          render={()=>{
            return (<PrefsGeneral
            />);
          }}
        />
        <Route
          path={'/prefs/vars'}
          render={()=>{
            return (<PrefsVars
            />);
          }}
        />
        <Route
          path={'/prefs/advanced'}
          render={()=>{
            return (<PrefsAdvanced
            />);
          }}
        />
        <Route
          path={'/prefs'}
          render={()=>{
            return (<PrefsGeneral
            />);
          }}
        />


      </Switch>
    )
  }
}
