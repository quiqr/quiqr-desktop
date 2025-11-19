import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import  PrefsGeneral  from './PrefsGeneral';
import  PrefsAdvanced  from './PrefsAdvanced';

interface PrefsRoutedProps {}

interface PrefsRoutedState {}

export class PrefsRouted extends React.Component<PrefsRoutedProps, PrefsRoutedState> {

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
