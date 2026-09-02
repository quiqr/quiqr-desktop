import { Routes, Route, Navigate } from 'react-router';
import PrefsGeneral from './PrefsGeneral';
import PrefsAdvanced from './PrefsAdvanced';
import PrefsAppSettingsGeneral from './PrefsAppSettingsGeneral';
import PrefsApplicationStorage from './PrefsApplicationStorage';
import PrefsGit from './PrefsGit';
import PrefsLogging from './PrefsLogging';
import PrefsHugo from './PrefsHugo';
import PrefsVariables from './PrefsVariables';
import { useEnvironment } from '../../hooks/useEnvironment';

export const PrefsRouted = () => {
  const { isStandalone } = useEnvironment();

  // In standalone mode, instance settings are managed externally — redirect to general
  const instanceSettingsElement = isStandalone
    ? <Navigate to="/prefs/general" replace />
    : undefined;

  return (
    <Routes>
      <Route path="general" element={<PrefsGeneral />} />
      <Route path="advanced" element={<PrefsAdvanced />} />
      <Route path="appsettings-general" element={instanceSettingsElement || <PrefsAppSettingsGeneral />} />
      <Route path="storage" element={instanceSettingsElement || <PrefsApplicationStorage />} />
      <Route path="git" element={instanceSettingsElement || <PrefsGit />} />
      <Route path="logging" element={instanceSettingsElement || <PrefsLogging />} />
      <Route path="hugo" element={instanceSettingsElement || <PrefsHugo />} />
      <Route path="variables" element={instanceSettingsElement || <PrefsVariables />} />
      <Route path="*" element={<PrefsGeneral />} />
    </Routes>
  );
};
