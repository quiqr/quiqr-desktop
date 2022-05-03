import * as React           from 'react';
import { Route }            from 'react-router-dom';
import Sidebar           from './../Sidebar';
import service              from './../../services/service';


export class SiteLibrarySidebar extends React.Component {
  constructor(props){

    super(props);
    this.state = {
      selectedMenuItem: 'local-all',
      tags: [],
    }
  }

  componentWillMount(){
    service.api.readConfPrefKey('sitesListingView').then((view)=>{
      this.setState({selectedMenuItem: view });
    });

    let tags = [];
    service.getConfigurations(true).then((c)=>{

      c.sites.forEach((site)=>{
        if(site.tags){
          site.tags.forEach((t)=>{
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

  saveSelectedMenuItem(item){
    service.api.saveConfPrefKey("sitesListingView",item);
    this.setState({selectedMenuItem:item});
  }

  renderWithRoute(history: {push:(path: string)=>void}){

    let basePath = `/sites`;

    let tagsMenus = [];
    this.state.tags.forEach((tag,index)=>{
      tagsMenus.push(
        {
          active: true,
          label: tag,
          selected: (this.state.selectedMenuItem === 'local-tags-'+tag ? true : false),
          onClick: ()=>{
            this.saveSelectedMenuItem('local-tags-'+tag);
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
              this.saveSelectedMenuItem('local-all');
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
              this.saveSelectedMenuItem('quiqr-cloud');
              history.push(`${basePath}/quiqr-cloud`)
            }
          },
        ]
      },
    ]

    return <Sidebar {...this.props} menus={menus} />
  }
}
