import { Routes, Route, useParams } from 'react-router-dom';
import SiteConfRouteGeneral from './SiteConfRouteGeneral';
import SiteConfRouteDogFoodSingle from './SiteConfRouteDogFoodSingle';
import SiteConfRouteModel from './SiteConfRouteModel';

interface SiteConfRoutedProps {
  siteKey: string;
  workspaceKey: string;
}

// Wrapper component for dogfoodIncludesMenu route that needs fileOverride param
const DogFoodIncludesMenuRoute = ({ siteKey, workspaceKey }: { siteKey: string; workspaceKey: string }) => {
  const { fileOverride } = useParams();
  return (
    <SiteConfRouteDogFoodSingle
      title="Menu Editor"
      singleKey="dogfoodIncludesMenu"
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      fileOverride={"quiqr/model/includes/" + decodeURIComponent(fileOverride || '')}
    />
  );
};

export const SiteConfRouted = ({ siteKey, workspaceKey }: SiteConfRoutedProps) => {
  return (
    <Routes>
      <Route path="/" element={<SiteConfRouteGeneral siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="etalage" element={<SiteConfRouteDogFoodSingle title="etalage" singleKey="dogfoodEtalageTemplateJson" siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="sitereadme" element={<SiteConfRouteDogFoodSingle title="Site Readme" singleKey="dogfoodReadmeSiteMd" siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="previewchecksettings" element={<SiteConfRouteDogFoodSingle title="Preview Check Settings" singleKey="dogfoodPreviewCheckSettings" siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="projectreadme" element={<SiteConfRouteDogFoodSingle title="Developers Readme" singleKey="dogfoodReadmeProjectMd" siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="general" element={<SiteConfRouteGeneral siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="model" element={<SiteConfRouteModel siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="dogfoodIncludesMenu/:fileOverride" element={<DogFoodIncludesMenuRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
    </Routes>
  );
};
