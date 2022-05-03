import * as React from 'react';
import { Route } from 'react-router-dom';
import Sidebar from './../Sidebar';
import { samples } from './samples'

export class FormsCookbookSidebar extends React.Component{

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history){

    let menu = {
      title: 'Forms Cookbook',
      items: samples.map((sample)=>{
        return {
          active: false,
          label: sample.title,
          onClick: ()=>{
            history.push('/forms-cookbook/'+sample.key)
          }
        }
      })
    }

    return <Sidebar {...this.props} menus={[menu]} />
  }
}
