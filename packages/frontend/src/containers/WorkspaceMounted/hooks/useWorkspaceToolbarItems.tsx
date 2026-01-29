import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SyncIcon from '@mui/icons-material/Sync';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { ToolbarButton } from '../../TopToolbarRight';
import { useToolbarActiveStates } from '../../../hooks/useToolbarActiveStates';
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
  
  // Get active states from shared hook
  const {
    isContentActive,
    isSyncActive,
    isToolsActive,
    isSiteLogsActive,
    isApplicationLogsActive,
    isSiteLibraryActive,
    isPreferencesActive,
  } = useToolbarActiveStates({ siteKey, workspaceKey });

  const leftItems: ReactNode[] = [
    <ToolbarButton
      key="buttonContent"
      active={isContentActive}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}`}
      title="Content"
      icon={LibraryBooksIcon}
    />,
    <ToolbarButton
      key="buttonSync"
      active={isSyncActive}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`}
      title="Sync"
      icon={SyncIcon}
    />,
  ];

  if (applicationRole === 'siteDeveloper') {
    leftItems.push(
      <ToolbarButton
        key="buttonSiteConf"
        active={isToolsActive}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`}
        title="Tools"
        icon={BuildIcon}
      />
    );
    leftItems.push(
      <ToolbarButton
        key="buttonSiteLog"
        active={isSiteLogsActive}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/logs`}
        title="Site Log"
        icon={DescriptionIcon}
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
      key="buttonLibrary"
      active={isSiteLibraryActive}
      action={() => {
        service.api.openSiteLibrary().then(() => {
          navigate('/sites/last');
        });
      }}
      title="Site Library"
      icon={AppsIcon}
    />,
    <ToolbarButton
      key="buttonApplicationLogs"
      active={isApplicationLogsActive}
      to="/logs/application"
      title="Application Logs"
      icon={DeveloperModeIcon}
    />,
    <ToolbarButton
      key="buttonPrefs"
      active={isPreferencesActive}
      to={`/prefs/?siteKey=${siteKey}`}
      title="Preferences"
      icon={SettingsApplicationsIcon}
    />,
  ];

  return { leftItems, centerItems, rightItems };
}

export default useWorkspaceToolbarItems;
