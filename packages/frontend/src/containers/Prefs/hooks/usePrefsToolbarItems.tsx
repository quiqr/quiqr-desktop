import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import { ToolbarButton } from '../../TopToolbarRight';
import { useToolbarActiveStates } from '../../../hooks/useToolbarActiveStates';

interface ToolbarItemsResult {
  leftItems: ReactNode[];
  rightItems: ReactNode[];
}

function usePrefsToolbarItems(): ToolbarItemsResult {
  const navigate = useNavigate();
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  
  // Get active states from shared hook
  const { isApplicationLogsActive, isSiteLibraryActive } = useToolbarActiveStates();

  let backurl = '/sites/last';
  if (sp.has('siteKey')) {
    const siteKey = sp.get('siteKey');
    backurl = `/sites/${siteKey}/workspaces/source`;
  }

  return {
    leftItems: [
      <ToolbarButton
        key="back"
        action={() => navigate(backurl)}
        title="Back"
        icon={ArrowBackIcon}
      />,
    ],
    rightItems: [
      <ToolbarButton
        key="toolbarbutton-library"
        active={isSiteLibraryActive}
        to="/sites/last"
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
        active={true}
        to="/prefs"
        title="Preferences"
        icon={SettingsApplicationsIcon}
      />,
    ],
  };
}

export default usePrefsToolbarItems;
