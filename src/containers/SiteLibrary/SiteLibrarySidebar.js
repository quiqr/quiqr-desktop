import * as React           from 'react';
import { Route }            from 'react-router-dom';
import Sidebar           from './../Sidebar';
import service              from './../../services/service';


export class SiteLibrarySidebar extends React.Component {
  constructor(props){

    super(props);
    this.state = {
      selectedMenuItem: 'local-all',
      tags: []
    }
  }

  componentWillMount(){
    let tags = [];
    service.getConfigurations(true).then((c)=>{

      c.sites.map((site,index)=>{
        if(site.tags){
          site.tags.map((t,index2)=>{
            if(!tags.includes(t)){
              tags.push(t);
            }
          })
        }

      })
      this.setState({tags:tags});
    });
  }

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history: {push:(path: string)=>void}){

    let basePath = `/sites`;

    let tagsMenus = [];
    this.state.tags.map((tag,index)=>{

      tagsMenus.push(
        {
          active: true,
          label: tag,
          selected: (this.state.selectedMenuItem === 'local-tags-'+index ? true : false),
          onClick: ()=>{
            this.setState({selectedMenuItem:'local-tags-'+index});
            history.push(`${basePath}/tags/${tag}`)
          }
        }
      );
    });

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
          {
            active: true,
            label: "Tags",
            childItems: tagsMenus,
          }
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
