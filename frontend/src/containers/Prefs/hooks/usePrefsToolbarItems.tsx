import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { ToolbarButton } from '../../TopToolbarRight';

interface ToolbarItemsResult {
  leftItems: ReactNode[];
  rightItems: ReactNode[];
}

function usePrefsToolbarItems(): ToolbarItemsResult {
  const navigate = useNavigate();
  const location = useLocation();
  const sp = new URLSearchParams(location.search);

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
        to="/sites/last"
        title="Site Library"
        icon={AppsIcon}
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
