import * as React from 'react';
import { Route } from 'react-router-dom';
import  Prefs  from './Prefs';

export class PrefsRouted extends React.Component {

    render(){
        return (<Route
            path={'/prefs'}
            render={({history,match})=>{
                return (<Prefs
                />);
            }}
        />);
    }
}
