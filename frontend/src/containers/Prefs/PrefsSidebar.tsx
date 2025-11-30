import * as React from 'react';
import Sidebar from './../Sidebar';

type PrefsSidebarProps = {
  menus?: any[];
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onToggleItemVisibility?: () => void;
  onLockMenuClicked?: () => void;
};

export class PrefsSidebar extends React.Component<PrefsSidebarProps> {

  render(){
    const menu = {
      title: 'Preferences',
      items: [
        {
          active: true,
          label: "General",
          to: '/prefs/general',
          exact: true,
        },
        {
          active: true,
          label: "Advanced",
          to: '/prefs/advanced',
          exact: true,
        }
      ]
    }

    return <Sidebar {...this.props} menus={[menu]} />
  }
}
