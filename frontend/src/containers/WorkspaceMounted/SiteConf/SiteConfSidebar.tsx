import * as React           from 'react';
import Sidebar              from './../../Sidebar';

interface SiteConfSidebarProps {
  siteKey: string;
  workspaceKey: string;
  [key: string]: unknown;
}

export class SiteConfSidebar extends React.Component<SiteConfSidebarProps> {

  render(){
    const { siteKey, workspaceKey } = this.props;
    const basePath = `/sites/${siteKey}/workspaces/${workspaceKey}/siteconf`;

    const menus = [
      {
        title: 'Site Information',
        items: [
          {
            active: true,
            label: "Mount Information",
            to: `${basePath}/general/`,
          },
          {
            active: true,
            label: "Etalage",
            to: `${basePath}/etalage/`,
          },
          {
            active: true,
            label: "Site Readme",
            to: `${basePath}/sitereadme/`,
          },
          {
            active: true,
            label: "Project Readme",
            to: `${basePath}/projectreadme/`,
          },
        ]
      },
      {
        title: 'Preview Check Settings',
        items: [
          {
            active: true,
            label: "Preview Check Settings",
            to: `${basePath}/previewchecksettings/`,
          },
        ]
      },
      {
        title: 'CMS',
        items: [
          {
            active: true,
            label: "Model",
            to: `${basePath}/model/`,
          },
        ]
      },
    ];

    return <Sidebar {...this.props} menus={menus} />
  }
}
