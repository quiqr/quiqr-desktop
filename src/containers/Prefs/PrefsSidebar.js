import * as React from 'react';
import { Route } from 'react-router-dom';
import Sidebar from './../Sidebar';

export class PrefsSidebar extends React.Component {

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history: {push:(path: string)=>void}){

    let menu = {
      title: 'Preferences',
      items: [
      {
        active: true,
        label: "General",
        onClick: ()=>{
          history.push('/prefs/general');
        }
      },
      {
        active: true,
        label: "Advanced",
        onClick: ()=>{
          history.push('/prefs/advanced');
        }
      }
      ]
    }

    return <Sidebar {...this.props} menus={[menu]} />
  }
}
