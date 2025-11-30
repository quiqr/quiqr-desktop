import * as React   from 'react';
import Sidebar      from './../Sidebar';
import service      from './../../services/service';

interface SiteLibrarySidebarProps {
  [key: string]: unknown;
}

interface SiteLibrarySidebarState {
  tags: string[];
}

export class SiteLibrarySidebar extends React.Component<SiteLibrarySidebarProps, SiteLibrarySidebarState> {
  constructor(props: SiteLibrarySidebarProps){
    super(props);
    this.state = {
      tags: [],
    }
  }

  componentDidMount(){
    const tags: string[] = [];
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
      tags.sort((a, b) => {
        const nameA = a.toLowerCase();
        const nameB = b.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      this.setState({ tags });
    });
  }

  render(){
    const basePath = `/sites`;

    const tagsMenus = this.state.tags.map((tag) => ({
      active: true,
      label: tag,
      to: `${basePath}/tags/${tag}`,
    }));

    const menus = [
      {
        title: 'On this computer',
        items: [
          {
            active: true,
            label: "All",
            to: `${basePath}/local`,
          },
          {
            active: true,
            label: "Tags",
            childItems: tagsMenus,
          }
        ]
      },
      {
        title: 'Quiqr Templates',
        items: [
          {
            active: true,
            label: "Quiqr Community Templates",
            to: `${basePath}/quiqr-community-templates`,
          },
        ]
      },
    ];

    return <Sidebar {...this.props} menus={menus} />
  }
}
