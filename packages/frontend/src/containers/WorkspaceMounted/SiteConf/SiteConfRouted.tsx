import { Routes, Route, useParams } from 'react-router';
import SiteConfRouteGeneral from './SiteConfRouteGeneral';
import SiteConfRouteDogFoodSingle from './SiteConfRouteDogFoodSingle';
import SiteConfRouteModel from './SiteConfRouteModel';

interface SiteConfRoutedProps {
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey?: number;
}

// Wrapper component for dogfoodIncludesMenu route that needs fileOverride param
const DogFoodIncludesMenuRoute = ({ siteKey, workspaceKey, modelRefreshKey }: { siteKey: string; workspaceKey: string; modelRefreshKey?: number }) => {
  const { fileOverride } = useParams();
  return (
    <SiteConfRouteDogFoodSingle
      title="Menu Editor"
      singleKey="dogfoodIncludesMenu"
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      fileOverride={"quiqr/model/includes/" + decodeURIComponent(fileOverride || '')}
      modelRefreshKey={modelRefreshKey}
    />
  );
};

export const SiteConfRouted = ({ siteKey, workspaceKey, modelRefreshKey }: SiteConfRoutedProps) => {
  return (
    <Routes>
      <Route path="/" element={<SiteConfRouteGeneral siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="etalage" element={<SiteConfRouteDogFoodSingle title="etalage" singleKey="dogfoodEtalageTemplateJson" siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="sitereadme" element={<SiteConfRouteDogFoodSingle title="Site Readme" singleKey="dogfoodReadmeSiteMd" siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="previewchecksettings" element={<SiteConfRouteDogFoodSingle title="Preview Check Settings" singleKey="dogfoodPreviewCheckSettings" siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="projectreadme" element={<SiteConfRouteDogFoodSingle title="Developers Readme" singleKey="dogfoodReadmeProjectMd" siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="general" element={<SiteConfRouteGeneral siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="model" element={<SiteConfRouteModel siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="dogfoodIncludesMenu/:fileOverride" element={<DogFoodIncludesMenuRoute siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
    </Routes>
  );
};
