import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import  PrefsGeneral  from './PrefsGeneral';
import  PrefsAdvanced  from './PrefsAdvanced';

export class PrefsRouted extends React.Component {

  render(){
    return (
      <Switch>
        <Route
          path={'/prefs/general'}
          render={({history,match})=>{
            return (<PrefsGeneral
            />);
          }}
        />
        <Route
          path={'/prefs/advanced'}
          render={({history,match})=>{
            return (<PrefsAdvanced
            />);
          }}
        />
        <Route
          path={'/prefs'}
          render={({history,match})=>{
            return (<PrefsGeneral
            />);
          }}
        />


      </Switch>
    )
  }
}
