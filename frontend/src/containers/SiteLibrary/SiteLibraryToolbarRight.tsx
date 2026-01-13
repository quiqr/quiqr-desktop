import { useNavigate } from "react-router";
import { ToolbarButton, ToolbarToggleButtonGroup } from "../TopToolbarRight";
import AppsIcon from "@mui/icons-material/Apps";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import InputIcon from "@mui/icons-material/Input";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { useDialog } from "../../hooks/useDialog";
import service from "../../services/service";

interface SiteLibraryToolbarItemsProps {
  activeLibraryView: string;
  handleChange: (viewName: string) => void;
}

/**
 * Hook that returns the toolbar button arrays for the Site Library view.
 * Use this with the new AppLayout toolbar prop.
 */
export const useSiteLibraryToolbarItems = ({
  activeLibraryView,
  handleChange,
}: SiteLibraryToolbarItemsProps) => {
  const navigate = useNavigate();
  const { openDialog } = useDialog();

  const leftItems = [
    <ToolbarButton
      key='buttonNewSite'
      action={() => openDialog('NewSlashImportSiteDialog', {
        newOrImport: 'new',
        mountSite: (siteKey: string) => {
          // Clear cache to ensure new site is in configurations
          service.clearCache();
          navigate(`/sites/${siteKey}/workspaces/main`);
        },
        onSuccess: () => {}
      })}
      title='New'
      icon={AddIcon}
    />,
    <ToolbarButton
      key='buttonImportSite'
      action={() => openDialog('NewSlashImportSiteDialog', {
        newOrImport: 'import',
        mountSite: (siteKey: string) => {
          // Clear cache to ensure new site is in configurations
          service.clearCache();
          navigate(`/sites/${siteKey}/workspaces/main`);
        },
        onSuccess: () => {}
      })}
      title='Import'
      icon={InputIcon}
    />,
  ];

  const centerItems = [
    <ToolbarToggleButtonGroup
      key='buttonViewGroup'
      activeOption={activeLibraryView}
      handleChange={handleChange}
      optionItems={[
        {
          icon: <ViewListIcon />,
          value: "list",
        },
        {
          icon: <ViewModuleIcon />,
          value: "cards",
        },
      ]}
    />,
  ];

  const rightItems = [
    <ToolbarButton
      key={"toolbarbutton-library"}
      active={true}
      action={() => navigate("/sites/last")}
      title='Site Library'
      icon={AppsIcon}
    />,
    <ToolbarButton
      key='buttonPrefs'
      action={() => navigate("/prefs/")}
      title='Preferences'
      icon={SettingsApplicationsIcon}
    />,
  ];

  return { leftItems, centerItems, rightItems };
};
