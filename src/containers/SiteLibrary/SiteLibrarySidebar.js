import * as React           from 'react';
import { Route }            from 'react-router-dom';
import Sidebar           from './../Sidebar';
//import service              from './../../services/service';


export class SiteLibrarySidebar extends React.Component {
  constructor(props){

    super(props);
    this.state = {
      selectedMenuItem: 'local-all'
    }
  }


  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history: {push:(path: string)=>void}){

    let basePath = `/sites`;

    let menus = [
      {
        title: 'On this computer',
        items: [
          {
            active: true,
            label: "All",
            selected: (this.state.selectedMenuItem==='local-all' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'local-all'});
              history.push(`${basePath}/local`)
            }
          },
        ]
      },
      {
        title: 'In my cloud',
        items: [
          {
            active: true,
            label: "Quiqr Cloud",
            selected: (this.state.selectedMenuItem==='quiqr-cloud' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'quiqr-cloud'});
              history.push(`${basePath}/quiqr-cloud`)
            }
          },
        ]
      },
    ]

    return <Sidebar {...this.props} menus={menus} />
  }
}
