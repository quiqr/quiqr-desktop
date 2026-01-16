import Sidebar from './../Sidebar';

interface PrefsSidebarProps {
  menus?: unknown[];
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onToggleItemVisibility?: () => void;
  onLockMenuClicked?: () => void;
}

export const PrefsSidebar = (props: PrefsSidebarProps) => {
  const menu = {
    title: 'Preferences',
    items: [
      {
        active: true,
        label: 'General',
        to: '/prefs/general',
        exact: true,
      },
      {
        active: true,
        label: 'Advanced',
        to: '/prefs/advanced',
        exact: true,
      },
    ],
  };

  return <Sidebar {...props} menus={[menu]} />;
};
