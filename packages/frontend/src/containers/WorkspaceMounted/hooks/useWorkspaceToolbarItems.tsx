import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BuildIcon from '@mui/icons-material/Build';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SyncIcon from '@mui/icons-material/Sync';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { ToolbarButton } from '../../TopToolbarRight';
import service from '../../../services/service';

interface UseWorkspaceToolbarItemsConfig {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
  activeSection: 'content' | 'sync' | 'tools';
  showPreviewButton: boolean;
  previewButtonDisabled: boolean;
  onPreviewClick: () => void;
}

interface ToolbarItemsResult {
  leftItems: ReactNode[];
  centerItems: ReactNode[];
  rightItems: ReactNode[];
}

function useWorkspaceToolbarItems({
  siteKey,
  workspaceKey,
  applicationRole,
  activeSection,
  showPreviewButton,
  previewButtonDisabled,
  onPreviewClick,
}: UseWorkspaceToolbarItemsConfig): ToolbarItemsResult {
  const navigate = useNavigate();

  const leftItems: ReactNode[] = [
    <ToolbarButton
      key="buttonContent"
      active={activeSection === 'content'}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}`}
      title="Content"
      icon={LibraryBooksIcon}
    />,
    <ToolbarButton
      key="buttonSync"
      active={activeSection === 'sync'}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`}
      title="Sync"
      icon={SyncIcon}
    />,
  ];

  if (applicationRole === 'siteDeveloper') {
    leftItems.push(
      <ToolbarButton
        key="buttonSiteConf"
        active={activeSection === 'tools'}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`}
        title="Tools"
        icon={BuildIcon}
      />
    );
  }

  const centerItems: ReactNode[] = [];
  if (showPreviewButton) {
    centerItems.push(
      <ToolbarButton
        key="buttonPreview"
        action={onPreviewClick}
        title="Preview Site"
        icon={OpenInBrowserIcon}
        disabled={previewButtonDisabled}
      />
    );
  }

  const rightItems: ReactNode[] = [
    <ToolbarButton
      key="buttonLog"
      action={() => service.api.showLogWindow()}
      title="Log"
      icon={DeveloperModeIcon}
    />,
    <ToolbarButton
      key="buttonLibrary"
      action={() => {
        service.api.openSiteLibrary().then(() => {
          navigate('/sites/last');
        });
      }}
      title="Site Library"
      icon={AppsIcon}
    />,
    <ToolbarButton
      key="buttonPrefs"
      to={`/prefs/?siteKey=${siteKey}`}
      title="Preferences"
      icon={SettingsApplicationsIcon}
    />,
  ];

  return { leftItems, centerItems, rightItems };
}

export default useWorkspaceToolbarItems;
